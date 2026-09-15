# Sprint 03 — Dossiê em PDF Vetorial, Recuperação OTP e Paginação do Servidor

## Período
Início: 14/09/2026 | Fim: 15/09/2026

## Objetivo
Implementar a emissão do Dossiê Oficial em PDF Vetorial A4 com QR Code de autenticidade escaneável, prover recuperação de senha segura via código OTP com rate limiting e popup no frontend, e migrar a paginação do catálogo para o servidor com navegação numérica.

## Milestone
`v2.1.0 — Dossiê Vetorial com QR Code, Segurança OTP & Catálogo Escalável`

## Itens planejados
- [x] `[ATM-LAUDO-03]` Gerador de Dossiê Oficial em PDF Vetorial A4 via ReportLab (`backend/services/pdf_generator.py`).
- [x] Integração de QR Code em alta resolução (300 DPI) apontando para a URL de validação pública (`/validar/:protocolo`).
- [x] Endpoint `GET /api/v1/laudos/{car_id}/pdf` retornando binário `%PDF-1.4`.
- [x] Página pública de validação pericial (`frontend/src/pages/PublicValidationPage.jsx`).
- [x] `[ATM-AUTH-02]` Modelo `PasswordResetToken` com hash SHA-256 e expiração de 15 minutos.
- [x] Endpoints `POST /api/auth/forgot-password` e `POST /api/auth/reset-password` com rate limiting (3 req/hora).
- [x] Modal de recuperação de senha em duas etapas no `AuthPage.jsx` com popup/card do código OTP para ambiente de desenvolvimento.
- [x] `[ATM-CAT-03]` Endpoint `GET /api/cars` com envelope de paginação `{ items, total, page, pages, limit }`, `offset/limit` e busca textual `ilike`.
- [x] Base de dados semeada com 25+ veículos para validação de paginação.
- [x] Interface de paginação numérica dinâmica no `ShowcaseCatalog.jsx` (`<<`, `<`, `[1]`, `[2]`, `>`, `>>`) com rolagem suave ao topo.

## Responsáveis
- **Carlos Wilson**: Engenheiro Fullstack & Especialista em Segurança/DevOps.
- **Prof. Flávio César**: Orientação técnica e acompanhamento metodológico.

## Entregas
- `backend/services/pdf_generator.py` e `backend/routers/laudos_export.py`.
- `frontend/src/pages/PublicValidationPage.jsx` e rota `/validar/:protocolo` no `App.jsx`.
- `backend/models.py` (tabela `PasswordResetToken`) e `backend/routers/auth.py`.
- `backend/routers/cars.py`, `backend/schemas.py` e `backend/seed.py`.
- `frontend/src/pages/ShowcaseCatalog.jsx` com paginação numérica.

## Issues concluídas
- `#22`: Geração de laudo pericial em PDF vetorial A4 com QR Code.
- `#23`: Validação pública de autenticidade de laudos periciais.
- `#24`: Recuperação de senha segura com código OTP de 6 dígitos e rate limiting.
- `#25`: Paginação do catálogo no servidor com navegação numérica.

## Evidências
- PDF gerado validado via curl com cabeçalho `%PDF-1.4` (Status 200 OK, tamanho ~5.8 KB).
- Ciclo de OTP testado e aprovado: solicitação -> hash no banco -> redefinição de senha com PBKDF2 -> login com sucesso.
- Paginação do servidor validada com 25 veículos (Página 1: 20 itens, Página 2: 5 itens).
- Compilação de produção do frontend (`npm run build`) sem erros em 26.30s.

## Retrospectiva
- **Pontos Fortes**: A plataforma agora atende a requisitos industriais de segurança, emissão de documentos periciais autênticos e catálogo com alta performance escalável.
- **Próximas ações**: Planejamento da Sprint 4 para novos recursos e consolidação das entregas acadêmicas.
