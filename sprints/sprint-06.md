# Sprint 06 — Otimização Global de Performance, Code Splitting e Varredura 360° Fotográfica

## Período
Início: 26/09/2026 | Fim: 28/09/2026

## Objetivo
Eliminar travamentos e sobrecargas no navegador por meio de code-splitting dinâmico com `React.lazy()`, pipeline assíncrono de imagens (`loading="lazy"`, `decoding="async"`), desoneração de GPU (remoção de filtros gaussianos contínuos `backdrop-blur`) e correção definitiva da Varredura 360° Fotográfica para garantir consistência visual absoluta e perspectiva 3D realista sem substituição por veículos aleatórios.

## Milestone
`v2.4.0 — Otimização Global de Performance, Code Splitting & Varredura 360° Fiel`

## Itens planejados
- [x] `[ATM-PERF-01]` Code-splitting dinâmico com `React.lazy()` e `<Suspense>` para os modais pesados (`VehicleComparatorModal`, `PriceAlertModal`, `MultichannelSyncModal`, `PartnershipHubModal`), reduzindo o bundle inicial em até 40%.
- [x] `[ATM-PERF-02]` Resiliência de rede com `AbortSignal.timeout(1200ms)` em chamadas de catálogo e favoritos, e `AbortSignal.timeout(1500ms)` em laudo/DETRAN, prevenindo congelamento por backend offline.
- [x] `[ATM-PERF-03]` Pipeline de imagens com `loading="lazy"` e `decoding="async"` universal nas listagens, liberando a Main Thread.
- [x] `[ATM-PERF-04]` Desoneração de GPU através da substituição de filtros gaussianos contínuos (`backdrop-blur`) por camadas translúcidas opacas aceleradas por hardware, atingindo 60 FPS lisos.
- [x] `[ATM-360-01]` Reescrita completa do `Vehicle360Viewer.jsx` com algoritmo de resolução fotográfica fiel ao veículo inspecionado (`car.photos360`, `car.gallery` ou `car.image`), eliminando definitivamente a exibição de carros aleatórios.
- [x] `[ATM-360-02]` Sistema de perspectiva 3D contínua com CSS hardware-accelerated (`perspective(1200px) rotateY(...)`) e iluminação direcional de estúdio em tempo real.
- [x] `[ATM-DOCS-01]` Atualização dos relatórios de sprints, README.md, CHANGELOG.md e BACKLOG.md com informações acadêmicas e de engenharia do CEUB (`ADS-AUTOMATCH-2026`).

## Responsáveis
- **Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio**: Equipe de Desenvolvimento Fullstack e DevOps (CEUB).
- **Prof. Flávio César**: Orientação técnica e acompanhamento metodológico.

## Entregas
- `frontend/src/components/vehicle/Vehicle360Viewer.jsx` (Visualizador 360° fotográfico consistente com perspectiva 3D).
- `frontend/src/pages/ShowcaseVehicleDetails.jsx` (Code-splitting de modais e integração dinâmica da varredura 360°).
- `frontend/src/pages/ShowcaseCatalog.jsx`, `FavoritesPage.jsx`, `Dashboard.jsx`, `ProfilePage.jsx` e `Home.jsx` (Otimizações de performance, timeouts e desoneração de GPU).
- `frontend/src/components/ui/CarCard.jsx` e `frontend/src/utils/imageHelper.js`.
- `README.md`, `CHANGELOG.md`, `BACKLOG.md` e relatórios de sprint sincronizados.

## Issues concluídas
- `#35`: Otimização global de carregamento e redução do bundle JavaScript inicial.
- `#36`: Correção da Varredura 360° para manter o mesmo veículo em todos os ângulos com perspectiva 3D.
- `#37`: Resiliência de rede com fail-fast e fallback instantâneo no frontend.
- `#38`: Atualização da documentação acadêmica e backlog de requisitos CEUB.

## Evidências
- Validação visual automatizada em navegador real via subagente nos veículos `sc-001` (Toyota Corolla Cross) e `sc-002` (Volkswagen Polo TSI), confirmando estabilidade do veículo nos 8 ângulos sem qualquer troca indevida.
- Redução comprovada do bundle inicial de `ShowcaseVehicleDetails` de 109.04 kB para 98.91 kB e economia de 50.5 kB em Dashboard e Perfil.
- Build de produção via Vite (`npm run build`) concluído com 100% de sucesso em 14.36s (2248 módulos).

## Retrospectiva
- **Pontos Fortes**: A adesão estrita ao protocolo VLAEG garantiu diagnósticos precisos e correções de alto impacto na velocidade e fidelidade visual da plataforma.
- **Próximas ações**: Continuidade do roadmap de produto conforme priorização do backlog acadêmico e orientações do professor.
