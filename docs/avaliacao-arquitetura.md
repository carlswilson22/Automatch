# Avaliação de Arquitetura e Auditoria Técnica — Automatch™

**Documento:** `docs/avaliacao-arquitetura.md`  
**Última Atualização:** Outubro de 2026  
**Status:** Aprovado e Implementado  
**Branch de Referência:** `fix/devops-compose-pipeline`

---

## 1. Visão Geral

Este documento consolida a avaliação arquitetural da plataforma **Automatch**, detalhando a auditoria de infraestrutura, diagnóstico de causa raiz, decisões técnicas e as correções aplicadas nos componentes de orquestração de containers, gateway reverso, pipeline de build e conectividade de banco de dados.

---

## 2. Infraestrutura

A infraestrutura do Automatch foi submetida a uma auditoria rigorosa de resiliência, observabilidade e robustez operacional, com foco na erradicação de remendos (*anti-patterns*) e resolução definitiva em nível de causa raiz.

### Matriz de Diagnóstico e Resolução

| ID | Componente / Problema | Diagnóstico Preliminar | Causa Raiz Real | Status / Solução |
|:---|:---|:---|:---|:---|
| **P1** | **Gateway Nginx x Frontend Produção** | 502 Bad Gateway intermitente em uploads e produção | Upstream estava correto (`frontend:80`), mas ausência de timeouts de proxy causava cortes de conexão em uploads pesados (laudos/vídeos) e respostas de IA. Headers WebSocket de HMR desnecessários no build estático. | **Corrigido**: Timeouts configurados (`connect 30s`, `send 120s`, `read 120s`), `proxy_buffering off` e limpeza de headers no ambiente de produção. |
| **P2** | **Base Path do Vite (Docker vs GitHub Pages)** | Risco de caminhos quebrados em assets e rotas SPA | Avaliação de portabilidade entre raiz (`/`) e subdiretórios de repositório (`/Automatch/`). | **Validado sem defeito**: A lógica do `vite.config.js` (`getBasePath`) já contempla dinamicamente os 3 cenários sem necessidade de remendos. |
| **P3** | **Dependência de Cache Redis** | Presença residual de referências a Redis na infraestrutura | Redis foi integralmente descartado nas revisões anteriores. Aplicação adota stateless JWT e rate-limiting em memória. | **Eliminado**: Zero dependências de Redis no backend, compose e requirements. |
| **P4** | **Backend Fora do Docker (Gating de Banco)** | Erro ao iniciar localmente fora do Compose | Sem `DATABASE_URL`, o código usava default `db:5432`, hostname exclusivo da rede interna do Docker. Falha só aparecia tarde na execução. | **Corrigido**: Mecanismo fail-fast no `database.py` que valida a resolução do host `db` e aborta com instruções claras (porta 5433 ou SQLite dev). SQLite proibido em produção. |
| **P5** | **Health Checks & Probes de Orquestração** | Ausência de endpoints padronizados de saúde | Backend não possuía rotas de liveness/readiness e o Gateway iniciava antes do backend estar pronto. | **Corrigido**: Criados endpoints `/api/health` e `/api/health/ready`, integrados healthchecks no Docker Compose dev/prod e sincronizado startup do Gateway. |

---

### Detalhamento dos Problemas e Correções

#### Problema 1 — Gateway Nginx: Robustez e Resiliência em Produção

* **Sintoma:** Erros 502/504 Bad Gateway sob carga, timeout ao enviar fotos de alta resolução para o scanner pericial e arquivos de vídeo veicular.
* **Causa Raiz:**
  1. O arquivo `gateway/nginx.prod.conf` direcionava o tráfego de frontend para `frontend:80` (correto para o container Nginx com bundle compilado), porém mantinha headers de handshake WebSocket (`Upgrade` e `Connection "upgrade"`) que não possuem finalidade em produção (onde não há servidor HMR do Vite).
  2. Nenhuma diretiva de timeout estava explícita para o upstream `backend_service`. O Nginx utilizava o padrão de 60 segundos, insuficiente para pipelines combinados de processamento de imagens (YOLOv8 + compressão PIL LANCZOS).
* **Solução Implementada:**
  - Em `gateway/nginx.conf` e `gateway/nginx.prod.conf`, adicionadas diretivas de timeout estendido no bloco `/api/`:
    ```nginx
    proxy_connect_timeout 30s;
    proxy_send_timeout 120s;
    proxy_read_timeout 120s;
    proxy_buffering off;
    ```
  - Em `gateway/nginx.prod.conf`, removida a injeção indevida de headers WebSocket no bloco `/`, mantendo `proxy_http_version 1.1` para persistência de conexões (*keep-alive*).

---

#### Problema 2 — Base Path do Vite e Portabilidade de Assets

* **Sintoma:** Risco de assets 404 e quebra de roteamento client-side em ambientes com caminhos base distintos.
* **Causa Raiz & Análise Técnica:**
  - O projeto é distribuído em múltiplos alvos:
    1. **Ambiente Local / Docker Compose:** O tráfego ingressa na raiz (`http://localhost/` ou `http://localhost:5173/`), exigindo `base: '/'`.
    2. **Container de Produção:** Nginx serve a pasta `/usr/share/nginx/html/` na raiz (`/`).
    3. **GitHub Pages (CI/CD):** Hospedado sob subcaminho relativo ao repositório (ex: `https://campusceub.github.io/ADS-AUTOMATCH/`), exigindo base `/ADS-AUTOMATCH/`.
* **Veredicto e Evidências:**
  - A função `getBasePath()` em `frontend/vite.config.js` prioriza `process.env.VITE_BASE_PATH`, decai para `process.env.GITHUB_REPOSITORY` e adota `/` como padrão seguro.
  - O `frontend/src/App.jsx` consome `basename={import.meta.env.BASE_URL}`, assegurando paridade entre roteamento e base de compilação.
  - O utilitário `frontend/src/utils/imageHelper.js` concatena URLs com `import.meta.env.BASE_URL`.
  - **Nenhum remendo foi necessário**, certificando a robustez da solução existente.

---

#### Problema 3 — Avaliação e Descarte da Dependência do Redis

* **Sintoma:** Documentações antigas citavam uso de Redis para cache e rate-limiting.
* **Auditoria de Código:**
  - Varredura exaustiva por regex `redis` em arquivos `.py`, `.yml`, `.yaml`, `.txt`, `.cfg` e `.toml`. Resultado: **0 ocorrências**.
  - Rate limiting é gerenciado no FastAPI de forma stateless ou via middleware em memória.
  - Sessões de autenticação utilizam tokens JWT auto-contidos (*stateless*).
* **Decisão Arquitetural:**
  - Manter o Redis eliminado. A adição de um serviço Redis sem demanda de volume real representaria sobrecarga de memória (50MB+), latência de rede e ponto único de falha desnecessário.

---

#### Problema 4 — Inicialização do Backend Fora do Docker

* **Sintoma:** Desenvolvedores executando `python main.py` ou `uvicorn main:app` na máquina host recebiam erros de conexão não intuitivos do SQLAlchemy.
* **Causa Raiz:**
  - `database.py` utilizava como fallback incondicional a URL `postgresql://postgres:postgres@db:5432/automatch`. O hostname `db` só é resolúvel dentro da rede de bridge criada pelo Docker Compose.
* **Solução Implementada:**
  - Adicionado teste de resolução de socket no import de `backend/database.py`:
    ```python
    if not os.getenv("DATABASE_URL") and "db:5432" in DATABASE_URL:
        import socket
        try:
            socket.getaddrinfo("db", 5432)
        except socket.gaierror:
            raise RuntimeError(
                "[CONFIGURAÇÃO AUSENTE] Backend executando fora do Docker sem DATABASE_URL.\n"
                "  Opção 1: DATABASE_URL=postgresql://postgres:postgres@localhost:5433/automatch\n"
                "  Opção 2: DATABASE_MODE=sqlite (apenas desenvolvimento)"
            )
    ```
  - Preservada a regra de segurança mandante: `DATABASE_MODE=sqlite` em ambiente `ENVIRONMENT=production` dispara `RuntimeError` imediato.

---

#### Problema 5 — Probes de Observabilidade e Orquestração Docker

* **Sintoma:** O Gateway Nginx subia e recebia requisições antes do backend concluir a inicialização das tabelas e pré-aquecimento do modelo YOLOv8, gerando janelas temporárias de erro 502 no boot.
* **Solução Implementada:**
  1. **Endpoints de Saúde Padronizados:**
     - `GET /api/health`: Liveness probe leve que responde HTTP 200 `{"status": "ok"}` para validar o loop de eventos.
     - `GET /api/health/ready`: Readiness probe que executa query ativa no banco (`SELECT 1`) e checa permissões do diretório de uploads. Retorna HTTP 200 quando saudável ou HTTP 503 com status `degraded` em caso de indisponibilidade de recursos vitais.
     - **Blindagem de Segurança:** As respostas de erro não expõem senhas, connection strings, nomes de tabelas ou stack traces.
  2. **Configuração de Healthchecks no Docker:**
     - `docker-compose.yml` e `docker-compose.prod.yml`:
       ```yaml
       backend:
         healthcheck:
           test: ["CMD", "curl", "-f", "http://localhost:8000/api/health"]
           interval: 15s
           timeout: 5s
           retries: 3
           start_period: 30s # (45s em prod)
       ```
     - O serviço `gateway` agora especifica dependência estrita de saúde:
       ```yaml
       gateway:
         depends_on:
           backend:
             condition: service_healthy
           frontend:
             condition: service_started
       ```
  3. **Validação Automatizada:**
     - Criada a suíte `backend/test_health_probes.py` (4 testes cobrindo status 200, degradação 503, mascaramento de erros sensíveis e cabeçalhos OWASP), integrada ao workflow de CI.

---

## 3. Evidências de Validação e Homologação

1. **Sintaxe de Orquestração:**
   - `docker compose config --quiet` → Retorno 0 (Válido).
   - `docker compose -f docker-compose.prod.yml config --quiet` → Retorno 0 (Válido).
2. **Baterias de Testes Automatizados:**
   - `test_health_probes.py`: 4/4 testes aprovados.
   - `test_audit_full_battery.py` + `test_improvements_battery.py`: 15/15 cenários de regressão pericial, B2B, LGPD e rate limiting aprovados em 36.7s.
3. **Pipeline de Integração Contínua:**
   - Teste de health probes incluído no job `testar-backend` em `.github/workflows/ci.yml`.
