# Sprint 07 — Aprimoramento Orbital 360°, Desempenho B2B, Fechamento Resiliente e Unificação de Lojas

## Período
Início: 29/09/2026 | Fim: 12/10/2026

## Objetivo
Resolver a exibição fidedigna do ângulo 180° (traseira) na varredura 360°, eliminar travamentos no modal B2B por re-renderização de temporizadores, implementar a trava de fechamento de negócios com feedback otimista e unificar as lojas parceiras em todo o ecossistema.

## Milestone
`v2.5.0 — Varredura 360° Aprimorada, Fluidez B2B & Unificação de Estoques`

## Itens Planejados
- [x] `[ATM-360-03]` Correção do quadrante 180°: o clique em "Traseira 180°" exibe a imagem traseira autêntica (`/images/carro_360_traseira.jpg`), eliminando exibição frontal.
- [x] `[ATM-360-04]` Mapeamento de fotos em 8 ângulos (`photos360`) e galeria fotográfica enriquecida (`gallery`) nos veículos da vitrine (`showcaseData.js`).
- [x] `[ATM-UI-01]` Remoção de botões redundantes "Falar com Vendedor" na barra superior e no card de preços em `ShowcaseVehicleDetails.jsx`, centralizando o chat com alternância entre Consultor IA e Vendedor.
- [x] `[ATM-B2B-01]` Otimização de performance no `PartnershipHubModal.jsx`: isolamento do contador regressivo em `ReservationTimerBadge` memoizado, evitando re-renderização do modal a cada segundo.
- [x] `[ATM-B2B-02]` Feedback visual imediato com atualização otimista na ação "Solicitar Fechamento", liberação automática da trava Hold Lock e status "Fechamento Solicitado / Aguardando Aprovação".
- [x] `[ATM-STORE-01]` Padronização das lojas em todo o ecossistema (AutoShop Prime, Motors Campinas, Concessionária Alpha) em `inventoryData.js`, `showcaseData.js` e `seed.py`.
- [x] `[ATM-USER-01]` Contadores dinâmicos no `ProfilePage.jsx` integrados com `newCarsManager.js`, `favoritesManager.js` e estoque total da vitrine.

## Responsáveis
- **Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio**: Equipe de Engenharia de Software e Fullstack (CEUB).

## Entregas
- `frontend/src/components/vehicle/Vehicle360Viewer.jsx` (Tratamento do ângulo traseiro e miniaturas angulares).
- `frontend/src/components/partnership/PartnershipHubModal.jsx` (Timer desacoplado e trava Hold Lock).
- `frontend/src/data/inventoryData.js` e `frontend/src/data/showcaseData.js` (Sincronização de lojas e mídias).
- `frontend/src/pages/ShowcaseVehicleDetails.jsx` e `frontend/src/pages/ProfilePage.jsx`.

## Issues Concluídas
- `#39`: Resolução da exibição do quadrante 180° no visor 360°.
- `#40`: Otimização do timer regressivo no Hub B2B para eliminar gargalo de renderização.
- `#41`: Padronização de concessionárias e lojas em banco de dados e vitrine.
- `#42`: Atualização do perfil do usuário com contadores reativos.

## Evidências
- Varredura 360° orbital validada com rotação contínua e ângulo 180° renderizando a traseira real do veículo.
- Timer B2B com consumo de CPU estável a 60 FPS sem engasgos na rolagem.
- Build de produção compilado com sucesso via Vite em 5.12s.

## Retrospectiva
- **Pontos Fortes**: A separação do timer em componente memoizado eliminou totalmente o jitter no modal B2B.
- **Próximas ações**: Realizar auditoria de comentários em todo o código-fonte, criar catálogo de escopo e homologar os dados periciais do Chevrolet Tracker na Sprint 08.
