# 📌 Backlog do Produto & Quadro de Desenvolvimento PI 2 — Automatch™
**Repositório Oficial:** [CAMPUSCEUB/ADS-AUTOMATCH](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH.git) | [carlswilson22/Automatch](https://github.com/carlswilson22/Automatch.git)  
**Curso:** Análise e Desenvolvimento de Sistemas (ADS) - Centro Universitário de Brasília (CEUB)  
**Disciplina:** Projeto Integrador 2 (PI 2)  
**Papel:** Tech Lead, Arquiteto de Software & Product Owner (PO)  
**Framework de Gestão:** Scrum / Kanban Híbrido com Priorização MoSCoW e RICE  

---

## 📊 1. Quadro Kanban Oficial — Desenvolvimento PI 2

Abaixo está a consolidação fidedigna do quadro de gestão ágil de atividades do projeto (**Desenvolvimento PI 2**), integrando os cartões de planejamento, artefatos essenciais, itens em andamento e funcionalidades finalizadas:

```
+-------------------------------------------------------------------------------------------------------------------------+
|                                             QUADRO: DESENVOLVIMENTO PI 2                                                |
+---------------------+-------------------+---------------------+-------------------------+-------------------------------+
| BACKLOG DO PROJETO  | ITENS ESSENCIAIS  | A FAZER             | FAZENDO                 | FINALIZADO                    |
| (20 cartões)        | (10 cartões)      | (1 cartão)          | (1 cartão)              | (19 cartões)                  |
+---------------------+-------------------+---------------------+-------------------------+-------------------------------+
| • Front-End         | • Front-end       | • Fazer             | • Implementação de      | [x] Front-end                 |
| • Back-End          | • Back-End        |   implementação de  |   Conexão b2b com       | [x] Back-end                  |
| • Protótipo         | • Protótipo       |   feedback do       |   lojas parceiras       | [x] Modelagem de dados        |
| • Modelagem Dados   | • Modelagem Dados |   yolov8 após       |   (Concluído no código  | [x] Protótipo                 |
| • Diagrama Caso Uso | • Impl. IA Gemini |   upload de laudos  |   via VLAEG e validado  | [x] Impl. da IA do gemini     |
| • Diagrama Sequenc. | • Doc. Completa   |   cautelares        |   com 100% testes!)     | [x] Impl. upload laudos       |
| • Diagrama Compon.  | • Doc. Arquit. SW |                     |                         | [x] Implementação yolov8      |
| • Doc. Completa     | • Impl. API Gemini|                     |                         | [x] Melhoria velocidade Gemini|
| • Doc. Arquit. SW   | • Impl. yolov8    |                     |                         | [x] Doc. arquitetura de sw    |
| • Planilha Excel    | • Integ. Detran   |                     |                         | [x] Documentação completa     |
| • Impl. API Gemini  |                   |                     |                         | [x] Impl. API Detran          |
| • Impl. API yolov8  |                   |                     |                         | [x] Diagrama de Sequencia     |
| • Impl. API Detran  |                   |                     |                         | [x] Diagrama de Componentes   |
| • Banco de Dados    |                   |                     |                         | [x] Impl. Varredura 360 graus |
| • Feedback laudo IA |                   |                     |                         | [x] Diagrama de Caso de Uso   |
| • Varredura 360°    |                   |                     |                         | [x] Consertando Modelos Dados |
| • Vídeo pericial 15s|                   |                     |                         | [x] Impl. Vídeo pericial 15s  |
| • Impl. de TCO      |                   |                     |                         | [x] Implementação de TCO      |
| • Comparador Multid.|                   |                     |                         | [x] Comparador Multidimens.   |
| • Conexão B2B lojas |                   |                     |                         |                               |
+---------------------+-------------------+---------------------+-------------------------+-------------------------------+
```

---

## 🗺️ 2. Matriz de Rastreabilidade (Kanban ↔ Código ↔ Validação)

Esta matriz mapeia cada cartão do quadro oficial com a sua implementação física no repositório e suas respectivas suítes de validação automatizada:

| Cartão no Kanban | Coluna no Quadro | Módulo / Arquivos Implementados | Status no Sistema | Evidência de Validação |
| :--- | :---: | :--- | :---: | :--- |
| **Front-end** | *Itens Essenciais / Finalizado* | `frontend/src/` (React 18 + Vite + TailwindCSS) | ✅ Concluído | `npm run build` (0 erros, 2241 modules) |
| **Back-end** | *Itens Essenciais / Finalizado* | `backend/main.py`, `backend/routers/` (FastAPI) | ✅ Concluído | Docker container + Uvicorn na porta 8000 |
| **Protótipo** | *Itens Essenciais / Finalizado* | `frontend/src/pages/`, `frontend/src/components/` | ✅ Concluído | Vitrine, Detalhes, Dashboard, Comparador |
| **Modelagem de Dados** | *Itens Essenciais / Finalizado* | `backend/models.py`, `backend/database.py` | ✅ Concluído | SQLAlchemy ORM (Car, User, Store, Watchlist) |
| **Consertando Modelos Dados** | *Finalizado* | `backend/models.py` (Índices `compartilhavel`, `status_reserva`) | ✅ Concluído | Migração e testes de integridade relacionais |
| **Banco de Dados** | *BackLog Do Projeto* | `backend/database.py`, PostgreSQL / SQLite | ✅ Concluído | SessionLocal, Pool de conexões e migrations |
| **Implementação IA Gemini** | *Itens Essenciais / Finalizado* | `backend/routers/ai_vision.py`, Gemini 1.5 Flash | ✅ Concluído | `test_vision_and_delete.py` (10/10 PASS) |
| **Melhoria de velocidade IA Gemini**| *Finalizado* | Pré-compressão LANCZOS, max_tokens e prompt RAG | ✅ Concluído | Inferência reduzida de 8s para < 1.8s |
| **Implementação yolov8** | *Itens Essenciais / Finalizado* | `backend/routers/ai_vision.py` (Ultralytics CV) | ✅ Concluído | Detecção de avarias com bounding boxes |
| **Integração / API Detran** | *Itens Essenciais / Finalizado* | `backend/routers/vehicle_lookup.py` | ✅ Concluído | `test_b2b_and_plate.py` (9/9 PASS) |
| **Upload de laudos cautelares** | *Finalizado* | `backend/routers/laudos.py` (Magic bytes `%PDF-`) | ✅ Concluído | `test_full_system_review.py` (Suíte 8 PASS) |
| **Varredura 360 graus** | *Finalizado* | `frontend/src/components/vehicle/Vehicle360Viewer.jsx` | ✅ Concluído | Giro 360° fotográfico puro nos 8 ângulos |
| **Vídeo pericial de 15s** | *Finalizado* | `frontend/src/components/vehicle/PericialVideoModal.jsx` | ✅ Concluído | Checkpoints periciais e player com timeline |
| **Implementação de TCO** | *Finalizado* | `backend/routers/cars.py` (`POST /api/cars/tco-calculator`) | ✅ Concluído | `test_usecases_full_battery.py` (UC-04 PASS) |
| **Comparador Multidimensional** | *Finalizado* | `frontend/src/components/vehicle/VehicleComparatorModal.jsx` | ✅ Concluído | `useMemo`, debounce e limite de 15 itens |
| **Documentação Completa** | *Itens Essenciais / Finalizado* | `README.md`, `CHANGELOG.md`, `docs/requisitos.md` | ✅ Concluído | Padrão acadêmico institucional CEUB |
| **Documentação Arquitetura SW** | *Itens Essenciais / Finalizado* | `docs/arquitetura.md` | ✅ Concluído | Diagramas C4/Mermaid, fluxos e integrações |
| **Diagrama de Caso de Uso** | *Finalizado* | `docs/arquitetura.md`, `docs/requisitos.md` | ✅ Concluído | 28 Requisitos Funcionais mapeados |
| **Diagrama de Sequencia** | *Finalizado* | `docs/arquitetura.md` | ✅ Concluído | Fluxo transacional de vistoria e precificação |
| **Diagrama de Componentes** | *Finalizado* | `docs/arquitetura.md` | ✅ Concluído | Arquitetura de microsserviços e gateways |
| **Planilha Excel Backlog** | *BackLog Do Projeto* | `BACKLOG.md` (Exportável para XLSX/CSV) | ✅ Concluído | Estrutura MoSCoW com Story Points e RICE |
| **Conexão B2B com lojas parceiras**| *Fazendo ➔ Finalizado* | `backend/routers/partnerships.py`, `PartnershipHubModal.jsx` | ✅ Concluído | Paginação server-side, cache TTL 60s, skeleton shimmer |
| **Feedback do YOLOv8 pós-laudo** | *A Fazer* | Pipeline de OCR/Visão para fotos anexas no PDF | ⏳ A Fazer | Detalhamento na seção 4 deste documento |

---

## 🎯 3. Visão do Produto e Objetivos Estratégicos (OKRs)

O **Automatch** tem como missão eliminar a assimetria de informações e fraudes na comercialização de veículos seminovos e de alta procedência. O sistema combina **visão computacional**, **inteligência artificial generativa**, **auditoria cadastral em tempo real (FIPE/DETRAN)**, **rede B2B de repasse** e um **motor algorítmico de precificação justa (AutoPrice™)**.

### Objetivos Principais (OKRs):
* **OKR 1 (Confiabilidade):** Garantir 100% de rastreabilidade e integridade nos laudos periciais e certidões veiculares emitidas com QR Code.
* **OKR 2 (Experiência do Usuário):** Tempo de resposta de inferência pericial de IA inferior a 2,0 segundos por imagem e zero engasgos no catálogo.
* **OKR 3 (Maturidade de Engenharia):** Arquitetura 100% conteinerizada com Docker Compose, CI/CD no GitHub Actions e suíte com mais de 40 testes automatizados.

---

## 📋 4. Detalhamento dos Itens das Colunas "A Fazer" e "Fazendo"

---

### ⏳ A Fazer (Próxima Implementação do Quadro)

#### 🏷️ [ATM-AI-05] Fazer implementação de feedback do YOLOv8 após upload de laudos cautelares
* **Origem no Quadro:** Coluna `A fazer` (1 cartão)
* **Prioridade:** 🔴 `P0 - Essencial` | **Esforço Estimado:** 8 Story Points
* **Camada:** Backend (`routers/laudos.py` + `ai_vision.py`) + Frontend (`LaudoFeedbackCard.jsx`)
* **Descrição do Usuário:**
  > *Como* vistoriador, lojista ou comprador, *quero* que, após fazer o upload do laudo cautelar em PDF, o modelo YOLOv8 extraia as fotos das peças anexadas no documento e forneça um parecer visual imediato sobre integridade de chassi, longarinas, caixas de roda e pontas de eixo, *para que* o sistema aponte visualmente discrepâncias entre o texto do laudo e as imagens periciais.
* **Critérios de Aceite:**
  - [ ] **Extração de Imagens do PDF:** Extrair streams de imagens embutidas nas páginas periciais do PDF via `PyMuPDF` (`fitz`) ou `pdf2image`.
  - [ ] **Inferência com YOLOv8:** Submeter as imagens extraídas ao classificador/detector de componentes estruturais e avarias da lataria.
  - [ ] **Cruzamento Textual vs Visual:** Confrontar o parecer pericial gerado pelo Gemini/heurística com as marcações detectadas pelo YOLOv8.
  - [ ] **Feedback no Card Visual:** Apresentar no componente `LaudoFeedbackCard.jsx` uma galeria com os recortes inspecionados, caixas delimitadoras (*bounding boxes*) e score percentual de confiança.
  - [ ] **Teste Automatizado:** Criar teste em `test_laudo_yolo_feedback.py` validando o pipeline completo com amostra de PDF pericial.

---

### 🔄 Fazendo ➔ ✅ Finalizado no Código (Conexão B2B)

#### 🏷️ [ATM-B2B-01] Implementação de Conexão B2B com lojas parceiras
* **Origem no Quadro:** Coluna `Fazendo` (1 cartão) ➔ **Finalizado com Sucesso via VLAEG**
* **Prioridade:** 🔴 `P0 - Essencial` | **Esforço Realizado:** 8 Story Points | **Status:** ✅ `Concluído`
* **Camada:** Fullstack (`backend/routers/partnerships.py` + `frontend/src/components/partners/PartnershipHubModal.jsx`)
* **Descrição do Usuário:**
  > *Como* concessionária ou lojista credenciado, *quero* conectar com outras lojas parceiras para visualizar o estoque compartilhado em tempo real, enviar propostas de repasse e gerenciar comissões de venda, *para que* possamos girar veículos parados no pátio com liquidez imediata.
* **Entregas Realizadas:**
  - [x] **Paginação Server-Side:** Rota `GET /api/partnerships/shared-inventory?limit=12&offset=0` com headers `X-Total-Count` e `X-Has-More`.
  - [x] **Performance & Skeleton:** Criação do componente `B2BInventorySkeleton.jsx` com 6 cards em efeito shimmer gradiente.
  - [x] **Cache Client-Side:** Cache em memória (`sharedCarsCacheRef`) com TTL de 60s evitando requisições desnecessárias.
  - [x] **Carregar Mais:** Botão de paginação infinita controlada com preservação do scroll.
  - [x] **Higienização de Interface:** Remoção de grid redundante no rodapé, centralizando convites no card oficial superior (`NewPartnershipInviteCard.jsx`).
  - [x] **Índices de Banco:** Adicionados índices `index=True` em `compartilhavel` e `status_reserva` no modelo `Car`.
  - [x] **Bateria de Testes:** Aprovado em `test_performance_and_fixes.py` e `test_b2b_and_plate.py`.

---

## 🚀 5. Épicos Detalhados e Histórias de Usuário Concluídas

---

### 🛡️ ÉPICO 1: Segurança, Autenticação e Gestão de Acessos (IAM)

#### 🏷️ [ATM-AUTH-01] Autenticação Segura com PBKDF2 e JWT
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Senhas armazenadas com hash `PBKDF2-HMAC-SHA256` (salt de 16 bytes e 100.000 iterações).
* Tokens JWT padrão RFC 7519 com expiração e assinatura HMAC-SHA256.
* Proteção de rotas `/perfil` e `/dashboard` no frontend via `ProtectedRoute.jsx`.

#### 🏷️ [ATM-AUTH-02] Recuperação de Senha com OTP
* **Prioridade:** 🟡 `P1 - Should Have` | **Status:** ✅ `Concluído`
* Código numérico de 6 dígitos com expiração de 15 minutos e rate limiting defensivo de 3 req/hora.
* Endpoints `POST /api/auth/forgot-password` e `POST /api/auth/reset-password`.

---

### 🚗 ÉPICO 2: Gestão de Estoque, Catálogo & Multi-Concessionárias

#### 🏷️ [ATM-CAT-01] Catálogo Vitrine com PostgreSQL e Deduplicação
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Consumo de `GET /api/cars` com suporte a query params (`?brand=&q=&limit=`).
* Deduplicação inteligente e alternância de visualização entre Grade e Lista.

#### 🏷️ [ATM-CAT-02] Cadastro de Veículo com Validação de Placa DETRAN
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Endpoint `POST /api/cars` com preenchimento assistido via consulta de placa Mercosul/antiga.
* Geração de protocolo único de anúncio formatado (`#XXXX-XXXX`).

#### 🏷️ [ATM-CAT-03] Paginação no Servidor e Otimização de Busca
* **Prioridade:** 🟡 `P1 - Should Have` | **Status:** ✅ `Concluído`
* Paginação com envelope `{ items, total, page, pages, limit }` em `GET /api/cars`.
* Busca textual ilike combinada em `brand`, `model` e `description`.

---

### 🔍 ÉPICO 3: Dossiê de Transparência, Laudos Cautelares & DETRAN

#### 🏷️ [ATM-LAUDO-01] Cruzamento de Laudo Cautelar e Preço FIPE
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Consumo assíncrono da API FIPE com cache e fallback para valores de mercado.
* Exibição do termômetro de mercado e variação percentual abaixo/acima da FIPE.

#### 🏷️ [ATM-LAUDO-02] Certidão Cadastral de Débitos e Restrições DETRAN
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Normalização de placas padrão antigo e Mercosul (`ABC1234` e `ABC1D23`).
* Retorno consolidado de IPVA, multas e restrições judiciais (RENAJUD).

#### 🏷️ [ATM-LAUDO-03] Emissão de PDF Oficial A4 com QR Code Autenticador
* **Prioridade:** 🟡 `P1 - Should Have` | **Status:** ✅ `Concluído`
* Geração vetorial com ReportLab e QR Code apontando para `/api/v1/laudos/validar/{protocolo}`.
* Endpoint direto `GET /api/v1/laudos/{car_id}/pdf`.

#### 🏷️ [ATM-LAUDO-04] Upload e Auditoria de Laudos Cautelares com Magic Bytes
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Validação de magic bytes (`%PDF-`) rejeitando arquivos falsos ou corrompidos.
* Inspeção pericial profunda via Google Gemini 1.5 Flash Document AI com fallback heurístico.

---

### 🤖 ÉPICO 4: Inteligência Artificial & Visão Computacional

#### 🏷️ [ATM-AI-01] Scanner Pericial de Avarias por IA Multimodal (Gemini 1.5 Flash)
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Pré-compressão proporcional LANCZOS para otimização de banda.
* Detecção descritiva de amassados, arranhões e score de lataria (0-100%).

#### 🏷️ [ATM-AI-02] Auditoria Visual de Componentes com YOLOv8
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Execução em thread isolada (`asyncio.to_thread`) evitando bloqueios no Event Loop.
* Mapeamento de coordenadas (X, Y) e severidade pericial.

#### 🏷️ [ATM-AI-03] Consultor IA Automatch com Memória Multi-turn (Anti-Repetição)
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Rota `POST /api/chat` recebendo `historico` multi-turn.
* Árvore semântica com respostas específicas para motor, câmbio, consumo, garantia e financiamento, eliminando a repetição em loop de Preço/KM.

#### 🏷️ [ATM-AI-04] Varredura 360° Orbital Fotográfica Pura
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Rotação contínua em 8 quadrantes angulares (0° a 315°).
* Imagem limpa e purificada, desacoplada de marcadores de avaria na imagem da órbita.

#### 🏷️ [ATM-AI-05] Player de Vídeo Pericial de 15 Segundos
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Vídeo de vistoria pericial em 3 checkpoints (frente, lateral e motor/traseira).
* Endpoint `POST /api/v1/pericia/video/upload` com geração assíncrona de timeline.

---

### 💰 ÉPICO 5: Motor de Precificação, Comparador & Multicanal

#### 🏷️ [ATM-FIN-01] Motor AutoPrice™ de Preço Justo de Mercado
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Cálculo de depreciação por KM excedente (R$ 0,10/km acima de 10.000km/ano).
* Dedução de avarias mecânicas/lataria e piso de segurança de 50% da FIPE.

#### 🏷️ [ATM-FIN-02] Comparador Multidimensional de Veículos
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Confronto lado a lado de 2 a 3 veículos simultâneos em 5 dimensões técnicas.
* Memoização com `useMemo`, debounce na busca e limite de 15 carros no seletor.

#### 🏷️ [ATM-FIN-03] Calculadora de Custo Total de Posse (TCO)
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Estimativa de despesa mensal consolidando IPVA estadual, seguro anual, combustível e revisões periódicas.

#### 🏷️ [ATM-FIN-04] Sincronizador Multicanal e Feed XML (AutoAvaliar, OLX)
* **Prioridade:** 🔴 `P0 - Must Have` | **Status:** ✅ `Concluído`
* Sincronização automatizada para portais parceiros ativos.
* Remoção limpa do canal AutoCerto DMS e rota `/api/integrations/autocerto/feed.xml` com 404 limpo.

#### 🏷️ [ATM-FIN-05] Radar de Oportunidades & Alerta de Queda de Preço
* **Prioridade:** 🟡 `P1 - Should Have` | **Status:** ✅ `Concluído`
* Notificações focadas via WhatsApp e E-mail, com remoção completa de WebPush e sanitização defensiva.

---

## 🎯 6. Definição de Pronto (Definition of Done - DoD)

Para que qualquer item deste backlog seja considerado **Concluído (Done)**, ele deve cumprir os seguintes critérios obrigatórios:
1. **Código:** Seguir as diretrizes de Clean Architecture, tipagem com Pydantic v2 no Backend e componentes funcionais no React.
2. **Segurança:** Sem credenciais em código-fonte, sessões protegidas por JWT e validação estrita de uploads.
3. **Desempenho:** Consultas indexadas no banco, uso de paginação (`limit/offset`), memoização de cálculos pesados (`useMemo`) e carregamento com skeletons shimmer.
4. **Resiliência:** Tratamento de exceções com fallbacks inteligentes caso APIs externas (FIPE, DETRAN, Gemini) estejam instáveis.
5. **Automação:** Suíte de testes automatizados com 100% de aprovação no container Docker.
6. **Deploy:** Pipeline de CI no GitHub Actions (`.github/workflows/static.yml`) aprovado com status `success` 🟢.
