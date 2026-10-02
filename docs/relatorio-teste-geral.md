# Relatório de Teste e Diagnóstico Geral do Sistema — AutoMatch

**Data da Auditoria:** 02 de Outubro de 2026  
**Responsável:** Engenheiro de QA e Segurança Sênior  
**Escopo:** Teste Geral, Diagnóstico de Segurança, RBAC, Responsividade, Docker e CI/CD  
**Ambiente de Homologação/Produção:** GitHub Actions Runners (Ubuntu 24.04), GitHub Pages (`https://carlswilson22.github.io/Automatch/`), Node.js `v24.21.0`, Python 3.11, PostgreSQL 15, Redis 7.

---

## 1. Resumo Executivo

Durante a presente bateria de auditoria e testes do sistema AutoMatch, foi conduzida uma avaliação abrangente cobrindo:
1. **Funcionalidades por Perfil de Usuário** (Visitante anônimo, Comprador, Lojista e Administrador): navegação na Home, catálogo da Vitrine Digital, filtros combinados, página de detalhes com varredura 360°, Dossiê Oficial sob demanda, TCO, Consultor IA, Meus Anúncios, Gestão de Ativos (Dashboard) e Rede de Parceiros B2B.
2. **Permissões e Segurança Defensiva (OWASP Top 10)**: autenticação JWT, Broken Access Control (BOLA/IDOR), validação e sanitização de uploads, exposição de credenciais em armazenamento local, injeção, headers HTTP e auditoria de vulnerabilidades (`npm audit`).
3. **Responsividade e Acessibilidade (a11y)**: comportamento em larguras mobile (375px), tablet (768px) e desktop (1280px+), navegação por teclado, ordem de foco, fechamento de modais via `ESC` e atributos ARIA.
4. **Infraestrutura, Docker e CI/CD**: arquivos de orquestração Docker Compose (dev e prod), pipelines do GitHub Actions (`ci.yml` e `static.yml`) nos repositórios principal (`carlswilson22/Automatch`) e secundário (`CAMPUSCEUB/ADS-AUTOMATCH`), e integridade do deploy no GitHub Pages.

### O que não foi possível testar e o motivo:
- **Interação Visual Dinâmica via Subagente de Navegador Automatizado (Playwright)**: O subagente de navegador interno foi impedido de inicializar devido a uma falha externa de rede (código HTTP 404 retornado pelos servidores CDN da Microsoft/Azure no download do binário `playwright-1.57.0-win32_x64.zip`). Conforme alinhado e aprovado com o usuário, a auditoria procedeu por meio de análise estática detalhada, inspeção de bundle, inspeção de DOM/código e execução das suítes de testes automatizados (`122` testes na bateria geral + `7` testes na bateria de segurança).
- **Subida Local do Docker Compose no Host Windows**: O daemon do Docker Desktop não se encontrava ativo no host Windows local (`failed to connect to npipe:////./pipe/dockerDesktopLinuxEngine`). A validação do Docker foi realizada por auditoria estática das configurações (`docker-compose.yml`, `docker-compose.prod.yml`, Dockerfiles) e pelos logs de build do container executados com sucesso no runner do GitHub Actions (`Validação de Build do Container Docker`).
- **Execução Local dos Testes em Python**: O Python 3 não está configurado no PATH do Windows local (apenas o atalho padrão da Microsoft Store). A validação dos testes de backend em Python foi confirmada através do histórico de execuções do CI no GitHub Actions (`Bateria de Testes Backend (Python 3.11)` - 100% de sucesso).

---

## 2. Tabela de Resultados por Área e Perfil

| ID Caso | Área | Perfil Avaliado | Descrição do Caso de Teste | Resultado | Evidência Coletada |
| :--- | :--- | :--- | :--- | :---: | :--- |
| **TC-A01** | Funcional / Home | Visitante | Exibição de cards sem badge "⭐ Destaque" sobre a foto e com estrela ao lado do nome | **Aprovado** | Testes 32.1 e 32.2 em `test_features_battery.mjs` passaram; código de `Home.jsx` limpo. |
| **TC-A02** | Funcional / Vitrine | Todos | Carga dos 5 veículos oficiais da Vitrine e filtros (marca, preço, ano) | **Aprovado** | Testes 27.1 e 24.1 a 24.3 passaram; catálogo possui Corolla Cross, Polo, HB20, T-Cross e Compass. |
| **TC-A03** | Funcional / Detalhes | Todos | Dossiê Oficial exibido exclusivamente sob demanda via botão (sem banner na carga) | **Aprovado** | Bateria 29 (testes 29.1 a 29.4) aprovada; modal com tabs, impressão e download PDF. |
| **TC-A04** | Funcional / Detalhes | Todos | Varredura 360° em 8 ângulos correspondentes ao veículo selecionado | **Aprovado** | `ShowcaseVehicleDetails.jsx` mapeia os 8 ângulos de cada modelo conforme `inventoryData.js`. |
| **TC-A05** | Funcional / IA | Todos | Consultor IA responde com precisão técnica e política de ausência honesta | **Aprovado** | Bateria 30 (testes 30.1 a 30.7) aprovada; `aiConsultantCore.js` responde motor, freios, direção sem alucinação. |
| **TC-A06** | Funcional / Guia | Visitante | Página "Como Funciona" oculta bloco B2B e FAQs B2B para não autorizados | **Aprovado** | Bateria 32 (testes 32.4 a 32.6) aprovada; `isB2BAuthorized` condiciona estritamente a renderização. |
| **TC-A07** | Funcional / Anúncios | Lojista | Meus Anúncios exibe botão centralizado para novo anúncio em listas cheias e vazias | **Aprovado** | Bateria 23 (testes 23.1 a 23.3) aprovada; `/meus-anuncios` com fluxo de criação central. |
| **TC-A08** | Funcional / Ativos | Lojista | Gestão de Ativos: salvar configurações restaura rolagem da página (Scroll Lock) | **Aprovado** | Bateria 31 (testes 31.1 a 31.7) aprovada; `scrollLockCore.js` com reference counting garante overflow livre. |
| **TC-B01** | Permissões / B2B | Comprador / Visitante | Bloqueio de acesso a `/dashboard` e `/api/partnerships` | **Aprovado na UI / Falha no Backend** | UI redireciona via `ProtectedRoute`; no backend, bypass por tokens `demo-*` permite acesso não autorizado (**DEF-01**). |
| **TC-B02** | Segurança / Auth | Anônimo | Tentativa de bypass de autenticação via header Authorization: Bearer demo-* | **Reprovado** | Teste SEC-01 em `test_security_audit.mjs`: `auth.py` e `partnerships.py` aceitam tokens `demo-*` como admin (**DEF-01**). |
| **TC-B03** | Segurança / IDOR | Lojista / Comprador | Tentativa de editar/excluir anúncios onde `user_id = NULL` (seed cars) | **Reprovado** | Teste SEC-02 em `test_security_audit.mjs`: `cars.py` permite exclusão/edição de carros sem dono (**DEF-02**). |
| **TC-B04** | Segurança / LGPD | Todos | Verificação de senhas em texto claro salvas no navegador | **Reprovado** | Teste SEC-03 em `test_security_audit.mjs`: senhas em plaintext em `@automatch:registered_users` (**DEF-03**). |
| **TC-B05** | Segurança / Upload | Lojista | Validação de tamanho e magic bytes em upload de vídeo de vistoria | **Reprovado** | Teste SEC-04 em `test_security_audit.mjs`: sem magic bytes e leitura integral em RAM antes da checagem (**DEF-05**). |
| **TC-B06** | Segurança / IA | Todos | Rate limiting e proteção contra requisições automatizadas em `/api/chat` | **Reprovado** | Teste SEC-05 em `test_security_audit.mjs`: endpoint `/api/chat` não utiliza `RateLimiter` (**DEF-06**). |
| **TC-B07** | Segurança / Dependências | N/A | Auditoria de vulnerabilidades em pacotes npm | **Reprovado** | `npm audit` identificou 18 vulnerabilidades (12 High, 4 Moderate, 2 Low) (**DEF-07**). |
| **TC-B08** | Segurança / Headers | Todos | Cabeçalhos HTTP de proteção contra clickjacking e MIME sniffing | **Aprovado** | Teste SEC-06 aprovado; `main.py` injeta `nosniff`, `DENY`, `HSTS` e `Referrer-Policy`. |
| **TC-C01** | Acessibilidade | Todos | Fechamento de modais via teclado com tecla `ESC` | **Aprovado** | Modais de Dossiê, Ativos e Parceiros possuem listener de `keydown` para tecla Escape. |
| **TC-C02** | Acessibilidade | Todos | Atributos ARIA de acessibilidade em acordeão e diálogos | **Aprovado** | `HowItWorksPage.jsx` implementa `aria-expanded` dinâmico em todas as perguntas do FAQ. |
| **TC-D01** | DevOps / Docker | Infra | Configuração de isolamento de rede e healthchecks | **Aprovado** | `docker-compose.prod.yml` não expõe portas de banco de dados para a internet e define healthchecks de DB e Cache. |
| **TC-D02** | DevOps / CI | Repositório Principal | Execução completa de CI e Deploy no GitHub Actions (`carlswilson22/Automatch`) | **Aprovado** | Runs `36778486949` e `36778486891` concluídos com 100% de sucesso. Site publicado reflete commit `117236b`. |
| **TC-D03** | DevOps / CI | Repositório Secundário | Deploy para GitHub Pages no repositório acadêmico CEUB (`CAMPUSCEUB/ADS-AUTOMATCH`) | **Reprovado** | Run `36778499441` falha sistematicamente com erro HTTP 404 da API do Pages (**DEF-04**). |

---

## 3. Tabela de Defeitos Encontrados

| ID | Severidade | Área | Título / Descrição | Passos para Reproduzir | Resultado Obtido | Resultado Esperado | Causa Provável |
| :---: | :---: | :---: | :--- | :--- | :--- | :--- | :--- |
| **DEF-01** | **Crítica** | Backend / Auth & RBAC | **Bypass de Autenticação via Tokens Demo** | 1. Enviar requisição para qualquer endpoint de lojista/admin.<br>2. Incluir cabeçalho `Authorization: Bearer demo-qualquer-coisa`. | O backend autentica a requisição como `Admin` oficial (`admin@automatch.com`) sem validar assinatura JWT. | Retornar HTTP 401 Unauthorized para qualquer token que não possua assinatura HMAC-SHA256 válida. | Lógica de contingência de demonstração em `backend/routers/auth.py` (L39-46) e `partnerships.py` (L41-48) ativa sem trava de ambiente. |
| **DEF-02** | **Crítica** | Backend / Catálogo | **Quebra de Isolamento Multilocatário (BOLA/IDOR)** | 1. Autenticar como usuário comum (comprador ou lojista B).<br>2. Enviar requisição `DELETE /api/cars/sc-001` ou `PUT /api/cars/sc-001`. | O anúncio oficial é alterado ou deletado do banco de dados por um usuário não proprietário. | Retornar HTTP 403 Forbidden ("Permissão negada. Você só pode editar veículos da sua conta"). | Condicional `if car.user_id and car.user_id != current_user.id:` em `cars.py` (L147, L191) falha se `user_id` for `None` (como nos carros do seed). |
| **DEF-03** | **Crítica** | Frontend / Privacidade | **Exposição de Senhas em Texto Puro no `localStorage`** | 1. Realizar cadastro em `/login`.<br>2. Abrir DevTools -> Application -> Local Storage.<br>3. Consultar chave `@automatch:registered_users`. | A senha do usuário está armazenada em texto plano (`password: "minhasenha"`). | Jamais persistir senhas em texto puro no cliente (violação OWASP e LGPD). | Linhas 127 e 156 do `AuthContext.jsx` realizam `updated.push({ ...fullUser, password })` para suporte a fallback offline. |
| **DEF-04** | **Alta** | CI/CD / DevOps | **Falha Contínua de Deploy do GitHub Pages no Repositório Secundário** | 1. Acessar GitHub Actions de `CAMPUSCEUB/ADS-AUTOMATCH`.<br>2. Executar `gh run view 36778499441 --repo CAMPUSCEUB/ADS-AUTOMATCH`. | O job de build falha com erro 404: `Get Pages site failed. Please verify that the repository has Pages enabled`. | O pipeline deve construir e publicar a aplicação na URL do GitHub Pages do repositório secundário. | O GitHub Pages não foi ativado nas configurações do repositório `CAMPUSCEUB/ADS-AUTOMATCH` (Settings -> Pages -> Source). |
| **DEF-05** | **Alta** | Backend / Uploads | **Risco de DoS por Exaustão de Memória e Falta de Magic Bytes em Vídeos** | 1. Enviar requisição multipart com arquivo de vídeo para `/api/v1/pericia/video/upload`.<br>2. Ou enviar payload malicioso renomeado como `.mp4`. | O servidor aloca todo o arquivo em memória RAM (`await file.read()`) antes de checar tamanho, e não checa magic bytes. | Realizar streaming em chunks e verificar assinatura de magic bytes (`ftyp` de MP4) antes de processar. | `upload_pericia_video` em `backend/routers/uploads.py` não replica a leitura defensiva implementada em `upload_laudo`. |
| **DEF-06** | **Média** | Backend / IA | **Ausência de Rate Limiting no Endpoint do Consultor IA** | 1. Disparar requisições consecutivas para `POST /api/chat`. | O servidor aceita requisições ilimitadas sem restrição de taxa por IP. | Resposta HTTP 429 Too Many Requests após ultrapassar limite razoável (ex: 20 req/min). | `chat_automatch` em `backend/routers/ai_vision.py` não integra a classe `RateLimiter`. |
| **DEF-07** | **Média** | Frontend / Segurança | **18 Vulnerabilidades de Dependências no Frontend** | 1. Executar `npm audit` em `frontend/`. | Reportadas 18 vulnerabilidades (12 High, 4 Moderate, 2 Low) em `react-router`, `axios`, `postcss`, `form-data`. | Dependências atualizadas e sem CVEs conhecidas de severidade alta/moderada. | Dependências transitivas defasadas no `package-lock.json`. |
| **DEF-08** | **Baixa** | CI/CD / DevOps | **Aviso de Depreciação de Node.js 20 nos Runners do GitHub Actions** | 1. Inspecionar logs dos workflows no GitHub Actions. | Anotações informando que ações visando Node 20 estão sendo forçadas a rodar em Node 24. | Workflows configurados para utilizar versões LTS ativas sem warnings de deprecation. | `ci.yml` e `static.yml` especificam `node-version: '20'`. |

---

## 4. Plano de Correção Priorizado

### Prioridade 1 — Correções Críticas Imediatas (Segurança e Privacidade)
1. **Blindagem de Tokens Demo no Backend (DEF-01)**:
   - Adicionar trava obrigatória baseada na variável de ambiente `ENVIRONMENT`: permitir tokens `demo-*` apenas se explicitamente definido `ALLOW_DEMO_TOKENS=true` ou em ambiente de testes. Em produção, rejeitar categoricamente qualquer token fora do padrão RFC 7519 HMAC-SHA256.
2. **Correção de BOLA/IDOR em Veículos Sem Dono (DEF-02)**:
   - Alterar `cars.py` para exigir propriedade estrita:
     ```python
     if car.user_id != current_user.id and not is_admin:
         raise HTTPException(status_code=403, detail="Permissão negada.")
     ```
   - No `seed.py`, atribuir explicitamente os carros oficiais ao `admin_user.id` (`"user_id": admin_user.id`), garantindo integridade referencial.
3. **Remoção de Senhas em Texto Puro do LocalStorage (DEF-03)**:
   - Em `frontend/src/contexts/AuthContext.jsx`, sanitizar os objetos salvos em `@automatch:registered_users`, removendo a propriedade `password` ou armazenando apenas hash unidirecional.

### Prioridade 2 — Correções de Alta Severidade (Estabilidade e Deploy)
4. **Ativação do GitHub Pages no Repositório Secundário (DEF-04)**:
   - Nas configurações do repositório `CAMPUSCEUB/ADS-AUTOMATCH`, acessar `Settings` -> `Pages` e selecionar `Source: GitHub Actions`.
   - Alternativamente, adicionar condicional no `.github/workflows/static.yml` para evitar falha no build caso Pages não esteja habilitado.
5. **Streaming e Validação de Magic Bytes em Upload de Vídeos (DEF-05)**:
   - Implementar em `upload_pericia_video` leitura inicial dos primeiros 12 bytes para validar a assinatura do container ISO/IEC (assinatura `ftyp` de MP4/MOV) e processamento em chunks de 64KB com limite rígido de 40MB sem carregar todo o arquivo na RAM de uma só vez.

### Prioridade 3 — Correções de Média Severidade (Confiabilidade e Dependências)
6. **Rate Limiting no Consultor IA (DEF-06)**:
   - Instanciar `chat_rate_limiter = RateLimiter(max_requests=20, window_seconds=60, block_duration_seconds=120)` e aplicar em `POST /api/chat`.
7. **Atualização Segura de Dependências (DEF-07)**:
   - Executar `npm audit fix` de forma assistida para corrigir CVEs transitivas de `react-router` e bibliotecas utilitárias sem introduzir breaking changes no frontend.

### Prioridade 4 — Correções de Baixa Severidade (Manutenibilidade)
8. **Modernização dos Runners de CI (DEF-08)**:
   - Atualizar a matriz de versões nos workflows `.github/workflows/ci.yml` e `static.yml` para Node.js 22 LTS / 24, eliminando alertas de depreciação.
