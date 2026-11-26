# 📌 Backlog do Produto & Quadro de Desenvolvimento PI 2 — Automatch™

**Repositório Principal:** [carlswilson22/Automatch](https://github.com/carlswilson22/Automatch) | **Secundário Institucional:** [CAMPUSCEUB/ADS-AUTOMATCH](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH)  
**Instituição:** Centro Universitário de Brasília (UniCEUB) — Análise e Desenvolvimento de Sistemas (ADS)  
**Equipe:** Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio  
**Framework de Gestão:** Scrum / Kanban Híbrido com Priorização MoSCoW  

> Atualizado em **26/11/2026** sobre a base real do repositório. Este quadro reflete a implementação verificada no código, distinguindo recursos ativos, modo demonstrativo e itens futuros fora do escopo atual. Registros históricos de 17–19/11/2026 permanecem preservados abaixo e nas [sprints](sprints/README.md).

---

## 📊 1. Quadro Kanban Oficial — Desenvolvimento PI 2

```text
+-------------------------------------------------------------------------------------------------------------------------+
|                                             QUADRO: DESENVOLVIMENTO PI 2                                                |
+---------------------+-------------------+---------------------+-------------------------+-------------------------------+
| BACKLOG DO PROJETO  | ITENS ESSENCIAIS  | A FAZER             | FAZENDO                 | FINALIZADO                    |
+---------------------+-------------------+---------------------+-------------------------+-------------------------------+
| • Front-End         | • Front-end       | (pendências futuras | (ver seção 3 para itens | [x] Front-end (React + Vite)  |
| • Back-End          | • Back-End        |  de operação real   |  de homologação manual) | [x] Back-end (FastAPI)        |
| • Protótipo         | • Protótipo       |  listadas na Tab.2) |                         | [x] Modelagem & Alembic       |
| • Modelagem Dados   | • Modelagem Dados |                     |                         | [x] Protótipo Figma           |
| • Diagrama Caso Uso | • Impl. IA Gemini |                     |                         | [x] IA Gemini (chat/visão)    |
| • Diagrama Sequenc. | • Doc. Completa   |                     |                         | [x] Upload & Auditoria Laudos |
| • Diagrama Compon.  | • Doc. Arquit. SW |                     |                         | [x] YOLOv8 + Contrato v2      |
| • Doc. Completa     | • Impl. API Gemini|                     |                         | [x] Melhoria velocidade IA    |
| • Doc. Arquit. SW   | • Impl. yolov8    |                     |                         | [x] Doc. Arquitetura & v2.0   |
| • Planilha Backlog  | • Consulta Placa  |                     |                         | [x] Documentação completa     |
| • Impl. API Gemini  |                   |                     |                         | [x] FIPE BrasilAPI + DETRAN   |
| • Impl. API yolov8  |                   |                     |                         | [x] Diagramas UML / Mermaid   |
| • Consulta DETRAN   |                   |                     |                         | [x] Varredura 360° (8 ângulos)|
| • Banco de Dados    |                   |                     |                         | [x] Vídeo pericial 20s        |
| • Feedback laudo IA |                   |                     |                         | [x] Implementação de TCO      |
| • Varredura 360°    |                   |                     |                         | [x] Comparador Multidimens.   |
| • Vídeo pericial 20s|                   |                     |                         | [x] Rede B2B + Hold Lock      |
| • Impl. de TCO      |                   |                     |                         | [x] Feedback YOLO pós-laudo   |
| • Comparador Multid.|                   |                     |                         | [x] Auditoria Laudo PDF IA    |
| • Conexão B2B lojas |                   |                     |                         | [x] Tour Guiado Interativo    |
| • Tour Guiado B2B   |                   |                     |                         | [x] Vitrine Resiliente Fallbk |
| • Vitrine Resiliente|                   |                     |                         | [x] Deploy CD GitHub Pages    |
+---------------------+-------------------+---------------------+-------------------------+-------------------------------+
```

---

## 🗺️ 2. Matriz de Rastreabilidade (Kanban ↔ Código ↔ Validação)

| Cartão / Entrega | Coluna / Situação | Módulo / Arquivos Implementados | Status | Evidência / Limite Verificado |
| :--- | :---: | :--- | :---: | :--- |
| **Front-end (SPA)** | *Finalizado* | `frontend/src/` (React 18 + Vite 8 + TailwindCSS 3) | ✅ Concluído | `npm run lint`, `npm test` (`21` arquivos `tests/*.mjs` + AST) e `npm run build` |
| **Back-end (API REST)** | *Finalizado* | `backend/main.py`, `backend/routers/` (10 roteadores FastAPI) | ✅ Concluído | Uvicorn porta 8000; `python run_tests.py` (`25` `test*.py` + jornadas) |
| **Protótipo Visual** | *Finalizado* | `docs/prototipo/README.md`, `frontend/src/pages/` (12 páginas) | ✅ Concluído | Vitrine, Detalhes, Dashboard B2B, Comparador, Perfil, Validação |
| **Modelagem & Migrações** | *Finalizado* | `backend/models.py`, `backend/alembic/versions/` (`001`–`008`) | ✅ Concluído | 14 entidades ORM + `alembic_version`; CI valida PostgreSQL 15 e SQLite |
| **Banco de Dados & Seed** | *Finalizado* | `backend/database.py`, `backend/seed.py` | ✅ Concluído | Pool SQLAlchemy, 3 lojas e 5 veículos canônicos idempotentes |
| **IA Gemini & Streaming** | *Finalizado* | `backend/services/ai_service.py`, `backend/routers/ai_vision.py` | ✅ Concluído | `GEMINI_MODELS` com corrida paralela, retry 503, SSE e fallback semântico |
| **Scanner Visual v2 & YOLO** | *Finalizado* | `backend/services/inspection_contract.py`, `yolov8n.pt` | ✅ Concluído | COCO detecta veículo; retorna `inconclusive` sem detector de avarias calibrado |
| **FIPE / DETRAN / Placa** | *Finalizado* | `backend/routers/detran.py`, `backend/routers/vehicle_lookup.py` | ✅ Concluído | FIPE real via BrasilAPI (cache 24h); DETRAN/placa em modo demonstrativo |
| **Upload & Auditoria Laudos** | *Finalizado* | `backend/routers/uploads.py`, `backend/services/laudo_ia_evaluator.py`, `LaudoFeedbackCard.jsx` | ✅ Concluído | Magic bytes, extração PDF, cross-check placa/chassi/km e merge JSON seguro |
| **Dossiê PDF & Validação** | *Finalizado* | `backend/routers/laudos_export.py`, `pdf_generator.py`, `OfficialDossierModal.jsx`, `PublicValidationPage.jsx` | ✅ Concluído | PDF vetorial ReportLab + QR Code; protocolo registra snapshot do anúncio |
| **Varredura 360° Orbital** | *Finalizado* | `frontend/src/components/vehicle/Vehicle360Viewer.jsx` | ✅ Concluído | Sequência fotográfica em até 8 ângulos (não é reconstrução 3D) |
| **Vídeo Pericial 20s** | *Finalizado* | `PericialVideoViewer.jsx`, `shared/pericial-timeline.json` | ✅ Concluído | Cronograma único em 3 checkpoints (`0–5s`, `5–15s`, `15–20s`) |
| **Comparador & TCO & AutoPrice** | *Finalizado* | `VehicleComparatorModal.jsx`, `TcoCalculatorCard.jsx`, `pricing_service.py` | ✅ Concluído | Semáforo de laudo unificado e estimativas ilustrativas de TCO/FIPE |
| **Rede B2B & Hold Lock** | *Finalizado* | `backend/routers/partnerships.py`, `PartnershipHubModal.jsx`, `B2BRepassePanel.jsx` | ✅ Concluído | 16 endpoints B2B: parcerias, estoque compartilhado, reserva, chat por polling e transações |
| **Alertas, Multicanal & XML** | *Finalizado* | `routers/alerts.py`, `routers/integrations.py`, `PriceAlertModal.jsx`, `MultichannelSyncModal.jsx` | ✅ Concluído | Cadastro/prévia na UI e feed XML real; sem envio externo WhatsApp/e-mail/portais |
| **Tour Guiado Interativo** | *Finalizado* | `frontend/src/components/tour/AutomatchTour.jsx`, `tourGuideData.js` | ✅ Concluído | Foco, teclado e fluxo sincronizado com vitrine e B2B (revisão visual manual) |
| **Documentação & Governança** | *Finalizado* | `README.md`, `BACKLOG.md`, `docs/` (`estado-atual.md`, `arquitetura.md`, ADRs) | ✅ Concluído | `0` links quebrados; Sprints 00–08 e Entregas 01–03 catalogadas |
| **CI/CD & GitHub Pages** | *Finalizado* | `.github/workflows/ci.yml`, `.github/workflows/static.yml` | ✅ Concluído | CI completo + deploy contínuo da demonstração no `carlswilson22/Automatch` |

---

## 🎯 3. Pendências Atuais e Integrações Futuras (Fora da Implementação Atual)

Os itens abaixo dependem de contratação de provedores, definição operacional ou conferência manual antes de operação comercial real:

| Prioridade | Item | Critério de Conclusão |
| :---: | :--- | :--- |
| **Alta** | Contratar e homologar fonte oficial DETRAN / consulta de placa | Substituir respostas demonstrativas por fonte autorizada com tratamento de indisponibilidade |
| **Alta** | Homologar entrega real de alertas, e-mail (SMTP) e multicanal | Provedor contratado, confirmação de entrega e opt-out do titular |
| **Alta** | Homologar ambiente de produção (TLS/HTTPS, backups e segredos) | Terminação TLS no Nginx (porta 443), segredos exclusivos e política de retenção |
| **Média** | Conferir acessibilidade, leitores de tela e fluidez manualmente | Validar contraste, navegação por teclado e layout em dispositivos reais |
| **Média** | Calibrar detector de avarias antes de ativar marcações automáticas | Conjunto anotado e validado de danos reais acima do contrato v2 atual |
| **A definir** | Checkout operacional, favoritos em banco e escala horizontal | Gateway de pagamento real; Redis/coordenação compartilhada para múltiplos workers |

> **Fora do escopo ativo:** **Scanner/reescaneamento de pneus e diagnóstico acústico** foram removidos em 18/11/2026 (endpoints legados retornam HTTP 404 conforme [`test_cleanup_regressions.py`](backend/test_cleanup_regressions.py)) e não fazem parte do produto entregue.

---

## 🚀 4. Épicos Implementados e Histórias de Usuário

### 🛡️ ÉPICO 1: Segurança, Autenticação e Conformidade LGPD
* **[ATM-AUTH-01] Autenticação JWT (`HS256`) & PBKDF2:** Hash `PBKDF2-HMAC-SHA256` (100.000 iterações com salt aleatório), JWT com `token_version` revogável e proteção de rotas via `ProtectedRoute.jsx`.
* **[ATM-AUTH-02] Recuperação OTP & LGPD:** Tokens com hash e expiração (`password_reset_tokens`), exportação de dados (`/api/users/me/export-data`) e exclusão/anonimização de conta (`/api/users/me`).

### 🚗 ÉPICO 2: Catálogo, Estoque & Multi-Concessionárias
* **[ATM-CAT-01] Catálogo Paginado & Filtros:** `GET /api/cars` com paginação `{ items, total, page, pages, limit }`, filtros e fallback demonstrativo estático quando ativado.
* **[ATM-CAT-02] Cadastro Assistido & Lojas:** `POST /api/cars`, onboarding de loja (`/api/store/onboarding`), gestão em `MyAdsPage.jsx` e controle de propriedade multilocatário (`OWASP A01`).

### 🔍 ÉPICO 3: Dossiê de Transparência, Laudos & Integrações
* **[ATM-LAUDO-01] Cruzamento FIPE & DETRAN:** FIPE via BrasilAPI (cache 24h) ou cadastro; DETRAN/placa demonstrativos para simulação na interface.
* **[ATM-LAUDO-02] Auditoria PDF por IA & Dossiê QR Code:** Validação de magic bytes (`%PDF-`, JPEG, PNG), `laudo_ia_evaluator.py` com cross-check (`SEM_RESSALVAS`, `COM_ATENCAO`, `COM_RESTRICOES`), emissão vetorial via ReportLab e validação pública em `/validar/{protocolo}`.

### 🤖 ÉPICO 4: Visão Computacional, 360° & Consultor IA
* **[ATM-AI-01] Contrato Visual v2:** [`inspection_contract.py`](backend/services/inspection_contract.py) protege contra falsos positivos (retorna `inconclusive` sem detector calibrado de avarias) e [`vehicleInformation.js`](frontend/src/utils/vehicleInformation.js) unifica o semáforo entre Scanner, Dossiê e Comparador.
* **[ATM-AI-02] Consultor IA & Streaming SSE:** `POST /api/chat` e `/api/chat/stream` com Gemini (`GEMINI_MODELS`) + fallback semântico determinístico sobre ficha técnica e laudo.
* **[ATM-AI-03] Varredura 360° & Vídeo Pericial 20s:** Visualizador fotográfico em 8 ângulos (`Vehicle360Viewer.jsx`) e player de 20s (`PericialVideoViewer.jsx`) baseado em `shared/pericial-timeline.json`.

### 💰 ÉPICO 5: Precificação, Comparador, Alertas & Rede B2B
* **[ATM-B2B-01] Rede B2B & Hold Lock:** Parcerias entre lojas, estoque compartilhado paginado (`X-Total-Count`/`X-Has-More`), reservas temporárias, solicitação de fechamento/consentimento, chat por polling e trilha de auditoria (`partnership_audit_logs`).
* **[ATM-FIN-01] AutoPrice™, Comparador & TCO:** Cálculo de referência de mercado, comparador de 2–3 veículos em 5 dimensões e simulador mensal de TCO.
* **[ATM-FIN-02] Alertas de Preço & Feed XML:** Persistência por conta em `price_alerts` (ou local em modo demo) e geração de `/api/integrations/feed.xml`.

---

## 🎯 5. Critérios de Pronto (DoD) e Registros Históricos (17–26/11/2026)

1. **Qualidade & Testes:** `npm run lint`, `npm test` (`check:usage` + `node --test`), `npm run build`, e `python run_tests.py` com dados/bancos temporários.
2. **Correções A1–A5 (17/11/2026):** Normalização de dados negativos/ausentes, fidelidade FIPE/km no PDF, favoritos isolados por conta, cadastro local seguro e eliminação dos 161 avisos de ESLint ([detalhes](docs/revisao-pendencias-demo-2026-11-17.md), [manutenção](docs/manutencao-avisos-2026-11-17.md)).
3. **Limpeza e Auditoria (18–19/11/2026):** Remoção de 15 módulos sem uso, 4 dependências e legado de pneus/acústica; migrações `006`–`008` verificadas no PostgreSQL ([verificação](docs/verificacao-banco.md), [relatório](docs/auditoria-scanner-video-2026-11-19.md)).
4. **Saneamento Recente (21–26/11/2026):** Unificação de semáforo de laudo/scanner, merge seguro de `laudo_feedback` em uploads PDF, proteção de atributos `Car` em `uploads.py`, calibração de cold-start Docker e unificação de `GEMINI_MODELS` em `laudo_ia_evaluator.py`.
5. **Sincronização:** Ver [`docs/sincronizacao-repositorios.md`](docs/sincronizacao-repositorios.md), [`docs/estado-atual.md`](docs/estado-atual.md) e [`docs/testes-e-evidencias.md`](docs/testes-e-evidencias.md).
