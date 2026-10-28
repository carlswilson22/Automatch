# Escopo Completo dos Arquivos do Projeto Automatch™

> **Documento Oficial de Engenharia, Auditoria e Arquitetura de Software**  
> **Data:** Outubro de 2026 | **Versão:** 1.0.0  
> **Plataforma:** Automatch — Ecossistema de Compra, Venda e Repasse de Veículos com Perícia Cautelar por Inteligência Artificial

---

## 1. Visão Geral da Arquitetura

O projeto **Automatch** é estruturado como uma solução full-stack moderna dividida em camadas bem definidas e desacopladas:

1. **Backend (Python / FastAPI):**
   - API REST assíncrona de alta vazão e baixa latência.
   - Camada de persistência relacional com SQLAlchemy com suporte a SQLite (desenvolvimento local) e PostgreSQL (produção).
   - Motor pericial multimodal de visão computacional integrado ao Google Gemini 1.5/2.0 para detecção automatizada de avarias na lataria.
   - Emissão de Dossiês Cautelares Oficiais em PDF vetorial A4 com ReportLab e QR Code de autenticidade pública.
   - Rotinas de background assíncronas com APScheduler para controle de validade de reservas B2B.

2. **Frontend (React 18 / Vite / TailwindCSS):**
   - Single Page Application (SPA) responsiva com divisão de código sob demanda (code-splitting com lazy loading).
   - Design system proprietário (MicroKit UI) com microinterações refinadas (WipeButton, GlowButton, SpotlightCard).
   - Componentes imersivos para vistoria automotiva: visualizador exterior 360°, scanner de avarias, reprodutor pericial de 20s, simuladores de financiamento bancário e de Custo Total de Propriedade (TCO).

3. **API Gateway & Proxy Reverso (Nginx):**
   - Roteamento unificado de requisições de frontend e backend em porta única.
   - Cabeçalhos defensivos de segurança (CSP, HSTS, X-Frame-Options) e compressão gzip.

4. **Controle de Versão de Banco de Dados (Alembic):**
   - Versionamento de esquema idempotente, auditável e reproduzível através de migrações sequenciais rastreadas.

---

## 2. Resumo Quantitativo do Ecossistema

| Categoria Arquitetural | Qtd. Arquivos | Tecnologias Principais |
| :--- | :---: | :--- |
| **Backend — Núcleo & Configuração** | 13 | Python, FastAPI, SQLAlchemy, Pydantic, APScheduler |
| **Backend — Roteadores REST (APIs)** | 11 | FastAPI APIRouter, JWT, OAuth2 Bearer |
| **Backend — Serviços de Domínio & IA** | 3 | Gemini Multimodal API, ReportLab, Pillow |
| **Backend — Migrações & Banco de Dados** | 9 | Alembic, PostgreSQL SQL Dump, SQLite |
| **Backend — Baterias de Testes & Profilers** | 18 | Pytest, Unittest, Asyncio, Concurrent Profiler |
| **Frontend — Aplicação Principal, Rotas & Contextos** | 4 | React 18, React Router v6, Context API |
| **Frontend — Páginas (Views)** | 13 | React JSX, TailwindCSS, Responsive Layouts |
| **Frontend — Componentes de Veículo & Perícia** | 19 | React, Framer Motion, HTML5 Canvas |
| **Frontend — Inventário & Parcerias B2B** | 8 | React, TailwindCSS, Modais Interativos |
| **Frontend — UI, MicroKit & Design System** | 16 | React, Microinterações, CSS Design Tokens |
| **Frontend — Componentes Comuns, Chat & IA** | 7 | React, Error Boundaries, AI Chat Widgets |
| **Frontend — Dados Estáticos & Gerenciadores** | 7 | JavaScript ES6, LocalStorage Cache |
| **Frontend — Serviços & Utilitários** | 11 | Axios/Fetch Client, Algoritmos de Filtro |
| **Frontend — Bateria de Testes Automatizados (MJS)** | 12 | Node.js Test Runner (`.mjs`), Node Assert |
| **Frontend — Configurações, Estilos & Build** | 12 | Vite, TailwindCSS, PostCSS, ESLint, PWA |
| **Infraestrutura — Docker, Gateway & CI/CD** | 9 | Docker, Docker Compose, Nginx, GitHub Actions |
| **Total de Arquivos do Catálogo** | **172** | **Full-Stack Automatch Platform** |

---

## 3. Catálogo Detalhado de Todos os Arquivos

### 3.1 Backend — Núcleo & Configuração (13 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`backend/main.py`](backend/main.py) | Ponto de entrada (entrypoint) da API REST FastAPI do Automatch. | Inicializar o app, registrar middlewares (CORS, GZip, rate-limiting) e conectar todos os roteadores REST. |
| [`backend/database.py`](backend/database.py) | Gerenciador de conexão com banco de dados SQLAlchemy (SQLite / PostgreSQL). | Prover pool de conexões resiliente, suporte dual-mode (dev local e prod conteinerizada) e sessões transacionais. |
| [`backend/models.py`](backend/models.py) | Definição dos modelos ORM das entidades de domínio do ecossistema. | Mapear lojas (Store), catálogo (Car), usuários (User), reservas B2B (CarReservation) e laudos periciais. |
| [`backend/schemas.py`](backend/schemas.py) | Schemas de validação e serialização Pydantic (contratos de entrada/saída). | Validar payloads de requisições REST, sanitizar entradas de formulários e tipar respostas de forma estrita. |
| [`backend/security.py`](backend/security.py) | Módulo de criptografia, hashing de senhas e gestão de tokens JWT/HMAC. | Assegurar autenticação stateless segura com assinatura HMAC-SHA256 e hash bcrypt para proteção de credenciais. |
| [`backend/dependencies.py`](backend/dependencies.py) | Injeção de dependências para endpoints do FastAPI. | Injetar sessões transacionais de banco (get_db) e validar tokens de usuário autenticado (get_current_user). |
| [`backend/security_guard.py`](backend/security_guard.py) | Middleware de rate limiting e defesa em profundidade da API. | Bloquear ataques de força bruta, tráfego malicioso e abuso de endpoints pesados com contador em janela deslizante. |
| [`backend/seed.py`](backend/seed.py) | Script de carga inicial (seed) idempotente de dados de demonstração. | Garantir que a vitrine inicial contenha as 3 lojas oficiais e os 5 carros canônicos com laudos e fotos completos. |
| [`backend/migrate.py`](backend/migrate.py) | Script de automação para execução de migrações no boot da aplicação. | Sincronizar automaticamente as tabelas e índices do banco durante a inicialização em containers ou CI/CD. |
| [`backend/tasks.py`](backend/tasks.py) | Agendador de rotinas periódicas em background (APScheduler). | Executar limpeza de reservas B2B expiradas e rotinas de manutenção sem bloquear as requisições HTTP da API. |
| [`backend/requirements.txt`](backend/requirements.txt) | Especificação das dependências e bibliotecas Python do backend. | Fixar versões exatas de FastAPI, SQLAlchemy, ReportLab, Pydantic e drivers para builds reproduzíveis. |
| [`backend/Dockerfile`](backend/Dockerfile) | Definição de containerização da API FastAPI. | Criar imagem Docker padronizada e leve contendo Python 3.11, dependências e rotinas de inicialização da API. |
| [`backend/.dockerignore`](backend/.dockerignore) | Regras de exclusão para compilação da imagem Docker do backend. | Evitar envio de arquivos desnecessários (__pycache__, logs, testes) para a camada de build do Docker. |

---

### 3.2 Backend — Roteadores REST (APIs) (11 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`backend/routers/__init__.py`](backend/routers/__init__.py) | Inicialização e agrupamento do pacote de roteadores HTTP. | Permitir a importação modular de todos os endpoints REST no FastAPI main.py. |
| [`backend/routers/cars.py`](backend/routers/cars.py) | CRUD central do catálogo de veículos e vitrine pública. | Prover listagem paginada, filtros avançados de busca, cadastro, edição e exclusão de anúncios. |
| [`backend/routers/auth.py`](backend/routers/auth.py) | Endpoints de autenticação, registro e onboarding de usuários. | Gerenciar fluxo de login, criação de contas particulares e credenciamento de concessionárias na rede. |
| [`backend/routers/ai_vision.py`](backend/routers/ai_vision.py) | Endpoint de perícia visual por Inteligência Artificial (Automatch Vision). | Processar fotos de veículos via Gemini Vision API e algoritmos de visão local para detectar avarias na lataria. |
| [`backend/routers/vehicle_lookup.py`](backend/routers/vehicle_lookup.py) | Decodificação e preenchimento automático por placa e chassi. | Autopreencher dados técnicos (marca, modelo, ano, FIPE) de anúncios a partir de placas Mercosul ou antigas. |
| [`backend/routers/detran.py`](backend/routers/detran.py) | Consulta de histórico veicular e procedência legal. | Verificar multas, gravames, restrições financeiras e histórico de leilão para emissão de laudo cautelar. |
| [`backend/routers/laudos_export.py`](backend/routers/laudos_export.py) | Exportação e download formal de laudos periciais. | Gerar e entregar o Dossiê Cautelar Oficial Automatch™ em PDF vetorial A4 com QR Code de autenticação pública. |
| [`backend/routers/partnerships.py`](backend/routers/partnerships.py) | Gestão do Hub B2B de parcerias entre concessionárias. | Possibilitar convites de parceria comercial, chat privado entre lojistas e rede de repasse com desconto exclusivo. |
| [`backend/routers/uploads.py`](backend/routers/uploads.py) | Processamento assíncrono de upload de mídias e fotos. | Validar formato de imagens (Pillow), sanitizar arquivos e servir mídias estáticas de veículos. |
| [`backend/routers/alerts.py`](backend/routers/alerts.py) | Gestão de watchlist e alertas de redução de preço. | Permitir que compradores definam preço-alvo para veículos e recebam notificações de descontos aplicados. |
| [`backend/routers/integrations.py`](backend/routers/integrations.py) | Sincronização multicanal de anúncios (Webmotors, OLX, iCarros). | Permitir publicação simultânea em múltiplos portais e unificação de status de estoque. |

---

### 3.3 Backend — Serviços de Domínio & IA (3 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`backend/services/ai_service.py`](backend/services/ai_service.py) | Motor central de Inteligência Artificial Multimodal (Gemini Vision + Chat). | Conectar à API do Gemini com fallback resiliente para análise pericial de fotos e consultor virtual inteligente. |
| [`backend/services/pricing_service.py`](backend/services/pricing_service.py) | Algoritmo de cálculo do Preço Justo Automatch™ (AutoPrice). | Calcular a cotação real com base na FIPE, quilometragem versus expectativa anual e avarias detectadas. |
| [`backend/services/pdf_generator.py`](backend/services/pdf_generator.py) | Gerador de documentos PDF vetoriais em formato A4 (ReportLab). | Renderizar o Dossiê Cautelar Oficial com texto selecionável, tabelas estilizadas e QR Code criptográfico. |

---

### 3.4 Backend — Migrações & Banco de Dados (9 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`backend/backup_pre_perfis_postgres.sql`](backend/backup_pre_perfis_postgres.sql) | Dump de segurança de tabelas e registros do PostgreSQL. | Garantir restauração imediata do banco em caso de anomalias durante migrações estruturais de perfis de usuário. |
| [`backend/alembic/env.py`](backend/alembic/env.py) | Script de inicialização do ambiente de migrações Alembic. | Conectar o engine do SQLAlchemy aos metadados dos modelos para geração e execução de migrações. |
| [`backend/alembic.ini`](backend/alembic.ini) | Arquivo de configuração central do Alembic. | Definir caminhos de scripts, templates de migração e opções de logging do versionamento de schema. |
| [`backend/alembic/script.py.mako`](backend/alembic/script.py.mako) | Template Mako para geração de novos scripts de migração. | Padronizar cabeçalhos, funções upgrade() e downgrade() nos scripts versionados pelo Alembic. |
| [`backend/alembic/versions/001_initial_schema.py`](backend/alembic/versions/001_initial_schema.py) | Migração de criação do esquema baseline de dados. | Criar as tabelas iniciais stores, cars e users com restrições e relacionamentos fundamentais. |
| [`backend/alembic/versions/002_type_consistency.py`](backend/alembic/versions/002_type_consistency.py) | Migração de padronização e consistência de tipos. | Harmonizar colunas monetárias e identificadores entre SQLite e PostgreSQL. |
| [`backend/alembic/versions/004_unify_user_roles.py`](backend/alembic/versions/004_unify_user_roles.py) | Migração para unificação de papéis (roles) de usuários. | Consolidar as roles buyer, seller, dealership e admin para controle estrito de RBAC. |
| [`backend/alembic/versions/005_fix_b2b_financial_types.py`](backend/alembic/versions/005_fix_b2b_financial_types.py) | Migração de precisão decimal para transações financeiras B2B. | Converter tipos de preço e comissão de Float para Numeric(12,2) para eliminar imprecisões de arredondamento. |
| [`backend/alembic/versions/9e22ea1485c3_add_missing_indexes_and_fks.py`](backend/alembic/versions/9e22ea1485c3_add_missing_indexes_and_fks.py) | Migração de criação de índices de alta performance e chaves estrangeiras. | Otimizar queries frequentes de busca (marca, modelo, loja_id) e garantir integridade referencial estrita. |

---

### 3.5 Backend — Baterias de Testes & Profilers (18 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`backend/audit_performance_profiler.py`](backend/audit_performance_profiler.py) | Profiler de carga e auditoria de concorrência. | Simular múltiplos lojistas e compradores simultâneos medindo tempos de resposta sob stress. |
| [`backend/demo_live_docker_user_journey.py`](backend/demo_live_docker_user_journey.py) | Script de demonstração de ponta a ponta da jornada do usuário. | Executar fluxo ao vivo de cadastro, login, busca, laudo por IA e simulação de proposta em ambiente Docker. |
| [`backend/run_e2e_docker_test.py`](backend/run_e2e_docker_test.py) | Suíte de testes end-to-end contra o container Docker oficial. | Validar toda a pilha de serviços em execução no container sob as mesmas condições de produção. |
| [`backend/test_ai_streaming.py`](backend/test_ai_streaming.py) | Testes de streaming de IA e resiliência com fallback. | Garantir que respostas parciais via SSE cheguem ao cliente e o fallback funcione sem exceções. |
| [`backend/test_audit_full_battery.py`](backend/test_audit_full_battery.py) | Bateria completa de auditoria de segurança da API. | Validar cabeçalhos HTTP (HSTS, CSP), rotas autenticadas e proteção contra injection. |
| [`backend/test_b2b_and_plate.py`](backend/test_b2b_and_plate.py) | Testes de repasse B2B entre concessionárias e consulta de placas. | Verificar regras de reserva de veículos entre parceiros e normalização de placas Mercosul. |
| [`backend/test_defects_resolution_battery.py`](backend/test_defects_resolution_battery.py) | Bateria de regressão para validação de defeitos corrigidos. | Impedir o retorno de falhas históricas de validação, tipos de dados e concorrência. |
| [`backend/test_full_system_review.py`](backend/test_full_system_review.py) | Revisão e validação integrada ponta a ponta de todos os módulos. | Verificar interoperabilidade entre catálogo, laudos, fotos, uploads e usuários. |
| [`backend/test_health_probes.py`](backend/test_health_probes.py) | Testes das sondas de liveness, readiness e métricas. | Garantir que endpoints de health check reflitam fielmente a saúde do banco e scheduler. |
| [`backend/test_improvements_battery.py`](backend/test_improvements_battery.py) | Testes de melhorias contínuas de robustez da API. | Validar performance de filtros compostos, paginação e conexões concorrentes. |
| [`backend/test_laudo_yolo_feedback.py`](backend/test_laudo_yolo_feedback.py) | Testes de emissão pericial e feedback de detecção por IA. | Avaliar acurácia das anotações de avarias em imagens de lataria e emissão do laudo. |
| [`backend/test_performance_and_fixes.py`](backend/test_performance_and_fixes.py) | Benchmark de latência e verificação de correções de bugs. | Garantir que tempo de resposta de requisições atenda aos SLAs de performance. |
| [`backend/test_persistent_fixes.py`](backend/test_persistent_fixes.py) | Testes de persistência de dados em SQLite e PostgreSQL. | Assegurar que transações mantenham integridade ACID em ambos os motores de banco. |
| [`backend/test_query_count_battery.py`](backend/test_query_count_battery.py) | Auditoria de contagem de queries SQL (prevenção N+1). | Garantir uso de joinedload e selectinload para manter o número de queries previsível sob carga. |
| [`backend/test_round3_regressions.py`](backend/test_round3_regressions.py) | Bateria de proteção anti-regressão da rodada 3 de estabilização. | Proteger endpoints contra quebras em edge cases de moedas, datas e campos opcionais. |
| [`backend/test_sprint07_battery.py`](backend/test_sprint07_battery.py) | Testes de aceitação das funcionalidades da Sprint 07. | Validar sincronização multicanal, novos filtros e melhorias na visualização de carros. |
| [`backend/test_usecases_full_battery.py`](backend/test_usecases_full_battery.py) | Bateria de casos de uso completos (comprador, lojista, anunciante). | Simular ações reais de busca, proposta, agendamento de laudo e compra de veículos. |
| [`backend/test_vision_and_delete.py`](backend/test_vision_and_delete.py) | Testes do scanner de fotos e ciclo de soft-delete de veículos. | Garantir que a exclusão de anúncios limpe dependências e preserve histórico cautelar. |

---

### 3.6 Frontend — Aplicação Principal, Rotas & Contextos (4 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`frontend/src/App.jsx`](frontend/src/App.jsx) | Componente raiz da SPA React com roteador e provedores globais. | Centralizar roteamento (React Router), code splitting dinâmico e fronteiras de erro. |
| [`frontend/src/main.jsx`](frontend/src/main.jsx) | Ponto de montagem (entrypoint) do React 18 no DOM (#root). | Inicializar createRoot, carregar folhas de estilo globais e renderizar a aplicação. |
| [`frontend/src/contexts/AuthContext.jsx`](frontend/src/contexts/AuthContext.jsx) | Contexto global de autenticação e sessão do usuário. | Compartilhar dados de usuário autenticado, papéis de acesso e métodos de login/logout. |
| [`frontend/src/components/ProtectedRoute.jsx`](frontend/src/components/ProtectedRoute.jsx) | Guardião de rotas privadas e autenticadas. | Impedir acesso de usuários deslogados a telas como Dashboard, Perfil e Novo Anúncio. |

---

### 3.7 Frontend — Páginas (Views) (13 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`frontend/src/pages/Home.jsx`](frontend/src/pages/Home.jsx) | Landing page principal do portal Automatch. | Apresentar a proposta de valor, hero interativo, busca rápida e carros certificados em destaque. |
| [`frontend/src/pages/ShowcaseCatalog.jsx`](frontend/src/pages/ShowcaseCatalog.jsx) | Catálogo geral de veículos com filtros dinâmicos e paginação. | Permitir navegação precisa por marca, modelo, faixa de preço, ano, quilometragem e laudo. |
| [`frontend/src/pages/ShowcaseVehicleDetails.jsx`](frontend/src/pages/ShowcaseVehicleDetails.jsx) | Página de detalhes aprofundados e ficha técnica do veículo. | Reunir tour 360°, fotos HD, laudo pericial, simulador de financiamento e contato com vendedor. |
| [`frontend/src/pages/AuthPage.jsx`](frontend/src/pages/AuthPage.jsx) | Página unificada de login, cadastro e onboarding de lojistas. | Prover formulário elegante para entrada de usuários com validação visual e persistência de sessão. |
| [`frontend/src/pages/Dashboard.jsx`](frontend/src/pages/Dashboard.jsx) | Painel analítico e administrativo do lojista. | Exibir métricas de visualizações, propostas recebidas, gestão de estoque e rede de repasse B2B. |
| [`frontend/src/pages/NewCarAdForm.jsx`](frontend/src/pages/NewCarAdForm.jsx) | Formulário passo a passo para cadastro de novos anúncios de veículos. | Guiar o anunciante na inserção de dados por placa, upload de fotos e laudo pericial. |
| [`frontend/src/pages/MyAdsPage.jsx`](frontend/src/pages/MyAdsPage.jsx) | Página de gestão dos anúncios criados pelo usuário anunciante. | Permitir editar preços, alterar fotos, acompanhar laudos e pausar anúncios ativos. |
| [`frontend/src/pages/FavoritesPage.jsx`](frontend/src/pages/FavoritesPage.jsx) | Página dedicada à lista de veículos favoritados pelo comprador. | Facilitar acesso rápido a carros salvos e possibilitar comparação técnica lado a lado. |
| [`frontend/src/pages/HowItWorksPage.jsx`](frontend/src/pages/HowItWorksPage.jsx) | Página institucional explicando a metodologia de compra segura. | Esclarecer as etapas de vistoria por IA, Preço Justo e garantia de procedência. |
| [`frontend/src/pages/PlansPage.jsx`](frontend/src/pages/PlansPage.jsx) | Apresentação comercial dos planos de assinatura para lojistas. | Detalhar benefícios dos planos Gratuito, Pro e Concessionária Premium para conversão. |
| [`frontend/src/pages/CheckoutPage.jsx`](frontend/src/pages/CheckoutPage.jsx) | Página de checkout e pagamento de planos e laudos avulsos. | Processar pagamentos com cartão, PIX e boleto com confirmação imediata. |
| [`frontend/src/pages/ProfilePage.jsx`](frontend/src/pages/ProfilePage.jsx) | Gerenciamento de perfil e configurações de segurança da conta. | Permitir alterar nome, telefone, senha e dados da concessionária vinculada. |
| [`frontend/src/pages/PublicValidationPage.jsx`](frontend/src/pages/PublicValidationPage.jsx) | Página pública de validação e autenticidade de laudo cautelar. | Permitir a qualquer interessado ou cartório validar a integridade do dossiê via código ou QR Code. |

---

### 3.8 Frontend — Componentes de Veículo & Perícia (19 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`frontend/src/components/vehicle/AutomatchScan.jsx`](frontend/src/components/vehicle/AutomatchScan.jsx) | Interface visual do scanner pericial com mapa interativo de avarias. | Destacar visualmente na carroceria as peças originais, retoques de pintura e reparos periciados. |
| [`frontend/src/components/vehicle/Vehicle360Viewer.jsx`](frontend/src/components/vehicle/Vehicle360Viewer.jsx) | Visualizador interativo em 360 graus do exterior do veículo. | Permitir giro contínuo de 360° com arrasto do mouse para inspeção de todos os ângulos do veículo. |
| [`frontend/src/components/vehicle/OfficialDossierModal.jsx`](frontend/src/components/vehicle/OfficialDossierModal.jsx) | Modal de visualização e exportação do Dossiê Cautelar Oficial. | Exibir a íntegra do laudo pericial com score e botão para download do PDF formal. |
| [`frontend/src/components/vehicle/MarketPriceIndicator.jsx`](frontend/src/components/vehicle/MarketPriceIndicator.jsx) | Comparativo entre Preço Anunciado, FIPE e Preço Justo Automatch. | Demonstrar visualmente se o valor ofertado é um bom negócio em relação ao mercado. |
| [`frontend/src/components/vehicle/FinancingSimulator.jsx`](frontend/src/components/vehicle/FinancingSimulator.jsx) | Simulador interativo de parcelas de financiamento bancário. | Permitir ao comprador calcular parcelas de 12x a 60x variando a entrada e taxas de juros. |
| [`frontend/src/components/vehicle/TcoCalculatorCard.jsx`](frontend/src/components/vehicle/TcoCalculatorCard.jsx) | Calculadora de Custo Total de Propriedade (TCO) do veículo. | Projetar despesas de combustível, IPVA, seguro e manutenção preventiva nos primeiros anos. |
| [`frontend/src/components/vehicle/TradeInSimulator.jsx`](frontend/src/components/vehicle/TradeInSimulator.jsx) | Simulador de avaliação de veículo usado na troca. | Estimar valorização do carro atual do cliente como entrada na compra de um modelo do catálogo. |
| [`frontend/src/components/vehicle/EngineAcousticScanner.jsx`](frontend/src/components/vehicle/EngineAcousticScanner.jsx) | Scanner acústico de saúde mecânica do motor. | Analisar áudio do motor para diagnóstico preventivo de ruídos e componentes móveis. |
| [`frontend/src/components/vehicle/TireDepthScanner.jsx`](frontend/src/components/vehicle/TireDepthScanner.jsx) | Scanner visual de profundidade dos sulcos dos pneus. | Medir desgaste e vida útil restante dos pneus dianteiros e traseiros. |
| [`frontend/src/components/vehicle/PericialVideoViewer.jsx`](frontend/src/components/vehicle/PericialVideoViewer.jsx) | Reprodutor de vídeo da vistoria pericial em alta definição. | Exibir o vídeo de 20s com marcações de tempo nos pontos inspecionados da carroceria e motor. |
| [`frontend/src/components/vehicle/VehicleComparatorModal.jsx`](frontend/src/components/vehicle/VehicleComparatorModal.jsx) | Comparador técnico lado a lado de até 3 veículos. | Facilitar a decisão do comprador entre modelos concorrentes do catálogo. |
| [`frontend/src/components/vehicle/AIChatBox.jsx`](frontend/src/components/vehicle/AIChatBox.jsx) | Chat inteligente contextualizado com o veículo em tela. | Tirar dúvidas específicas sobre o carro selecionado (consumo, revisões, laudo). |
| [`frontend/src/components/vehicle/SellerChat.jsx`](frontend/src/components/vehicle/SellerChat.jsx) | Canal de chat direto e seguro com o lojista/vendedor. | Viabilizar propostas imediatas e agendamento de test-drive pela plataforma. |
| [`frontend/src/components/vehicle/PriceAlertModal.jsx`](frontend/src/components/vehicle/PriceAlertModal.jsx) | Modal para cadastro de alerta de queda de preço. | Notificar o interessado quando o valor do anúncio for reduzido. |
| [`frontend/src/components/vehicle/PriceDropBadge.jsx`](frontend/src/components/vehicle/PriceDropBadge.jsx) | Selo visual destacando redução recente de preço. | Exibir valor anterior riscado e valor economizado para atrair compradores. |
| [`frontend/src/components/vehicle/WarrantyBadgeModal.jsx`](frontend/src/components/vehicle/WarrantyBadgeModal.jsx) | Modal de cobertura e termos de garantia mecânica. | Apresentar itens cobertos (motor, câmbio) e certificado de garantia do veículo. |
| [`frontend/src/components/vehicle/MultichannelSyncModal.jsx`](frontend/src/components/vehicle/MultichannelSyncModal.jsx) | Modal de sincronização do anúncio com Webmotors, OLX e iCarros. | Publicar o veículo simultaneamente em outros canais com sincronia de estoque. |
| [`frontend/src/components/vehicle/LaudoFeedbackCard.jsx`](frontend/src/components/vehicle/LaudoFeedbackCard.jsx) | Card de avaliação e feedback do usuário sobre o laudo. | Coletar dados para aprimoramento contínuo dos modelos periciais de IA. |
| [`frontend/src/components/vehicle/AccordionPanel.jsx`](frontend/src/components/vehicle/AccordionPanel.jsx) | Painel sanfonado expansível para itens técnicos do veículo. | Organizar itens de série, opcionais e histórico de revisões de forma limpa. |

---

### 3.9 Frontend — Inventário & Parcerias B2B (8 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`frontend/src/components/inventory/B2BRepassePanel.jsx`](frontend/src/components/inventory/B2BRepassePanel.jsx) | Painel de veículos para repasse B2B entre concessionárias. | Acelerar liquidez de estoque com preços especiais de atacado e margem negociável. |
| [`frontend/src/components/inventory/AIStudioModal.jsx`](frontend/src/components/inventory/AIStudioModal.jsx) | Estúdio de edição de fotos de veículos por IA. | Permitir remover fundos de fotos e aplicar cenários de showroom virtual. |
| [`frontend/src/components/inventory/AssetConfigurationModal.jsx`](frontend/src/components/inventory/AssetConfigurationModal.jsx) | Modal de configuração de mídias e fotos 360° do estoque. | Associar laudos PDF, fotos sequenciais e vídeos periciais a cada carro da loja. |
| [`frontend/src/components/partners/PartnershipHubModal.jsx`](frontend/src/components/partners/PartnershipHubModal.jsx) | Hub central de parcerias comerciais entre concessionárias. | Gerenciar lojas conectadas, convites de parceria e métricas de repasse. |
| [`frontend/src/components/partners/PartnerChatModal.jsx`](frontend/src/components/partners/PartnerChatModal.jsx) | Modal de negociação direta e chat B2B entre lojistas. | Negociar repasses, enviar contrapropostas e reservar unidades em tempo real. |
| [`frontend/src/components/partners/NewPartnershipInviteCard.jsx`](frontend/src/components/partners/NewPartnershipInviteCard.jsx) | Card de envio de convite para novas parcerias comerciais. | Expandir a rede de repasse convidando novas lojas por link ou e-mail. |
| [`frontend/src/components/partners/B2BInventorySkeleton.jsx`](frontend/src/components/partners/B2BInventorySkeleton.jsx) | Skeleton loader do painel de inventário B2B. | Fornecer feedback visual enquanto a tabela de repasse é carregada. |
| [`frontend/src/components/layout/StoreSelector.jsx`](frontend/src/components/layout/StoreSelector.jsx) | Seletor de concessionária parceira para navegação filtrada. | Permitir ao usuário alternar a vitrine entre lojas físicas credenciadas na rede. |

---

### 3.10 Frontend — UI, MicroKit & Design System (16 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`frontend/src/components/ui/CarCard.jsx`](frontend/src/components/ui/CarCard.jsx) | Card canônico de veículo para a vitrine e catálogo. | Apresentar dados essenciais (foto, preço, km, laudo, loja) com hover animado. |
| [`frontend/src/components/ui/AutomatchLogo.jsx`](frontend/src/components/ui/AutomatchLogo.jsx) | Logotipo vetorial oficial da marca Automatch. | Garantir padronização visual da marca em cabeçalhos, rodapés e telas institucionais. |
| [`frontend/src/components/ui/StoreBadge.jsx`](frontend/src/components/ui/StoreBadge.jsx) | Selo visual da loja/concessionária responsável pelo anúncio. | Identificar lojas oficiais certificadas pelo Automatch nos cards. |
| [`frontend/src/components/ui/StoreIdentifier.jsx`](frontend/src/components/ui/StoreIdentifier.jsx) | Identificador resumido da concessionária com avaliação e local. | Apresentar dados compactos da loja nos detalhes e listas de veículos. |
| [`frontend/src/components/ui/FocusInput.jsx`](frontend/src/components/ui/FocusInput.jsx) | Campo de input com foco dinâmico. | Padronizar formulários com microinterações suaves de foco e digitação. |
| [`frontend/src/components/ui/GlowButton.jsx`](frontend/src/components/ui/GlowButton.jsx) | Botão com efeito de iluminação e brilho (glow). | Destacar chamadas de ação prioritárias (CTAs) com acabamento premium. |
| [`frontend/src/components/ui/SlidingTabs.jsx`](frontend/src/components/ui/SlidingTabs.jsx) | Abas deslizantes com indicador animado de seleção. | Prover navegação visual fluida entre opções e categorias. |
| [`frontend/src/components/ui/WipeButton.jsx`](frontend/src/components/ui/WipeButton.jsx) | Botão com animação wipe de preenchimento ao passar o mouse. | Oferecer interação moderna no design system da plataforma. |
| [`frontend/src/components/ui/microkit/index.js`](frontend/src/components/ui/microkit/index.js) | Ponto central de exportação do MicroKit UI. | Permitir importações unificadas e limpas de todos os micro-componentes. |
| [`frontend/src/components/ui/microkit/SpotlightCard.jsx`](frontend/src/components/ui/microkit/SpotlightCard.jsx) | Card interativo com iluminação spotlight que segue o cursor. | Elevar o impacto visual de cards e destaques na vitrine. |
| [`frontend/src/components/ui/microkit/IconSwapButton.jsx`](frontend/src/components/ui/microkit/IconSwapButton.jsx) | Botão com alternância animada de ícones. | Dar feedback imediato em ações de favoritar, copiar e curtir. |
| [`frontend/src/components/ui/microkit/AutomatchLogo.jsx`](frontend/src/components/ui/microkit/AutomatchLogo.jsx) | Versão do logotipo empacotada no MicroKit. | Garantir disponibilidade do logo dentro do kit modular desacoplado. |
| [`frontend/src/components/ui/microkit/FocusInput.jsx`](frontend/src/components/ui/microkit/FocusInput.jsx) | Versão do FocusInput incluída no MicroKit. | Reutilização do input com borda animada em múltiplos contextos. |
| [`frontend/src/components/ui/microkit/GlowButton.jsx`](frontend/src/components/ui/microkit/GlowButton.jsx) | Versão do GlowButton empacotada no MicroKit. | Modularidade do botão com brilho neon para todo o frontend. |
| [`frontend/src/components/ui/microkit/SlidingTabs.jsx`](frontend/src/components/ui/microkit/SlidingTabs.jsx) | Versão das abas deslizantes no MicroKit. | Reutilização do componente de tabs em telas desacopladas. |
| [`frontend/src/components/ui/microkit/WipeButton.jsx`](frontend/src/components/ui/microkit/WipeButton.jsx) | Versão do WipeButton no MicroKit. | Modularidade do botão com efeito wipe para todo o design system. |

---

### 3.11 Frontend — Componentes Comuns, Chat & IA (7 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`frontend/src/components/ai/AutomatchAI.jsx`](frontend/src/components/ai/AutomatchAI.jsx) | Assistente flutuante de inteligência artificial da plataforma. | Tirar dúvidas do cliente sobre veículos, laudos e compra com linguagem natural. |
| [`frontend/src/components/chat/HomeSupportChat.jsx`](frontend/src/components/chat/HomeSupportChat.jsx) | Widget de atendimento e suporte na página inicial. | Facilitar contato imediato e esclarecer dúvidas frequentes de novos visitantes. |
| [`frontend/src/components/common/ErrorBoundary.jsx`](frontend/src/components/common/ErrorBoundary.jsx) | Fronteira de contenção de erros de renderização (React Error Boundary). | Capturar exceções em componentes filhos e exibir estado amigável sem quebrar a tela. |
| [`frontend/src/components/common/GlobalErrorBoundary.jsx`](frontend/src/components/common/GlobalErrorBoundary.jsx) | Error Boundary global de último nível da aplicação. | Blindar toda a SPA contra crashes inesperados de JavaScript com opção de recarga. |
| [`frontend/src/components/common/RouteLoadingSkeleton.jsx`](frontend/src/components/common/RouteLoadingSkeleton.jsx) | Skeleton loader de transição entre páginas. | Prover feedback visual elegante durante carregamento assíncrono de rotas (lazy loading). |
| [`frontend/src/components/common/VehicleCardSkeleton.jsx`](frontend/src/components/common/VehicleCardSkeleton.jsx) | Skeleton loader para cards de veículos no catálogo. | Manter a estrutura da grade enquanto dados são carregados via API. |

---

### 3.12 Frontend — Dados Estáticos & Gerenciadores (7 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`frontend/src/data/favoritesManager.js`](frontend/src/data/favoritesManager.js) | Gerenciador local da lista de veículos favoritos (localStorage). | Permitir salvar e consultar carros favoritos no navegador de forma resiliente. |
| [`frontend/src/data/newCarsManager.js`](frontend/src/data/newCarsManager.js) | Gerenciador local de anúncios recém-cadastrados. | Persistir novos anúncios localmente para exibição imediata na vitrine. |
| [`frontend/src/data/showcaseData.js`](frontend/src/data/showcaseData.js) | Coleção de dados canônicos dos 5 veículos da vitrine. | Servir como fallback estático dos veículos (Corolla, Civic, Compass, Pulse, Tracker). |
| [`frontend/src/data/plansData.js`](frontend/src/data/plansData.js) | Tabela comercial de planos de assinatura e laudos avulsos. | Centralizar valores e benefícios dos planos Free, Pro e Concessionária. |
| [`frontend/src/data/howItWorksData.js`](frontend/src/data/howItWorksData.js) | Dados das etapas explicativas do funcionamento do portal. | Alimentar as seções instrutivas da página Como Funciona. |
| [`frontend/src/data/mockData.js`](frontend/src/data/mockData.js) | Base de dados simulada para desenvolvimento e testes offline. | Permitir execução e teste completo da interface sem necessidade de backend ativo. |
| [`frontend/src/data/inventoryData.js`](frontend/src/data/inventoryData.js) | Modelos de dados estruturados para o painel de estoque. | Fornecer sementes de histórico de movimentação de veículos para lojistas. |

---

### 3.13 Frontend — Serviços & Utilitários (11 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`frontend/src/services/apiClient.js`](frontend/src/services/apiClient.js) | Cliente HTTP centralizado para requisições à API REST. | Padronizar chamadas, injetar token Bearer JWT e tratar erros de forma uniforme. |
| [`frontend/src/services/aiChatService.js`](frontend/src/services/aiChatService.js) | Cliente de comunicação com o serviço de chat por IA. | Conectar a interface aos endpoints de consultoria e streaming do backend. |
| [`frontend/src/utils/filterVehicles.js`](frontend/src/utils/filterVehicles.js) | Motor de filtragem reativa em memória de veículos. | Filtrar por múltiplos critérios combinados (preço, ano, km, carroceria) instantaneamente. |
| [`frontend/src/utils/vehicleMapper.js`](frontend/src/utils/vehicleMapper.js) | Mapeador de contratos de dados (Backend -> Frontend). | Transformar respostas da API nas estruturas consumidas pelos componentes visuais. |
| [`frontend/src/utils/vehicleNormalizer.js`](frontend/src/utils/vehicleNormalizer.js) | Normalizador e sanitizador de dados de veículos. | Formatar placas, moedas, quilometragens e dados de fabricante antes da renderização. |
| [`frontend/src/utils/aiConsultantCore.js`](frontend/src/utils/aiConsultantCore.js) | Lógica do consultor virtual e cálculo de afinidade. | Calcular compatibilidade entre preferências do comprador e carros do estoque. |
| [`frontend/src/utils/imageHelper.js`](frontend/src/utils/imageHelper.js) | Utilitários para tratamento e resolução de imagens de veículos. | Resolver URLs absolutas/relativas e aplicar fallbacks em caso de imagem indisponível. |
| [`frontend/src/utils/animations.js`](frontend/src/utils/animations.js) | Variantes e configurações de transição Framer Motion. | Padronizar animações de entrada, fade, slide e modais no design system. |
| [`frontend/src/utils/motionTokens.js`](frontend/src/utils/motionTokens.js) | Tokens de temporização e curvas de aceleração cúbica (easings). | Assegurar consistência rítmica e visual em todas as animações da interface. |
| [`frontend/src/utils/useScrollLock.js`](frontend/src/utils/useScrollLock.js) | Hook React para gerenciamento de travamento de rolagem. | Encapsular o bloqueio de scroll da página ao abrir componentes de diálogo e modais. |
| [`frontend/src/utils/scrollLockCore.js`](frontend/src/utils/scrollLockCore.js) | Lógica central de bloqueio do scroll do elemento body. | Evitar rolagem dupla no fundo enquanto gavetas ou modais estão ativos. |

---

### 3.14 Frontend — Bateria de Testes Automatizados (MJS) (12 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`frontend/tests/test_body_type_sedan.mjs`](frontend/tests/test_body_type_sedan.mjs) | Testes de validação dos tipos de carroceria (sedan, SUV, hatch). | Garantir que a categorização e filtragem por carroceria operem sem divergências. |
| [`frontend/tests/test_design_tokens_battery.mjs`](frontend/tests/test_design_tokens_battery.mjs) | Testes de integridade dos design tokens de UI. | Validar cores, fontes, variáveis CSS e conformidade visual com o design system. |
| [`frontend/tests/test_features_battery.mjs`](frontend/tests/test_features_battery.mjs) | Suíte de testes de funcionalidades da vitrine e catálogo. | Validar ordenação por preço, busca textual, contadores e persistência de favoritos. |
| [`frontend/tests/test_filter_vehicles.mjs`](frontend/tests/test_filter_vehicles.mjs) | Testes unitários do algoritmo filterVehicles. | Testar exaustivamente cenários combinados de filtros de preço, km e ano. |
| [`frontend/tests/test_gh_pages_demo_mode.mjs`](frontend/tests/test_gh_pages_demo_mode.mjs) | Testes do modo de demonstração no GitHub Pages. | Garantir funcionamento fluido da aplicação estática sem backend ativo. |
| [`frontend/tests/test_new_features_battery.mjs`](frontend/tests/test_new_features_battery.mjs) | Bateria de testes das interfaces e modais expandidos. | Assegurar funcionamento dos modais de perícia, simulação e dossiê em PDF. |
| [`frontend/tests/test_novidade_and_price_drop.mjs`](frontend/tests/test_novidade_and_price_drop.mjs) | Testes dos selos de Novidade e Queda de Preço. | Validar cálculo automático de atribuição das badges de promoção e desconto. |
| [`frontend/tests/test_scanner_ia_and_360_4cars.mjs`](frontend/tests/test_scanner_ia_and_360_4cars.mjs) | Testes do scanner de avarias por IA e giro 360° em 4 veículos. | Validar detecção pericial de lataria e rotação de fotos em 360 graus. |
| [`frontend/tests/test_security_audit.mjs`](frontend/tests/test_security_audit.mjs) | Auditoria de segurança de código e pacotes do frontend. | Garantir conformidade com OWASP Top 10, sanitização contra XSS e RBAC no frontend. |
| [`frontend/tests/test_video_20s_and_chatbot_consumo.mjs`](frontend/tests/test_video_20s_and_chatbot_consumo.mjs) | Testes da duração de vídeo de 20s e respostas de consumo do chatbot. | Validar cumprimento dos requisitos de vídeo pericial e respostas de km/l. |
| [`frontend/tests/test_visual_and_360_experience.mjs`](frontend/tests/test_visual_and_360_experience.mjs) | Bateria de testes da experiência visual e animações. | Auditar fluidez de transições do Framer Motion e responsividade em diferentes telas. |

---

### 3.15 Frontend — Configurações, Estilos & Build (12 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`frontend/index.html`](frontend/index.html) | Documento HTML raiz da Single Page Application. | Montagem do #root, metatags de SEO, importação de fontes Google e favicon. |
| [`frontend/src/index.css`](frontend/src/index.css) | Folha de estilos central e diretivas globais. | Configurar camadas do TailwindCSS, variáveis de cores CSS e classes utilitárias. |
| [`frontend/vite.config.js`](frontend/vite.config.js) | Configuração de empacotamento e build do Vite. | Configurar HMR rápido, plugins React, code-splitting e otimizações de bundle. |
| [`frontend/tailwind.config.js`](frontend/tailwind.config.js) | Configuração do framework de utilitários TailwindCSS. | Definir paleta de cores institucional, fontes e breakpoints responsivos. |
| [`frontend/postcss.config.js`](frontend/postcss.config.js) | Configuração do processador PostCSS. | Processar utilitários CSS e aplicar autoprefixers para compatibilidade multi-browser. |
| [`frontend/eslint.config.js`](frontend/eslint.config.js) | Configuração de padronização de código ESLint. | Garantir qualidade de código, regras de React Hooks e consistência sintática. |
| [`frontend/Dockerfile`](frontend/Dockerfile) | Container de desenvolvimento do frontend React/Vite. | Isolar ambiente com Node.js para execução do dev server local. |
| [`frontend/Dockerfile.prod`](frontend/Dockerfile.prod) | Build multi-estágio de produção e servidor Nginx. | Compilar bundle estático do Vite e servir via servidor web leve e otimizado. |
| [`frontend/nginx.prod.conf`](frontend/nginx.prod.conf) | Configuração Nginx do container de frontend. | Configurar roteamento de SPA com fallback para index.html e caching estático. |
| [`frontend/.dockerignore`](frontend/.dockerignore) | Regras de exclusão do build Docker do frontend. | Evitar cópia de node_modules locais e arquivos temporários para a imagem. |
| [`frontend/public/robots.txt`](frontend/public/robots.txt) | Diretrizes de rastreamento para robôs de busca (SEO). | Orientar o Google e outros buscadores sobre rotas públicas e páginas privadas restritas. |
| [`frontend/public/sitemap.xml`](frontend/public/sitemap.xml) | Mapa do site para indexação de motores de busca (SEO). | Listar URLs canônicas da plataforma para otimizar descoberta e posicionamento orgânico. |

---

### 3.16 Infraestrutura — Docker, Gateway & CI/CD (9 arquivos)

| Arquivo | Objetivo Principal | Motivo da Criação |
| :--- | :--- | :--- |
| [`gateway/Dockerfile`](gateway/Dockerfile) | Imagem de container para o API Gateway Nginx. | Criar proxy reverso que unifica frontend e backend sob a mesma porta de rede. |
| [`gateway/nginx.conf`](gateway/nginx.conf) | Configuração de proxy reverso e roteamento do Gateway (dev). | Rotear tráfego da raiz para o frontend e /api para a API FastAPI do backend. |
| [`gateway/nginx.prod.conf`](gateway/nginx.prod.conf) | Configuração de produção do API Gateway com SSL. | Aplicar cabeçalhos de segurança (CSP, HSTS), balanceamento de carga e compressão gzip. |
| [`gateway/.dockerignore`](gateway/.dockerignore) | Regras de exclusão do container Gateway. | Manter a imagem Nginx com o menor footprint possível. |
| [`docker-compose.yml`](docker-compose.yml) | Orquestração de containers para ambiente de desenvolvimento local. | Subir frontend, backend e banco PostgreSQL simultaneamente com hot-reload. |
| [`docker-compose.prod.yml`](docker-compose.prod.yml) | Orquestração de containers para ambiente de produção. | Executar a stack completa com volumes persistentes e configurações de alta performance. |
| [`.github/workflows/ci.yml`](.github/workflows/ci.yml) | Pipeline de Integração Contínua (CI) do GitHub Actions. | Executar testes automatizados do backend e frontend em cada commit ou pull request. |
| [`.github/workflows/static.yml`](.github/workflows/static.yml) | Pipeline de Deploy Contínuo (CD) no GitHub Pages. | Compilar o frontend e publicar a versão de demonstração no GitHub Pages. |
| [`.gitignore`](.gitignore) | Arquivo de exclusões do controle de versão Git. | Impedir envio de node_modules, ambientes virtuais, bancos locais e chaves secretas. |

---

## 4. Garantia de Conformidade e Padronização de Comentários

Todos os arquivos de código-fonte e scripts de infraestrutura foram auditados e documentados com cabeçalhos estruturados em conformidade com as diretrizes do projeto:
- **Python (`.py`):** Docstrings com delimitadores `""" ... """` contendo objetivo, motivo de criação e lista de responsabilidades.
- **JavaScript / JSX / MJS (`.js`, `.jsx`, `.mjs`) e CSS (`.css`):** Comentários de bloco `/** ... */` no padrão JSDoc.
- **HTML / XML (`.html`, `.xml`):** Comentários com tags `<!-- ... -->`.
- **SQL (`.sql`):** Comentários com prefixo de linha `--`.
- **Dockerfiles, Nginx Conf e YAML (`.yml`, `.conf`, `.txt`):** Comentários estruturados com prefixo `#`.

Essa padronização assegura conformidade arquitetural, rastreabilidade técnica e manutenção sustentável de longo prazo para todo o ecossistema Automatch.
