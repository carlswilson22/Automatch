# Catálogo dos arquivos técnicos do Automatch

Atualizado em **18/11/2026**, após a limpeza sobre a base `7fd2315`. Inventário obtido dos caminhos
versionados, sem contar dependências instaladas, builds ou arquivos privados.
Não é uma medição de cobertura, precisão ou qualidade de cada módulo.

## Organização

O catálogo contém 199 arquivos de código/configuração presentes na base
examinada. Imagens, vídeos, fixtures binárias, lockfile, licença e documentação
são tratados separadamente; `git ls-files` é o inventário completo do checkout.
Novos documentos desta revisão estão no [índice](docs/README.md).

Módulos sem consumidores e o legado de pneus/acústica foram retirados. Mídia
duplicada entre frontend/backend atende contextos de build separados; os demais
componentes de UI foram preservados quando possuem consumidores.

## Infraestrutura e configuração

| Arquivo | Responsabilidade / limite |
| --- | --- |
| [.editorconfig](.editorconfig) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [.env.example](.env.example) | Modelo de configuração, sem substituir arquivo privado de ambiente. |
| [.env.production.example](.env.production.example) | Modelo de configuração, sem substituir arquivo privado de ambiente. |
| [.github/ISSUE_TEMPLATE/bug.yml](.github/ISSUE_TEMPLATE/bug.yml) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [.github/ISSUE_TEMPLATE/config.yml](.github/ISSUE_TEMPLATE/config.yml) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [.github/ISSUE_TEMPLATE/documentacao.yml](.github/ISSUE_TEMPLATE/documentacao.yml) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [.github/ISSUE_TEMPLATE/pesquisa.yml](.github/ISSUE_TEMPLATE/pesquisa.yml) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [.github/ISSUE_TEMPLATE/requisito.yml](.github/ISSUE_TEMPLATE/requisito.yml) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [.github/workflows/ci.yml](.github/workflows/ci.yml) | Testes frontend/backend, migrações PostgreSQL/SQLite e builds Docker. |
| [.github/workflows/static.yml](.github/workflows/static.yml) | Build/testes e Pages manual, restrito ao repositório principal; não executar nesta etapa. |
| [.gitignore](.gitignore) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [.markdownlint.json](.markdownlint.json) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [docker-compose.prod.yml](docker-compose.prod.yml) | Serviços de produção, volumes, PostgreSQL e um worker backend. |
| [docker-compose.yml](docker-compose.yml) | Quatro serviços de desenvolvimento, portas e volumes. |
| [docs/evidencias-teste-scanner/09-resultado-scanner-api-response.json](docs/evidencias-teste-scanner/09-resultado-scanner-api-response.json) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [gateway/.dockerignore](gateway/.dockerignore) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [gateway/Dockerfile](gateway/Dockerfile) | Receita de imagem Docker do serviço. |
| [gateway/nginx.conf](gateway/nginx.conf) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [gateway/nginx.prod.conf](gateway/nginx.prod.conf) | Proxy de produção; atualmente escuta HTTP 80, sem TLS configurado. |

## Backend

| Arquivo | Responsabilidade / limite |
| --- | --- |
| [backend/.dockerignore](backend/.dockerignore) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [backend/Dockerfile](backend/Dockerfile) | Receita de imagem Docker do serviço. |
| [backend/alembic.ini](backend/alembic.ini) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [backend/database.py](backend/database.py) | Engine e sessões SQLAlchemy; PostgreSQL/SQLite por ambiente. |
| [backend/demo_live_docker_user_journey.py](backend/demo_live_docker_user_journey.py) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [backend/dependencies.py](backend/dependencies.py) | Sessão autenticada, versão/revogação e tokens demo condicionais. |
| [backend/main.py](backend/main.py) | Entrada FastAPI, ciclo de vida, roteadores e probes. |
| [backend/media_storage.py](backend/media_storage.py) | Diretório comum para mídia de upload. |
| [backend/migrate.py](backend/migrate.py) | Aplica Alembic head sem reset de tabelas ou seed. |
| [backend/models.py](backend/models.py) | Entidades e relações ORM; inclui PriceAlert e versão de sessão. |
| [backend/requirements.txt](backend/requirements.txt) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [backend/routers/__init__.py](backend/routers/__init__.py) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [backend/routers/ai_vision.py](backend/routers/ai_vision.py) | Endpoints ativos de visão, chat, precificação e mapa 360°. |
| [backend/routers/alerts.py](backend/routers/alerts.py) | Cadastro persistido de alertas; sem entrega externa implementada. |
| [backend/routers/auth.py](backend/routers/auth.py) | Cadastro/login/perfil, OTP, anonimização/exportação e checkout condicionado ao ambiente. |
| [backend/routers/cars.py](backend/routers/cars.py) | Catálogo, anúncios da conta, criação/edição/exclusão autorizada. |
| [backend/routers/detran.py](backend/routers/detran.py) | Dados DETRAN simulados e referência FIPE via BrasilAPI/cache/alternativa. |
| [backend/routers/integrations.py](backend/routers/integrations.py) | Canais/sincronização simulados e feed XML de exemplo. |
| [backend/routers/laudos_export.py](backend/routers/laudos_export.py) | PDF e validação pública vinculados a protocolo/snapshot registrado. |
| [backend/routers/partnerships.py](backend/routers/partnerships.py) | Parcerias, reservas, mensagens, fechamento, repasses e avaliações B2B. |
| [backend/routers/uploads.py](backend/routers/uploads.py) | Recepção/validação de documentos e vídeo; verificação de propriedade. |
| [backend/routers/vehicle_lookup.py](backend/routers/vehicle_lookup.py) | Autofill por placa com base conhecida demonstrativa. |
| [backend/run_tests.py](backend/run_tests.py) | Executor isolado de regressões e cinco jornadas com dados temporários. |
| [backend/schemas.py](backend/schemas.py) | Contratos Pydantic e validação de dados. |
| [backend/security.py](backend/security.py) | Hash PBKDF2-HMAC-SHA256 e JWT; validação de configuração de produção. |
| [backend/security_guard.py](backend/security_guard.py) | Limitadores em memória e proteções de requisição. |
| [backend/seed.py](backend/seed.py) | Inicialização de contas/dados conforme ambiente; preserva exemplos já existentes. |
| [backend/services/ai_service.py](backend/services/ai_service.py) | Visão/chat assistidos, integração Gemini opcional e processamento local. |
| [backend/services/image_sources.py](backend/services/image_sources.py) | Resolução/restrição de origens de imagens. |
| [backend/services/laudo_ia_evaluator.py](backend/services/laudo_ia_evaluator.py) | Avaliação assistida de laudos e conferência de dados. |
| [backend/services/pdf_generator.py](backend/services/pdf_generator.py) | Geração ReportLab de documento Automatch; sem certificação oficial. |
| [backend/services/pricing_service.py](backend/services/pricing_service.py) | Cálculos de precificação do domínio. |
| [backend/services/recovery_mail.py](backend/services/recovery_mail.py) | Envio de código de recuperação por SMTP STARTTLS. |
| [backend/tasks.py](backend/tasks.py) | Scheduler e tarefas periódicas do processo. |
| [backend/tests/poc_laudo_feedback.mjs](backend/tests/poc_laudo_feedback.mjs) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |

## Migrações

| Arquivo | Responsabilidade / limite |
| --- | --- |
| [backend/alembic/env.py](backend/alembic/env.py) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [backend/alembic/versions/001_initial_schema.py](backend/alembic/versions/001_initial_schema.py) | Migração incremental; consultar revision/down_revision e operações no arquivo. |
| [backend/alembic/versions/002_type_consistency.py](backend/alembic/versions/002_type_consistency.py) | Migração incremental; consultar revision/down_revision e operações no arquivo. |
| [backend/alembic/versions/004_unify_user_roles.py](backend/alembic/versions/004_unify_user_roles.py) | Migração incremental; consultar revision/down_revision e operações no arquivo. |
| [backend/alembic/versions/005_fix_b2b_financial_types.py](backend/alembic/versions/005_fix_b2b_financial_types.py) | Migração incremental; consultar revision/down_revision e operações no arquivo. |
| [backend/alembic/versions/006_session_revocation.py](backend/alembic/versions/006_session_revocation.py) | Migração incremental; consultar revision/down_revision e operações no arquivo. |
| [backend/alembic/versions/007_persist_price_alerts.py](backend/alembic/versions/007_persist_price_alerts.py) | Migração incremental; consultar revision/down_revision e operações no arquivo. |
| [backend/alembic/versions/9e22ea1485c3_add_missing_indexes_and_fks.py](backend/alembic/versions/9e22ea1485c3_add_missing_indexes_and_fks.py) | Migração incremental; consultar revision/down_revision e operações no arquivo. |

## Testes e ensaios backend

| Arquivo | Responsabilidade / limite |
| --- | --- |
| [backend/audit_performance_profiler.py](backend/audit_performance_profiler.py) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [backend/run_e2e_docker_test.py](backend/run_e2e_docker_test.py) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [backend/test_ai_streaming.py](backend/test_ai_streaming.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_audit_full_battery.py](backend/test_audit_full_battery.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_b2b_and_plate.py](backend/test_b2b_and_plate.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_defects_resolution_battery.py](backend/test_defects_resolution_battery.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_full_system_review.py](backend/test_full_system_review.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_health_probes.py](backend/test_health_probes.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_improvements_battery.py](backend/test_improvements_battery.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_laudo_ia_feedback.py](backend/test_laudo_ia_feedback.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_laudo_yolo_feedback.py](backend/test_laudo_yolo_feedback.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_performance_and_fixes.py](backend/test_performance_and_fixes.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_persistent_fixes.py](backend/test_persistent_fixes.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_project_audit_regressions.py](backend/test_project_audit_regressions.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_query_count_battery.py](backend/test_query_count_battery.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_round3_regressions.py](backend/test_round3_regressions.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_sprint07_battery.py](backend/test_sprint07_battery.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_usecases_full_battery.py](backend/test_usecases_full_battery.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [backend/test_vision_and_delete.py](backend/test_vision_and_delete.py) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |

## Configuração frontend

| Arquivo | Responsabilidade / limite |
| --- | --- |
| [frontend/.dockerignore](frontend/.dockerignore) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [frontend/Dockerfile](frontend/Dockerfile) | Receita de imagem Docker do serviço. |
| [frontend/Dockerfile.prod](frontend/Dockerfile.prod) | Receita de imagem Docker do serviço. |
| [frontend/eslint.config.js](frontend/eslint.config.js) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [frontend/nginx.prod.conf](frontend/nginx.prod.conf) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [frontend/package.json](frontend/package.json) | Manifest e comandos do frontend; referência de dependências. |
| [frontend/postcss.config.js](frontend/postcss.config.js) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [frontend/tailwind.config.js](frontend/tailwind.config.js) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [frontend/vite.config.js](frontend/vite.config.js) | Base da SPA, proxy /api, build e divisão de chunks. |

## Frontend

| Arquivo | Responsabilidade / limite |
| --- | --- |
| [frontend/src/App.jsx](frontend/src/App.jsx) | Rotas públicas/protegidas, contextos e carregamento sob demanda. |
| [frontend/src/components/ProtectedRoute.jsx](frontend/src/components/ProtectedRoute.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/chat/HomeSupportChat.jsx](frontend/src/components/chat/HomeSupportChat.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/common/ErrorBoundary.jsx](frontend/src/components/common/ErrorBoundary.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/common/GlobalErrorBoundary.jsx](frontend/src/components/common/GlobalErrorBoundary.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/common/RouteLoadingSkeleton.jsx](frontend/src/components/common/RouteLoadingSkeleton.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/common/VehicleCardSkeleton.jsx](frontend/src/components/common/VehicleCardSkeleton.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/inventory/AIStudioModal.jsx](frontend/src/components/inventory/AIStudioModal.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/inventory/AssetConfigurationModal.jsx](frontend/src/components/inventory/AssetConfigurationModal.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/inventory/B2BRepassePanel.jsx](frontend/src/components/inventory/B2BRepassePanel.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/layout/StoreSelector.jsx](frontend/src/components/layout/StoreSelector.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/partners/B2BInventorySkeleton.jsx](frontend/src/components/partners/B2BInventorySkeleton.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/partners/NewPartnershipInviteCard.jsx](frontend/src/components/partners/NewPartnershipInviteCard.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/partners/PartnerChatModal.jsx](frontend/src/components/partners/PartnerChatModal.jsx) | Mensagens B2B por polling, com cancelamento e isolamento. |
| [frontend/src/components/partners/PartnershipHubModal.jsx](frontend/src/components/partners/PartnershipHubModal.jsx) | Fluxos do hub B2B com confirmação de operações pela API. |
| [frontend/src/components/tour/AutomatchTour.jsx](frontend/src/components/tour/AutomatchTour.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/tour/TourIntroModal.jsx](frontend/src/components/tour/TourIntroModal.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/tour/TourNotificationToast.jsx](frontend/src/components/tour/TourNotificationToast.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/ui/AutomatchLogo.jsx](frontend/src/components/ui/AutomatchLogo.jsx) | Componente/variante de interface; reexports podem preservar compatibilidade. |
| [frontend/src/components/ui/FocusInput.jsx](frontend/src/components/ui/FocusInput.jsx) | Componente/variante de interface; reexports podem preservar compatibilidade. |
| [frontend/src/components/ui/GlowButton.jsx](frontend/src/components/ui/GlowButton.jsx) | Componente/variante de interface; reexports podem preservar compatibilidade. |
| [frontend/src/components/ui/SlidingTabs.jsx](frontend/src/components/ui/SlidingTabs.jsx) | Componente/variante de interface; reexports podem preservar compatibilidade. |
| [frontend/src/components/ui/StoreIdentifier.jsx](frontend/src/components/ui/StoreIdentifier.jsx) | Componente/variante de interface; reexports podem preservar compatibilidade. |
| [frontend/src/components/ui/WipeButton.jsx](frontend/src/components/ui/WipeButton.jsx) | Componente/variante de interface; reexports podem preservar compatibilidade. |
| [frontend/src/components/ui/microkit/FocusInput.jsx](frontend/src/components/ui/microkit/FocusInput.jsx) | Componente/variante de interface; reexports podem preservar compatibilidade. |
| [frontend/src/components/ui/microkit/GlowButton.jsx](frontend/src/components/ui/microkit/GlowButton.jsx) | Componente/variante de interface; reexports podem preservar compatibilidade. |
| [frontend/src/components/ui/microkit/SpotlightCard.jsx](frontend/src/components/ui/microkit/SpotlightCard.jsx) | Componente/variante de interface; reexports podem preservar compatibilidade. |
| [frontend/src/components/ui/microkit/WipeButton.jsx](frontend/src/components/ui/microkit/WipeButton.jsx) | Componente/variante de interface; reexports podem preservar compatibilidade. |
| [frontend/src/components/vehicle/AIChatBox.jsx](frontend/src/components/vehicle/AIChatBox.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/vehicle/AccordionPanel.jsx](frontend/src/components/vehicle/AccordionPanel.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/vehicle/LaudoFeedbackCard.jsx](frontend/src/components/vehicle/LaudoFeedbackCard.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/vehicle/MarketPriceIndicator.jsx](frontend/src/components/vehicle/MarketPriceIndicator.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/vehicle/MultichannelSyncModal.jsx](frontend/src/components/vehicle/MultichannelSyncModal.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/vehicle/OfficialDossierModal.jsx](frontend/src/components/vehicle/OfficialDossierModal.jsx) | Exibição do dossiê Automatch e download; nome interno não indica certificação oficial. |
| [frontend/src/components/vehicle/PericialVideoViewer.jsx](frontend/src/components/vehicle/PericialVideoViewer.jsx) | Player/roteiro de 20 s e representação demonstrativa quando não há vídeo. |
| [frontend/src/components/vehicle/PriceAlertModal.jsx](frontend/src/components/vehicle/PriceAlertModal.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/vehicle/PriceDropBadge.jsx](frontend/src/components/vehicle/PriceDropBadge.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/vehicle/SellerChat.jsx](frontend/src/components/vehicle/SellerChat.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/vehicle/TcoCalculatorCard.jsx](frontend/src/components/vehicle/TcoCalculatorCard.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/vehicle/TradeInSimulator.jsx](frontend/src/components/vehicle/TradeInSimulator.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/components/vehicle/Vehicle360Viewer.jsx](frontend/src/components/vehicle/Vehicle360Viewer.jsx) | Visualização orbital fotográfica do veículo. |
| [frontend/src/components/vehicle/VehicleComparatorModal.jsx](frontend/src/components/vehicle/VehicleComparatorModal.jsx) | Componente da interface; presença no catálogo não comprova uso em uma rota ativa. |
| [frontend/src/contexts/AuthContext.jsx](frontend/src/contexts/AuthContext.jsx) | Sessão/perfil e transições de autenticação. |
| [frontend/src/contexts/TourContext.jsx](frontend/src/contexts/TourContext.jsx) | Contexto de estado da SPA. |
| [frontend/src/data/favoritesManager.js](frontend/src/data/favoritesManager.js) | Dados locais ou gerenciador de estado demonstrativo; conferir persistência no módulo. |
| [frontend/src/data/howItWorksData.js](frontend/src/data/howItWorksData.js) | Dados locais ou gerenciador de estado demonstrativo; conferir persistência no módulo. |
| [frontend/src/data/inventoryData.js](frontend/src/data/inventoryData.js) | Dados locais ou gerenciador de estado demonstrativo; conferir persistência no módulo. |
| [frontend/src/data/mockData.js](frontend/src/data/mockData.js) | Dados locais ou gerenciador de estado demonstrativo; conferir persistência no módulo. |
| [frontend/src/data/newCarsManager.js](frontend/src/data/newCarsManager.js) | Dados locais ou gerenciador de estado demonstrativo; conferir persistência no módulo. |
| [frontend/src/data/plansData.js](frontend/src/data/plansData.js) | Dados locais ou gerenciador de estado demonstrativo; conferir persistência no módulo. |
| [frontend/src/data/showcaseData.js](frontend/src/data/showcaseData.js) | Dados locais ou gerenciador de estado demonstrativo; conferir persistência no módulo. |
| [frontend/src/data/tourGuideData.js](frontend/src/data/tourGuideData.js) | Dados locais ou gerenciador de estado demonstrativo; conferir persistência no módulo. |
| [frontend/src/index.css](frontend/src/index.css) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [frontend/src/main.jsx](frontend/src/main.jsx) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [frontend/src/pages/AuthPage.jsx](frontend/src/pages/AuthPage.jsx) | Tela/rota da SPA; acesso definido em App.jsx e no servidor quando aplicável. |
| [frontend/src/pages/CheckoutPage.jsx](frontend/src/pages/CheckoutPage.jsx) | Tela/rota da SPA; acesso definido em App.jsx e no servidor quando aplicável. |
| [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx) | Tela/rota da SPA; acesso definido em App.jsx e no servidor quando aplicável. |
| [frontend/src/pages/FavoritesPage.jsx](frontend/src/pages/FavoritesPage.jsx) | Tela/rota da SPA; acesso definido em App.jsx e no servidor quando aplicável. |
| [frontend/src/pages/Home.jsx](frontend/src/pages/Home.jsx) | Tela/rota da SPA; acesso definido em App.jsx e no servidor quando aplicável. |
| [frontend/src/pages/HowItWorksPage.jsx](frontend/src/pages/HowItWorksPage.jsx) | Tela/rota da SPA; acesso definido em App.jsx e no servidor quando aplicável. |
| [frontend/src/pages/MyAdsPage.jsx](frontend/src/pages/MyAdsPage.jsx) | Tela/rota da SPA; acesso definido em App.jsx e no servidor quando aplicável. |
| [frontend/src/pages/NewCarAdForm.jsx](frontend/src/pages/NewCarAdForm.jsx) | Tela/rota da SPA; acesso definido em App.jsx e no servidor quando aplicável. |
| [frontend/src/pages/ProfilePage.jsx](frontend/src/pages/ProfilePage.jsx) | Tela/rota da SPA; acesso definido em App.jsx e no servidor quando aplicável. |
| [frontend/src/pages/PublicValidationPage.jsx](frontend/src/pages/PublicValidationPage.jsx) | Tela/rota da SPA; acesso definido em App.jsx e no servidor quando aplicável. |
| [frontend/src/pages/ShowcaseCatalog.jsx](frontend/src/pages/ShowcaseCatalog.jsx) | Tela/rota da SPA; acesso definido em App.jsx e no servidor quando aplicável. |
| [frontend/src/pages/ShowcaseVehicleDetails.jsx](frontend/src/pages/ShowcaseVehicleDetails.jsx) | Tela/rota da SPA; acesso definido em App.jsx e no servidor quando aplicável. |
| [frontend/src/services/aiChatService.js](frontend/src/services/aiChatService.js) | Arquivo técnico/configuração; consultar o conteúdo e seus consumidores. |
| [frontend/src/services/apiClient.js](frontend/src/services/apiClient.js) | HTTP, timeout configurável, cancelamento, retry de GET e erros. |
| [frontend/src/services/sessionStorage.js](frontend/src/services/sessionStorage.js) | Resolução central da credencial da sessão. |
| [frontend/src/utils/aiConsultantCore.js](frontend/src/utils/aiConsultantCore.js) | Utilitários compartilhados; conferir chamadas e testes associados. |
| [frontend/src/utils/filterVehicles.js](frontend/src/utils/filterVehicles.js) | Utilitários compartilhados; conferir chamadas e testes associados. |
| [frontend/src/utils/imageHelper.js](frontend/src/utils/imageHelper.js) | Utilitários compartilhados; conferir chamadas e testes associados. |
| [frontend/src/utils/inspectionData.js](frontend/src/utils/inspectionData.js) | Utilitários compartilhados; conferir chamadas e testes associados. |
| [frontend/src/utils/motionTokens.js](frontend/src/utils/motionTokens.js) | Utilitários compartilhados; conferir chamadas e testes associados. |
| [frontend/src/utils/scrollLockCore.js](frontend/src/utils/scrollLockCore.js) | Utilitários compartilhados; conferir chamadas e testes associados. |
| [frontend/src/utils/useScrollLock.js](frontend/src/utils/useScrollLock.js) | Utilitários compartilhados; conferir chamadas e testes associados. |
| [frontend/src/utils/vehicleMapper.js](frontend/src/utils/vehicleMapper.js) | Utilitários compartilhados; conferir chamadas e testes associados. |
| [frontend/src/utils/vehicleNumbers.js](frontend/src/utils/vehicleNumbers.js) | Utilitários compartilhados; conferir chamadas e testes associados. |

## Testes frontend

| Arquivo | Responsabilidade / limite |
| --- | --- |
| [frontend/tests/test_behavior_regressions.mjs](frontend/tests/test_behavior_regressions.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_body_type_sedan.mjs](frontend/tests/test_body_type_sedan.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_design_tokens_battery.mjs](frontend/tests/test_design_tokens_battery.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_features_battery.mjs](frontend/tests/test_features_battery.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_filter_vehicles.mjs](frontend/tests/test_filter_vehicles.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_gh_pages_demo_mode.mjs](frontend/tests/test_gh_pages_demo_mode.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_laudo_ia_battery.mjs](frontend/tests/test_laudo_ia_battery.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_new_features_battery.mjs](frontend/tests/test_new_features_battery.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_novidade_and_price_drop.mjs](frontend/tests/test_novidade_and_price_drop.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_runtime_audit.mjs](frontend/tests/test_runtime_audit.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_scanner_ia_and_360_4cars.mjs](frontend/tests/test_scanner_ia_and_360_4cars.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_security_audit.mjs](frontend/tests/test_security_audit.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_tour_guide_battery.mjs](frontend/tests/test_tour_guide_battery.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_tracker_fixes_battery.mjs](frontend/tests/test_tracker_fixes_battery.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_video_20s_and_chatbot_consumo.mjs](frontend/tests/test_video_20s_and_chatbot_consumo.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |
| [frontend/tests/test_visual_and_360_experience.mjs](frontend/tests/test_visual_and_360_experience.mjs) | Bateria/roteiro de teste; usar o executor recomendado e dados isolados. |

## Fontes complementares

- [Arquitetura](docs/arquitetura.md) e [banco](DOCUMENTACAO_BANCO_DE_DADOS.md).
- [Estado atual](docs/estado-atual.md), [testes](docs/testes-e-evidencias.md) e [configuração](docs/configuracao-e-execucao.md).
- [LICENSE](LICENSE) e [NOTICE](NOTICE): direitos e atribuições preservados.

## Suporte às melhorias demonstrativas

| Arquivo | Responsabilidade / limite |
| --- | --- |
| [backend/test_demo_tools.py](backend/test_demo_tools.py) | Regressões com dados isolados: placa/cache, FIPE, multicanal, XML, consultor e PDF. |
| [frontend/src/components/vehicle/VehicleReferencePanel.jsx](frontend/src/components/vehicle/VehicleReferencePanel.jsx) | Apresentação comum de referências e informações não consultadas. |
| [frontend/src/utils/demoTools.js](frontend/src/utils/demoTools.js) | Exemplos, persistência por conta, prévia de alerta e geração de XML; sem entrega externa. |
| [frontend/src/utils/dialogFocus.js](frontend/src/utils/dialogFocus.js) | Gerenciamento de foco e teclado para o diálogo superior. |
| [frontend/src/utils/useDialog.js](frontend/src/utils/useDialog.js) | Integra foco, fechamento e bloqueio de rolagem ao ciclo React. |
| [frontend/tests/test_demo_tools.mjs](frontend/tests/test_demo_tools.mjs) | Regressões de dados e componentes dos exemplos interativos. |
| [frontend/tests/test_dialog_focus.mjs](frontend/tests/test_dialog_focus.mjs) | Teclado, foco inicial/retorno e diálogos aninhados. |

## Correções das pendências A1–A5

| Arquivo | Responsabilidade / limite |
| --- | --- |
| [frontend/src/utils/vehicleInformation.js](frontend/src/utils/vehicleInformation.js) | Status informados e quilometragem sem substituir ausência por aprovação ou zero. |
| [frontend/tests/test_confirmed_pending_fixes.mjs](frontend/tests/test_confirmed_pending_fixes.mjs) | Doze regressões de dados, anúncio, comparador, favoritos por conta e cadastro com falha. |
| [backend/test_confirmed_pending_fixes.py](backend/test_confirmed_pending_fixes.py) | Seis testes HTTP/PDF com snapshot e validação em SQLite descartável. |


## Manutenção dos avisos

| Arquivo | Responsabilidade / limite |
| --- | --- |
| [frontend/src/contexts/useAuth.js](frontend/src/contexts/useAuth.js) | Objeto de contexto e hook de autenticação compartilhados, separados do provider JSX. |
| [frontend/src/contexts/useTour.js](frontend/src/contexts/useTour.js) | Objeto de contexto e hook do tour, compartilhados com o provider. |
| [frontend/tests/test_maintenance_regressions.mjs](frontend/tests/test_maintenance_regressions.mjs) | Três regressões de contexto, cancelamento e cache; componentes legados somente no teste. |

## Verificação da limpeza de 18/11/2026

O inventário atual exclui os 15 módulos retirados. Os registros anteriores
continuam no histórico Git; [relatório de limpeza](docs/limpeza-arquivos-2026-11-18.md).

| Arquivo | Responsabilidade / limite |
| --- | --- |
| [frontend/scripts/check-source-usage.mjs](frontend/scripts/check-source-usage.mjs) | Auditoria de imports/dependências a partir da aplicação; executada por `npm test`. |
| [backend/test_cleanup_regressions.py](backend/test_cleanup_regressions.py) | Contrato HTTP da retirada de pneus/acústica e preservação da análise visual. |
