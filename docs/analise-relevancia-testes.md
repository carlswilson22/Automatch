# Análise de Relevância e Arquitetura da Suíte de Testes — Automatch

> **Data da Auditoria:** 24 de Novembro de 2026  
> **Status:** Conforme (Aprovado em CI e Homologação)  
> **Protocolo Adotado:** VLAEG (Visão, Link/Lógica, Arquitetura, Estilo/Execução)

---

## 1. Visão Geral do Inventário de Testes

O ecossistema de testes automatizados do Automatch é composto por **46 arquivos de teste** distribuídos entre Backend e Frontend:

* **Backend (`backend/`):** 25 arquivos `test_*.py` + 2 scripts de simulação Docker (`run_e2e_docker_test.py` e `demo_live_docker_user_journey.py`).
* **Frontend (`frontend/tests/`):** 21 arquivos `*.mjs` executados com Node.js nativo (`node:test`).

---

## 2. Categorização de Relevância — Backend

### A. Testes Críticos e Indispensáveis (Quality Gates no CI)
Estes testes garantem a integridade operacional, segurança e cumprimento dos requisitos estritos do projeto:

1. `test_health_probes.py`: Validação de liveness/readiness (`/api/health`, `/api/health/ready`) e headers de proteção OWASP (`Content-Security-Policy`, `X-Content-Type-Options`).
2. `test_project_audit_regressions.py`: Blindagem contra força bruta, expiração de OTP, revogação de tokens JWT e sanitização de paths em uploads de fotos.
3. `test_cleanup_regressions.py`: **Regra expressa de AGENTS.md** — Assegura resposta HTTP 404 para rotas legadas removidas (ex: `/api/scanner/pneu` e diagnóstico acústico).
4. `test_visual_evidence.py`: Validação de integridade do Schema v2 da Perícia Visual (garante que texto no anúncio não altera a análise pericial).
5. `test_vision_and_delete.py`: Validação de ciclo de vida completo de imagens e deleção segura com expurgo de arquivos físicos.
6. `test_database_repairs.py`: Teste de idempotência das migrações e validação de papéis multi-inquilino.
7. `test_query_count_battery.py`: Prevenção de regressões de performance de banco (detecção de N+1 queries).
8. `test_ai_streaming.py`: Resiliência de conexões SSE em `/api/chat/stream` e controle de taxa de requisições (rate limiting).
9. `test_usecases_full_battery.py`: Cobertura completa dos 8 Casos de Uso Oficiais do Sistema (UC-01 a UC-08).
10. `test_full_system_review.py`: Suíte mestre de ponta a ponta cobrindo 13 baterias funcionais consolidadas.

### B. Testes de Regressão Histórica e Auditoria de Sprints
* `test_sprint07_battery.py`, `test_improvements_battery.py`, `test_round3_regressions.py`, `test_persistent_fixes.py`, `test_defects_resolution_battery.py`, `test_b2b_and_plate.py`, `test_audit_full_battery.py`, `test_confirmed_pending_fixes.py`, `test_damage_experiments.py`, `test_demo_media_repair.py`, `test_demo_tools.py`, `test_laudo_ia_feedback.py`, `test_laudo_yolo_feedback.py`, `test_pericial_timeline.py`.
* **Relevância e Decisão:** Preservados integralmente. Embora possuam sobreposição parcial com os testes E2E, cumprem a diretriz de `AGENTS.md` de *preservação de registros históricos*, comprovando as correções graduais perante a banca acadêmica do CEUB.

### C. Scripts Utilitários de Homologação Manual
* `run_e2e_docker_test.py` e `demo_live_docker_user_journey.py`: Utilitários manuais para validação de ponta a ponta contra contêineres Docker ativos na porta 8000.

---

## 3. Categorização de Relevância — Frontend

Todos os 21 arquivos do frontend são relevantes e complementares, operando em duas frentes:

1. **Guarda de AST e Arquitetura (`scripts/check-source-usage.mjs`):** Garante que nenhum módulo fique órfão e que todas as dependências do `package.json` tenham consumidores no código.
2. **Suítes de Comportamento e Interface (`node --test tests/*.mjs`):**
   * *Segurança e Runtime:* `test_security_audit.mjs`, `test_runtime_audit.mjs`.
   * *Experiência 360° e Scanner IA:* `test_scanner_ia_and_360_4cars.mjs`, `test_visual_and_360_experience.mjs`, `test_laudo_ia_battery.mjs`, `test_laudo_visual_inconclusivo.mjs`.
   * *Acessibilidade e Usabilidade:* `test_dialog_focus.mjs`, `test_tour_guide_battery.mjs`, `test_design_tokens_battery.mjs`.
   * *Demonstração no GitHub Pages:* `test_gh_pages_demo_mode.mjs`.
   * *Vídeo Pericial e Chatbot:* `test_video_20s_and_chatbot_consumo.mjs` (padronizado com `node:test` e integrado oficialmente à contagem).

---

## 4. Conclusão da Auditoria

A suíte de testes do Automatch é sólida, cobre amplamente tanto a lógica de negócio quanto a segurança e acessibilidade, e opera com isolamento total em bancos descartáveis, cumprindo rigorosamente os requisitos de governança do projeto.
