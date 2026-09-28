# Sprint 05 — Termômetro de Mercado, Calculadora TCO e Price Drop Tracker

## Período
Início: 22/09/2026 | Fim: 25/09/2026

## Objetivo
Implementar o Termômetro Visual de Oportunidade com régua de dispersão frente à FIPE, desenvolver a Calculadora de Custo Total de Posse (TCO) com 4 pilares de custos mensais por UF, integrar o rastreador de reduções de preço (Price Drop Tracker) e executar a bateria completa de testes de casos de uso (End-to-End).

## Milestone
`v2.3.0 — Termômetro de Mercado, TCO & Price Drop Tracker`

## Itens planejados
- [x] `[ATM-MARKET-01]` Novo componente `MarketPriceIndicator.jsx` com modos `gauge` e `badge` com classificação analítica de oportunidade.
- [x] Endpoint `GET /api/cars/{car_id}/market-indicator` e rotinas de cálculo em `backend/pricing_service.py`.
- [x] `[ATM-TCO-01]` Novo componente interativo `TcoCalculatorCard.jsx` com decomposição de custos mensais (IPVA estadual, seguro anualizado, manutenção e combustível por km).
- [x] Endpoint `POST /api/cars/tco-calculator` no backend.
- [x] `[ATM-PRICE-01]` Componente `PriceDropBadge.jsx` com tags de desconto e histórico expansível de reajustes.
- [x] Colunas `original_price` e `price_history` no SQLAlchemy (`models.py`) e schemas Pydantic.
- [x] Bateria global de testes de casos de uso em `backend/test_usecases_full_battery.py` cobrindo 100% dos 8 casos de uso do sistema.

## Responsáveis
- **Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio**: Equipe de Desenvolvimento Fullstack e DevOps (CEUB).
- **Prof. Flávio César**: Orientação técnica e acompanhamento metodológico.

## Entregas
- `frontend/src/components/vehicle/MarketPriceIndicator.jsx`
- `frontend/src/components/vehicle/TcoCalculatorCard.jsx`
- `frontend/src/components/vehicle/PriceDropBadge.jsx`
- `backend/pricing_service.py` e extensões em `backend/routers/cars.py`
- `backend/test_usecases_full_battery.py`

## Issues concluídas
- `#31`: Implementação do Termômetro Visual de Mercado e Oportunidade FIPE.
- `#32`: Calculadora de Custo Total de Posse (TCO Mensal e Diário).
- `#33`: Histórico e Notificador de Redução de Preço (Price Drop Tracker).
- `#34`: Suíte de Testes Automatizados de Casos de Uso E2E.

## Evidências
- 100% de aprovação na bateria de testes de casos de uso (`test_usecases_full_battery.py`).
- Interface do TCO validada com alternância dinâmica de quilometragem e cálculo de IPVA proporcional por UF.
- Build de produção compilado com sucesso via Vite em 13.36s.

## Retrospectiva
- **Pontos Fortes**: Funcionalidades de alto valor para o comprador foram integradas de ponta a ponta com excelente fidelidade visual.
- **Próximas ações**: Focar na otimização de performance, carregamento dinâmico de código (code-splitting) e refinamento da varredura 360° na Sprint 06.
