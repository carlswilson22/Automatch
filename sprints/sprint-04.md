# Sprint 04 — Resolução de Gargalos, Vídeo Pericial 15s e Comparador Multidimensional

## Período
Início: 16/09/2026 | Fim: 21/09/2026

## Objetivo
Resolver gargalos de latência no backend através de connection pooling e cache de cotações, implementar o reprodutor de vídeo pericial de 15 segundos com checkpoints interativos e desenvolver o Comparador Multidimensional lado a lado em 5 dimensões sem dependência de TrustScore estático.

## Milestone
`v2.2.0 — Resolução de Gargalos, Vídeo Pericial & Comparador Multidimensional`

## Itens planejados
- [x] Connection pooling no SQLAlchemy (`pool_size=10`, `max_overflow=20`, `pool_recycle=1800`, `pool_pre_ping=True`) com suporte a concorrência assíncrona.
- [x] Criação de índices no PostgreSQL para campos de alta frequência de busca (`price`, `year`, `brand`, `model`, `store_id`).
- [x] Cache TTL em memória de 24h para cotações FIPE e DETRAN, reduzindo latência repetida para < 2ms.
- [x] `[ATM-VIDEO-01]` Novo componente `PericialVideoViewer.jsx` com timeline dinâmica e checkpoints periciais interativos (0-5s Frente/Óptica, 5-10s Cintura/Pneus, 10-15s Traseira/Motor).
- [x] Endpoint de upload e streaming otimizado de vídeos de até 40MB (`backend/routers/cars.py`).
- [x] `[ATM-COMP-01]` Novo componente `VehicleComparatorModal.jsx` para comparação simultânea de até 3 veículos em 5 dimensões objetivas (Preço vs FIPE, Km/ano, Laudo Cautelar, Débitos DETRAN e Especificações).
- [x] Sincronização reativa de favoritos em tempo real via CustomEvents e `subscribeFavorites`.

## Responsáveis
- **Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio**: Equipe de Desenvolvimento Fullstack e DevOps (CEUB).
- **Prof. Flávio César**: Orientação técnica e acompanhamento metodológico.

## Entregas
- `frontend/src/components/vehicle/PericialVideoViewer.jsx` e coluna `video_url` em `backend/models.py`.
- `frontend/src/components/vehicle/VehicleComparatorModal.jsx` e utilitários de normalização.
- `backend/database.py` e `backend/routers/cars.py` com connection pooling e cache.
- `frontend/src/data/favoritesManager.js` com reatividade global.

## Issues concluídas
- `#27`: Otimização de concorrência e pooling no banco de dados.
- `#28`: Implementação do Reprodutor de Vídeo Pericial de 15s com Checkpoints.
- `#29`: Desenvolvimento do Comparador Multidimensional Lado a Lado.
- `#30`: Reatividade em tempo real da Central de Favoritos.

## Evidências
- Redução de latência de endpoints FIPE de 1.8s para < 2ms via cache TTL.
- Reprodução e transição suave do vídeo pericial com checkpoints clicáveis.
- Comparador multidimensional testado com 2 e 3 veículos simultâneos com 100% de precisão nos cálculos.
- Build de produção do frontend (`npm run build`) validado com 0 erros.

## Retrospectiva
- **Pontos Fortes**: A eliminação do TrustScore estático e a introdução de comparações objetivas com a tabela FIPE trouxeram grande transparência para o comprador.
- **Próximas ações**: Implementar o termômetro de mercado e a calculadora de Custo Total de Posse (TCO) na Sprint 05.
