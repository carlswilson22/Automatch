# Arquitetura de Software — Automatch™

Este documento descreve a arquitetura de software, componentes, fluxo de dados, modelo de persistência e decisões técnicas que fundamentam a plataforma **Automatch**.

---

## 1. Contexto Técnico

A solução atende ao ecossistema de marketplace automotivo com foco em auditoria pericial e transparência. Seus principais desafios operacionais são:
- **Alta responsividade na análise visual**: Processamento de imagens em alta definição sem bloqueio da interface do usuário.
- **Isolamento e desacoplamento**: Separação clara entre a camada de apresentação, serviços de negócio, orquestração pericial e persistência de dados.
- **Segurança de transações e dados**: Criptografia de senhas, sessões autenticadas sem estado (*stateless JWT*) e mitigação de acessos não autorizados.

```mermaid
graph TD
    User([Cliente / Navegador]) -->|HTTP 80 / 3000| Gateway[Nginx Reverse Proxy]
    Gateway -->|/*| Frontend[React 18 + Vite SPA]
    Gateway -->|/api/*| Backend[FastAPI Python 3.11]
    Backend -->|Persistência Relacional| DB[(PostgreSQL 15)]
    Backend -->|Cache & Sessões| Cache[(Redis 7)]
    Backend -->|Visão Computacional| VisionEngine[OpenCV + YOLOv8 Engine]
    Backend -->|LLM Multimodal| GeminiAPI[Google Gemini 1.5 Flash Vision]
    Backend -->|Consultas Oficiais| ExternalGov[APIs DETRAN & FIPE]
```

---

## 2. Componentes do Sistema

| Componente | Tecnologia | Responsabilidade Principal |
| :--- | :--- | :--- |
| **API Gateway** | Nginx Alpine | Ponto de entrada unificado da aplicação, terminação HTTP, proxy reverso, compressão Gzip e roteamento de tráfego `/` e `/api/*`. |
| **Frontend (SPA)** | React 18, Vite, TailwindCSS | Interface do usuário responsiva, animações Framer Motion, visualizador 360° interativo e processamento de som Web Audio API. |
| **Backend API** | FastAPI / Python 3.11 | API RESTful assíncrona, validação de esquemas com Pydantic v2, autenticação JWT e orquestração de microsserviços. |
| **Motor de Visão Computacional** | OpenCV + YOLOv8 + PIL | Pré-processamento e compressão de fotos (*LANCZOS*), detecção de classes automotivas e mapeamento de avarias na lataria. |
| **Motor de Diagnóstico Acústico** | Python DSP + FFT / Web Audio | Análise espectral de frequências sonoras da marcha lenta e simulação de áudio mecânico. |
| **Banco de Dados Relacional** | PostgreSQL 15 | Armazenamento de dados persistentes de veículos, lojas, laudos periciais e usuários com SQLAlchemy ORM. |
| **Cache & Mensageria** | Redis 7 Alpine | Cache em memória de consultas veiculares de placas, cotas FIPE e controle de sessões. |
| **Agendador em Background** | APScheduler | Monitoramento periódico assíncrono (a cada 60 segundos) de débitos da Watchlist DETRAN. |

---

## 3. Integrações Externas

1. **Tabela FIPE (Fundação Instituto de Pesquisas Econômicas)**:
   - *Finalidade*: Consulta em tempo real do valor médio oficial de mercado por código FIPE e ano modelo.
   - *Resiliência*: Fallback inteligente para dados históricos em caso de indisponibilidade momentânea da API externa.
2. **DETRAN / SENATRAN (Bases Governamentais)**:
   - *Finalidade*: Checagem cadastral de débitos (IPVA, licenciamento e multas) e auditoria de restrições administrativas/judiciais (RENAJUD).
3. **Google Gemini Multimodal API (v1beta)**:
   - *Finalidade*: Laudo pericial visual descritivo e assistente virtual consultivo especializado no veículo via RAG.
4. **Agregadores Automotivos B2B (Webmotors, OLX, iCarros, Mercado Livre)**:
   - *Finalidade*: Sincronização automatizada de anúncios em múltiplos portais e exportação de Feed XML padronizado (`/api/integrations/feed.xml`).

---

## 4. Fluxo e Gestão de Dados

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Usuário / Vendedor
    participant Front as Frontend (React)
    participant Gate as Gateway (Nginx)
    participant Back as Backend (FastAPI)
    participant DB as PostgreSQL
    participant AI as IA Vision / Audio Engine

    Cliente->>Front: Envia fotos do veículo
    Front->>Gate: POST /api/analise-visual (Base64 / Multipart)
    Gate->>Back: Roteia requisição
    Back->>AI: Pré-processa imagem & executa inferência YOLO/CV
    AI-->>Back: Retorna coordenadas (X, Y), severidade e score
    Back->>DB: Salva registro do laudo cautelar
    Back-->>Gate: Resposta JSON com avarias mapeadas
    Gate-->>Front: Renderiza pins interativos e laudo na tela
```

- **Privacidade & LGPD**: Dados de contato de compradores e placas de veículos são transmitidos sob canal criptografado HTTPS/TLS e nunca expostos publicamente em feeds externos sem consentimento.

---

## 5. Decisões Técnicas (ADRs Sintetizadas)

- **ADR-01: Arquitetura em Microsserviços Conteinerizados via Docker Compose**:
  - *Decisão*: Isolar banco de dados, cache, backend, frontend e gateway em contêineres dedicados.
  - *Justificativa*: Facilidade de implantação, reprodutibilidade em qualquer ambiente e independência de versões.
- **ADR-02: Autenticação Stateless com JWT e Criptografia PBKDF2-HMAC-SHA256**:
  - *Decisão*: Utilizar tokens JWT assinados via HMAC-SHA256 e salts aleatórios para senhas.
  - *Justificativa*: Elimina necessidade de armazenar estado de sessão no servidor e atende aos mais rigorosos padrões de cibersegurança.
- **ADR-03: Motor Híbrido de Visão Computacional (Edge/Local + Cloud Fallback)**:
  - *Decisão*: Suportar inferência com YOLOv8/OpenCV local e Google Gemini Cloud.
  - *Justificativa*: Garante que a perícia visual funcione mesmo em ambientes sem conectividade com APIs de terceiros.

---

## 6. Riscos Técnicos e Estratégias de Mitigação

| Risco Identificado | Impacto | Estratégia de Mitigação |
| :--- | :---: | :--- |
| **Latência no upload de imagens pesadas** | Médio | Pré-compressão com algoritmo *LANCZOS* reduzindo fotos para 1024x1024 antes da transmissão. |
| **Indisponibilidade de APIs governamentais (DETRAN/FIPE)** | Alto | Cache persistente em Redis com expiração configurável e dados simulados de contingência. |
| **Sobrecarga em consultas concorrentes de estoque** | Médio | Pool assíncrono de conexões com SQLAlchemy e indexação por chaves primárias UUID e códigos FIPE. |

---

## 7. Hardening de Infraestrutura e Contêineres (CIS Benchmark & OWASP)

Em conformidade com as melhores práticas de segurança de contêineres, o sistema implementa segregação estrita entre os perfis de desenvolvimento e produção:

### 7.1. Matriz de Exposição de Portas e Redes

| Serviço | Porta Interna | Porta em Desenvolvimento (`docker-compose.yml`) | Porta em Produção (`docker-compose.prod.yml`) | Política de Isolamento |
| :--- | :---: | :---: | :---: | :--- |
| **`gateway`** | `80` | `80:80`, `3000:80` (Acesso Local) | `80:80`, `443:443` (Acesso Público) | Ponto único de entrada HTTP/HTTPS. |
| **`frontend`** | `5173` / `80` | `127.0.0.1:5173:5173` | **Nenhuma porta exposta no host** | Servido exclusivamente através do Gateway. |
| **`backend`** | `8000` | `127.0.0.1:8000:8000` (Docs Swagger) | **Nenhuma porta exposta no host** | Isolado 100% na rede interna `automatch-prod-network`. |
| **`db` (Postgres)** | `5432` | `127.0.0.1:5432:5432` (DBeaver Local) | **Nenhuma porta exposta no host** | Acessível unicamente pelo contêiner do `backend`. |
| **`redis`** | `6379` | `127.0.0.1:6379:6379` (Auth Ativa) | **Nenhuma porta exposta no host** | `--requirepass` obrigatório em todos os ambientes. |

### 7.2. ADR-04: Segregação de Perfis de Orquestração
- **Decisão**: Manter o `docker-compose.yml` voltado para DX (live-reload com volumes) e criar `docker-compose.prod.yml` com build imutável e multi-workers.
- **Justificativa**: Evita vazamento de portas de banco de dados para a internet em servidores de produção e padroniza a gestão de segredos através do `.env.example`.

