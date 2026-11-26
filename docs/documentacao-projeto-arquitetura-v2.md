# AUTOMATCH — Documentação do Projeto e Arquitetura de Software (Versão 2.0 Revisada)

**Instituição:** Centro Universitário de Brasília — UniCEUB (ADS / ACE)  
**Equipe:** Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio  
**Base de Verificação:** Repositório principal `carlswilson22/Automatch` (`main`), revisada em **26/11/2026**  

> [!NOTE]
> Este documento consolida a Versão 2.0 alinhando integralmente o texto acadêmico ao **código real versionado no repositório**, diferenciando o que está implementado, o que opera em modo demonstrativo e os itens planejados para evolução futura.

---

## Histórico de Revisão

| Data | Versão | Descrição | Autor |
| :--- | :---: | :--- | :--- |
| 06/03/2025 | 1.0 | Elaboração inicial do documento | Carlos Wilson |
| 24/03/2025 | 1.1 | Criação do Backlog e definição do Stack | Vinicius Aurelio |
| 31/03/2025 | 1.2 | Atualização da Representação Arquitetural e Implantação | Carlos Wilson |
| 06/04/2025 | 1.3 | Inclusão da Visão de Processos e Módulo de IA | Paulo Arthur |
| 28/04/2025 | 1.4 | Atualização de Tamanho, Desempenho e Qualidade | Vinicius Aurelio |
| 05/05/2025 | 1.5 | Revisão de stack Docker, React.js, Tailwind CSS e GitHub | Vinicius Aurelio |
| 26/11/2026 | 2.0 | Unificação da Documentação do Projeto com o Documento de Arquitetura; adequação integral ao repositório real (14 entidades ORM, 10 roteadores FastAPI, contrato visual v2, Rede B2B, remoção de recursos legados e separação entre implementado, demo e futuro) | Equipe Automatch |

---

## 1. Introdução

### 1.1 Finalidade
Apresentar a arquitetura, os fluxos, a modelagem de dados e as decisões técnicas reais do **Automatch**, marketplace automotivo inteligente desenvolvido na disciplina de Atividade Curricular de Extensão (ACE) do UniCEUB.

### 1.2 Escopo Real do Sistema
* **Frontend (SPA):** React 18, React Router 7, Vite 8 e TailwindCSS 3, responsivo, com 12 páginas e modo demonstrativo estático para GitHub Pages.
* **Backend (API REST modular):** Python 3.11 + FastAPI + SQLAlchemy 2 + Pydantic v2, organizando autenticação, catálogo, rede B2B, laudos, uploads, alertas, integrações e saúde da aplicação.
* **Visão Computacional & IA:** OpenCV + Ultralytics YOLOv8 (`yolov8n.pt`, detector COCO para presença de veículo) + integração opcional à Google Gemini API (`GEMINI_MODELS` com corrida paralela e backoff em 503) + fallbacks determinísticos locais.
* **Auditoria de Laudos e Dossiê PDF:** Upload validado por magic bytes (`%PDF-`, JPEG, PNG), extração via `pypdf` e análise por IA/heurística (`laudo_ia_evaluator.py`), emissão vetorial via ReportLab com QR Code e página pública `/validar/{protocolo}`.
* **Rede B2B de Estoque Compartilhado:** Parcerias entre lojas, reservas temporárias, pedido de fechamento/consentimento, chat B2B por polling, transações e avaliações de parceria.
* **Fora do escopo ativo:** Scanner/reescaneamento de pneus e diagnóstico acústico de motor foram removidos em 18/11/2026. Serviços externos de DETRAN, envio externo de alertas/multicanal, pagamento real, Chroma DB e Redis **não compõem** a implantação atual.

### 1.3 Definições, Acrônimos e Abreviações (Alinhado ao Código)
Manter os termos do glossário v2.0 com duas correções de precisão:
* **Cache em memória:** No estado atual, o cache de consultas FIPE (TTL de 24h por código/ano em `detran.py`) e o limitador de taxa (`security_guard.py`) residem em memória de processo único (sem Redis).
* **Contrato Visual v2 (`inspection_contract.py`):** Define estados explícitos (`damage_detected`, `inconclusive`, `no_damage_detected`) e exige evidência calibrada antes de exibir avarias; sem detector de avarias calibrado, retorna `inconclusive` com recomendação de vistoria presencial.
* **Exclusão e Anonimização LGPD:** A API implementa exportação de dados (`/api/users/me/export-data`) e remoção/anonimização de conta (`/api/users/me`), com revogação de JWT via `token_version`. *(Não utiliza coluna `deleted_at` nem criptografia AES-256 em banco no ORM atual).*

---

## 2. Representação Arquitetural e Stack Tecnológico

O sistema adota separação modular em camadas (Front-end SPA $\rightarrow$ Gateway Nginx $\rightarrow$ Roteadores FastAPI $\rightarrow$ Serviços de Domínio $\rightarrow$ ORM SQLAlchemy / Banco Relacional):

| Camada | Tecnologia Real no Repositório | Papel |
| :--- | :--- | :--- |
| **Frontend** | React 18, React Router 7, Vite 8, TailwindCSS 3.4, Framer Motion, Lucide | SPA responsiva (12 páginas), code-splitting por rota/modal |
| **Backend** | Python 3.11, FastAPI, Uvicorn (1 worker em prod), Pydantic v2, APScheduler | API RESTful, regras de negócio, tarefas periódicas e streaming SSE |
| **Banco de Dados** | PostgreSQL 15 (Compose dev/prod) / SQLite (testes) + SQLAlchemy + Alembic (`001`–`008`) | Persistência relacional de 14 entidades ORM e migrações versionadas |
| **IA & Visão** | OpenCV, Ultralytics YOLOv8 (`yolov8n.pt`), Google Gemini API (`GEMINI_MODELS`) | Detecção de veículo, perícia visual v2, consultor IA e auditoria de PDF |
| **Documentos** | ReportLab, `qrcode[pil]`, Pillow, `pypdf` | Dossiê A4 vetorial, QR Code, compressão e leitura de PDFs |
| **Integrações** | BrasilAPI (FIPE real c/ cache 24h) + mocks demonstrativos (DETRAN, placa, multicanal, checkout) | Dados de referência e simulação segura em demonstração |
| **Infra & Gateway** | Docker, Docker Compose (4 containers: `db`, `backend`, `frontend`, `gateway`), Nginx | Orquestração local/prod e proxy reverso HTTP |
| **CI/CD & Testes** | GitHub Actions (`ci.yml`, `static.yml`), ESLint, `node --test`, `check-source-usage.mjs`, `unittest` (`run_tests.py`) | Verificação contínua (`21` suítes `.mjs` front + `25` arquivos `test*.py` back) e CD no GitHub Pages |

---

## 3. Metas e Restrições da Arquitetura

* **Segurança & Privacidade:** Sem segredos no código; validação obrigatória em `ENVIRONMENT=production` (`check_production_secrets()` bloqueia `JWT_SECRET` fraco e `ALLOW_DEMO_TOKENS=true`); `PBKDF2-HMAC-SHA256` (100k iterações); cabeçalhos defensivos OWASP no middleware FastAPI.
* **Resiliência:** Fallbacks locais determinísticos caso `GEMINI_API_KEY` esteja ausente ou externa falhe; timeouts explícitos no `apiClient.js` (10s padrão); contrato visual v2 sem fabricar aprovação ou score artificial.
* **Multi-worker / Escala:** Como `APScheduler` e `RateLimiter` operam em memória de processo, o ambiente de produção usa `--workers 1` até adoção futura de coordenação compartilhada (ex.: Redis).
* **Restrições vigentes:** Sem scanner de pneus ou diagnóstico acústico; TLS/HTTPS na porta 443 depende de configuração de certificado na implantação (`nginx.prod.conf` atual escuta HTTP 80).

---

## 4. Visão de Casos de Uso (Reais do Sistema)

* **Atores Reais:**
  1. **Visitante:** Navega no catálogo, consulta detalhes, compara veículos, utiliza TCO/simuladores e valida protocolos públicos (`/validar/{protocolo}`).
  2. **Usuário Comum (`role='comum'`):** Registra-se, autentica, gerencia favoritos locais por conta, publica/edita/exclui seus próprios anúncios, aciona o Scanner IA e exporta/exclui seus dados LGPD.
  3. **Lojista / Admin (`role='lojista'` | `'admin'`):** Acessa o Dashboard gerencial, gerencia estoque compartilhado, envia/aceita convites de parceria B2B, cria reservas com trava, troca mensagens no chat B2B e formaliza transações de repasse.

* **Principais Casos de Uso Implementados:**
  * `UC-01` Autenticação JWT, perfil, onboarding de loja e recuperação por OTP;
  * `UC-02` Catálogo paginado com filtros combinados e gestão de anúncios (`OWASP A01`);
  * `UC-03` Scanner Visual de Lataria (Contrato v2), Varredura 360° e Vídeo Pericial 20s;
  * `UC-04` Upload e Auditoria Multimodal de Laudos Cautelares PDF (`SEM_RESSALVAS` / `COM_ATENCAO` / `COM_RESTRICOES`);
  * `UC-05` Emissão de Dossiê PDF ReportLab com QR Code e validação pública;
  * `UC-06` Consultor IA contextual (`/api/chat` e SSE `/api/chat/stream`), Comparador e TCO;
  * `UC-07` Rede B2B (parcerias, estoque compartilhado, reservas, fechamento, avaliações e auditoria);
  * `UC-08` Consulta FIPE (BrasilAPI), amostras DETRAN/placa, alertas de preço, multicanal demo e feed XML.

---

## 5. Visão Lógica e Padrões Aplicados

* **Frontend (`frontend/src/`):**
  * `pages/` (12 páginas): `Home`, `ShowcaseCatalog`, `ShowcaseVehicleDetails`, `AuthPage`, `ProfilePage`, `FavoritesPage`, `Dashboard`, `MyAdsPage`, `NewCarAdForm`, `CheckoutPage`, `HowItWorksPage`, `PublicValidationPage`.
  * `components/`: organizados por domínio (`chat/`, `common/`, `inventory/`, `layout/`, `partners/`, `tour/`, `ui/`, `vehicle/`).
  * `utils/` e `services/`: `apiClient.js`, `vehicleMapper.js`, `vehicleInformation.js` (classificação unificada de laudo/scanner), `visualInspection.js`, `aiConsultantCore.js`, `demoTools.js`.
* **Backend (`backend/`):**
  * Roteadores (`routers/`): `auth`, `cars`, `detran`, `ai_vision`, `uploads`, `alerts`, `integrations`, `laudos_export`, `partnerships`, `vehicle_lookup`.
  * Serviços (`services/`): `ai_service`, `laudo_ia_evaluator`, `inspection_contract`, `pdf_generator`, `pricing_service`, `image_sources`, `recovery_mail`.
* **Padrões reais aplicados:** API REST em camadas, ORM SQLAlchemy com sessões por requisição (`get_db`), controle de propriedade centralizado (`dependencies.py`), fallback resiliente em IA/FIPE, code-splitting (`React.lazy`) e auditoria estática de AST (`check-source-usage.mjs`).

---

## 6. Visão de Processos (Fluxos Reais)

1. **Análise Visual (`POST /api/analise-visual` / `POST /api/v1/laudos/upload`):** Valida extensão e magic bytes $\rightarrow$ comprime imagem $\rightarrow$ executa perícia visual segundo contrato v2 (`damage_detected`, `inconclusive` ou `no_damage_detected`) $\rightarrow$ persiste via merge JSON em `cars.laudo_feedback` preservando dados prévios.
2. **Auditoria de Laudo PDF:** Extrai texto (`pypdf`) e imagens $\rightarrow$ envia a `call_gemini_generate` (`GEMINI_MODELS`) com fallback heurístico local $\rightarrow$ confronta placa, chassi, modelo, ano e km $\rightarrow$ classifica em `SEM_RESSALVAS`, `COM_ATENCAO` ou `COM_RESTRICOES` $\rightarrow$ sincroniza semáforo na UI via `classifyVehicleCompliance`.
3. **Consultor IA:** `POST /api/chat` ou `POST /api/chat/stream` (SSE) com rate limiter (`30 req/min` por IP) e contexto estrito do veículo anunciado.
4. **FIPE & DETRAN:** FIPE consulta BrasilAPI (cache 24h em memória); DETRAN e lookup de placa utilizam registros demonstrativos locais (`detran.py`, `vehicle_lookup.py`).

---

## 7. Visão de Implantação e Ambientes

* **Desenvolvimento (`docker-compose.yml`):** 4 serviços (`db` Postgres 15 na porta `5433`, `backend` FastAPI na `8000` com healthcheck em `127.0.0.1:8000/api/health`, `start_period: 60s`, `retries: 5`, `frontend` Vite na `5173`, `gateway` Nginx nas portas `80`/`3000`).
* **Produção (`docker-compose.prod.yml`):** Mesmos 4 containers sem expor portas internas de `db`, `backend` e `frontend` ao host; backend com `--workers 1`; `nginx.prod.conf` escutando HTTP 80 (TLS/HTTPS a configurar conforme domínio/certificado).
* **GitHub Pages (`.github/workflows/static.yml`):** Build e publicação automática do frontend estático (`VITE_DEMO_MODE=true`) a cada push na `main` de `carlswilson22/Automatch`.

---

## 8. Visão de Implementação: Segurança e Rotas Reais da API

### 8.1 Segurança Implementada
* **JWT:** Algoritmo **HS256**, validade configurável via `ACCESS_TOKEN_EXPIRE_MINUTES` (padrão `1440` min = 24h), revogação via `token_version` no banco.
* **Senhas:** `PBKDF2-HMAC-SHA256` com salt aleatório de 16 bytes e `100.000` iterações.
* **Uploads e Proteções:** Magic bytes antes da alocação completa, limite de tamanho, `RateLimiter` por IP/e-mail, `RequestValidationError` sanitizado, CORS restrito por `ALLOWED_ORIGINS` e headers OWASP (`X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Strict-Transport-Security`, `Referrer-Policy`).

### 8.2 Mapa Completo de Rotas (`backend/routers/` + `main.py`)
* **Saúde:** `GET /api/health`, `GET /api/health/ready`
* **Autenticação, Conta & LGPD (`auth.py`):** `POST /api/register`, `POST /api/login`, `GET|PUT /api/users/profile`, `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`, `POST /api/checkout`, `GET /api/users/me/export-data`, `DELETE /api/users/me`, `POST /api/store/onboarding`
* **Lojas & Veículos (`cars.py`):** `GET /api/stores`, `GET /api/cars`, `GET /api/cars/mine`, `GET /api/cars/{car_id}`, `POST /api/cars`, `PUT /api/cars/{car_id}`, `DELETE /api/cars/{car_id}`, `GET /api/cars/{car_id}/market-indicator`, `POST /api/cars/tco-calculator`
* **IA & Visão (`ai_vision.py`):** `POST /api/analise-visual`, `POST /api/chat`, `POST /api/chat/stream`, `POST /api/v1/precificacao`, `POST /api/analise-360`
* **Uploads & Laudos (`uploads.py` & `laudos_export.py`):** `POST /api/v1/laudos/upload`, `GET /api/v1/laudos/files/{filename}`, `POST /api/v1/pericia/video/upload`, `POST /api/v1/laudos/poc-test`, `POST|GET /api/v1/laudos/{car_id}/pdf`, `GET /api/v1/laudos/validar/{protocolo}`
* **DETRAN, FIPE & Placa (`detran.py` & `vehicle_lookup.py`):** `GET /api/detran/{placa}`, `GET /api/v1/detran/{placa}`, `GET /api/v1/integracoes/detran/{placa}`, `GET /api/v1/laudo-cautelar/{codigo_fipe}`, `GET /api/v1/integracoes/laudo-cautelar/{codigo_fipe}`, `GET /api/lookup-plate/{placa}`
* **Alertas & Integrações (`alerts.py` & `integrations.py`):** `GET|POST /api/alerts`, `GET /api/integrations/channels`, `POST /api/integrations/sync`, `GET /api/integrations/feed.xml`
* **Rede B2B (`partnerships.py`):** `GET /api/partnerships/stores-available`, `GET /api/partnerships/my`, `POST /api/partnerships/invite`, `POST /api/partnerships/{id}/accept|reject|terminate`, `GET /api/partnerships/shared-inventory`, `POST /api/partnerships/reservations`, `GET /api/partnerships/reservations/my`, `POST /api/partnerships/reservations/{id}/request-closing|give-consent|cancel`, `GET|POST /api/partnerships/reservations/{id}/messages`, `GET /api/partnerships/transactions`, `POST /api/partnerships/reviews`, `GET /api/partnerships/audit-logs`

---

## 9. Modelagem de Dados Real (`backend/models.py` + Alembic `001`–`008`)

Em substituição às tabelas conceituais antigas da v1.5, o banco PostgreSQL/SQLite real é composto por **14 entidades ORM** (ver diagrama ER e detalhes completos em [`docs/DOCUMENTACAO_BANCO_DE_DADOS.md`](DOCUMENTACAO_BANCO_DE_DADOS.md)):

| Tabela Real | Chave Primária | Finalidade Principal | Relações (FKs) |
| :--- | :--- | :--- | :--- |
| `stores` | `id` (`Integer`) | Lojas/concessionárias parceiras | — |
| `users` | `id` (`String(36)` UUID) | Contas (`comum`, `lojista`, `admin`), `sub_role`, `token_version` | `store_id → stores.id` |
| `cars` | `id` (`String(36)` UUID) | Veículos, mídia, laudo (`laudo_status`, `laudo_feedback`), FIPE e campos B2B | `store_id → stores.id`, `user_id → users.id` |
| `laudo_watchlist` | `id` (`Integer`) | Lista de acompanhamento periódico de placas | `car_id → cars.id` |
| `laudo_protocols` | `id` (`String(36)` UUID) | Protocolos de emissão de PDF e snapshot textual | `car_id → cars.id` |
| `password_reset_tokens` | `id` (`String(36)` UUID) | Tokens OTP com hash, expiração e flag de uso | `user_id → users.id` |
| `payment_orders` | `id` (`String(36)` UUID) | Pedidos demonstrativos de checkout | — |
| `store_partnerships` | `id` (`String(36)` UUID) | Vínculos de parceria B2B e taxa de comissão | `requester_store_id`, `receiver_store_id → stores.id` |
| `car_reservations` | `id` (`String(36)` UUID) | Reservas B2B temporárias com proposta, markup e consentimento | `car_id → cars.id`, `partnership_id`, lojas e `seller_user_id` |
| `partner_transactions` | `id` (`String(36)` UUID) | Repasses B2B formalizados com protocolo único | `reservation_id`, `car_id`, lojas, `closing_user_id` |
| `partner_messages` | `id` (`String(36)` UUID) | Mensagens trocadas em negociações B2B | `reservation_id`, `sender_user_id`, `sender_store_id` |
| `partner_reviews` | `id` (`String(36)` UUID) | Avaliações entre lojas parceiras após transação | `transaction_id`, `reviewer_store_id`, `reviewed_store_id` |
| `partnership_audit_logs` | `id` (`String(36)` UUID) | Registro de auditoria das ações B2B | `user_id`, `store_id` (indexados) |
| `price_alerts` | `id` (`String(36)` UUID) | Alertas de preço cadastrados por usuário | `user_id → users.id` |

---

## 10. Qualidade, Testes Reais e Governança

* **Frontend:** `npm run lint` (ESLint), `npm test` (`check-source-usage.mjs` + `21` arquivos em `frontend/tests/*.mjs` via `node --test`) e `npm run build` (Vite). *(Não utiliza Vitest, RTL nem Playwright no repositório atual).*
* **Backend:** `python run_tests.py` descobre e executa `unittest` (`25` arquivos `backend/test*.py`) e jornadas isoladas em bancos SQLite e diretórios temporários (ver [`testes-e-evidencias.md`](testes-e-evidencias.md)).
* **CI/CD (`.github/workflows/ci.yml`):** Executa backend, frontend, migrações repetidas em PostgreSQL 15 e SQLite, e builds das imagens Docker.
* **Metodologia:** Sprints **00 a 08** documentadas em [`sprints/README.md`](../sprints/README.md), Entregas **01 a 03** em [`entregas/README.md`](../entregas/README.md) e decisões arquiteturais em [`docs/decisoes/README.md`](decisoes/README.md) (`ADR-001` a `ADR-008`).
