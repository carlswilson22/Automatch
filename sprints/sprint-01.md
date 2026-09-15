# Sprint 01 — Limpeza de Anúncios, Favoritos e Homologação B2B AutoCerto

## Período
Início: 28/08/2026 | Fim: 07/09/2026

## Objetivo
Refatorar a visualização de anúncios, implementar persistência de veículos favoritos, inicializar a sessão limpa sem usuário (Modo Visitante) e homologar formalmente os 3 canais B2B automotivos (Webmotors, OLX Autos e AutoCerto DMS).

## Milestone
`v1.1.0 — Limpeza de Anúncios & Integração AutoCerto DMS`

## Itens planejados
- [x] Otimizar a página de detalhes do veículo (`ShowcaseVehicleDetails.jsx`), removendo abas pesadas e priorizando Perícia Visual IA e 360°.
- [x] Criar central de veículos favoritos (`/favoritos`) com persistência em `localStorage`.
- [x] Corrigir scroll indevido na alternância de rotas (`ScrollToTop` global).
- [x] Padronizar referências oficiais para "Preço FIPE".
- [x] Homologar formalmente os 3 canais de estoque: Webmotors, OLX Autos e AutoCerto DMS (excluindo canais legados).
- [x] Suporte à gestão de variáveis de ambiente com template `.env.example`.

## Responsáveis
- **Carlos Wilson**: Engenheiro Fullstack & Arquiteto de Software.
- **Prof. Flávio César**: Orientação técnica e acompanhamento metodológico.

## Entregas
- `frontend/src/data/favoritesManager.js` e `frontend/src/pages/FavoritesPage.jsx`.
- Refatoração de `MultichannelSyncModal.jsx` e `backend/routers/integrations.py` para 3 canais homologados.
- Rota de feed direto `GET /api/integrations/autocerto/feed.xml`.
- Inicialização limpa em `AuthContext.jsx` para testes de cadastro.

## Issues concluídas
- `#12`: Central de Favoritos e Sincronização de Curtidas.
- `#14`: Scroll automático ao topo nas transições de rotas.
- `#15`: Integração e Carga de Estoque AutoCerto DMS.

## Evidências
- Suíte de testes com 10/10 testes passando (`python test_vision_and_delete.py`).
- Sincronização multicanal em tempo real validada nos 3 canais homologados.

## Retrospectiva
- **Pontos Fortes**: A interface ficou mais veloz e limpa, e a homologação com o AutoCerto DMS aproximou a plataforma do ecossistema real de lojistas.
- **Ajustes para o próximo ciclo**: Focar na experiência de negociação e eliminar taxas de reserva que geram atrito para compradores.
