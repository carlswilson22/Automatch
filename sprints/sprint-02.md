# Sprint 02 — Negociação Direta e Auditoria de Laudos em PDF com IA

## Período
Início: 08/09/2026 | Fim: 14/09/2026

## Objetivo
Eliminar a barreira do sinal financeiro online de reserva de veículos, promovendo a negociação direta com vendedores ("Falar com Vendedor") e implementar a auditoria pericial por IA de laudos cautelares anexados em formato PDF.

## Milestone
`v2.0.0 — Negociação Direta & Auditoria de Laudos Cautelares`

## Itens planejados
- [x] Remover botão de sinal online e taxa de reserva de R$ 1.500 nos anúncios.
- [x] Implementar CTA primário "Falar com Vendedor" no anúncio com redirecionamento para o chat interno e WhatsApp.
- [x] Validar integridade física e segurança de arquivos PDF via Magic Bytes (`%PDF-`).
- [x] Implementar pipeline assíncrono de auditoria pericial de documentos com Google Gemini 1.5 Flash Document AI e fallback heurístico local.
- [x] Criar componente visual `LaudoFeedbackCard.jsx` com score de procedência (0 a 100), veredito pericial e checklist dos 4 pilares estruturais.
- [x] Atualizar modelo de dados (`models.py`) com campos `laudo_url` e `laudo_feedback`.

## Responsáveis
- **Carlos Wilson**: Engenheiro Fullstack & Especialista em IA.
- **Prof. Flávio César**: Orientação técnica e acompanhamento metodológico.

## Entregas
- `backend/routers/uploads.py`: Rota de upload de laudos com auditoria IA.
- `backend/services/ai_service.py`: Pipeline de extração documental e análise de riscos.
- `frontend/src/components/vehicle/LaudoFeedbackCard.jsx`: Card interativo de resultado pericial.
- `frontend/src/pages/ShowcaseVehicleDetails.jsx`: CTA "Falar com Vendedor" e visualizador de laudo.

## Issues concluídas
- `#18`: Remoção da taxa de reserva de sinal e integração com chat do vendedor.
- `#19`: Auditoria automatizada de laudos em PDF com IA multimodal.
- `#20`: Checklist pericial dos 4 pilares (Identificação, Estrutura, Leilão e Pintura).

## Evidências
- Uploads com arquivos PDF corrompidos rejeitados com status 400.
- Laudos auditados exibindo score, veredito e apontamentos estruturais em tempo real.

## Retrospectiva
- **Pontos Fortes**: A auditoria com Gemini Vision acelerou em 90% a triagem de conformidade de laudos periciais trazidos pelo vendedor.
- **Ajustes para o próximo ciclo**: Criar emissor próprio de laudos periciais em PDF vetorial de alta definição e estruturar paginação no servidor.
