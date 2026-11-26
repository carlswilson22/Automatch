# 🚗 Automatch™ — Marketplace Automotivo & Análise Assistida de Veículos

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8?logo=opencv&logoColor=white)](https://opencv.org/)

Plataforma automotiva Fullstack que reúne **marketplace de compra e venda de veículos**, **auditoria assistida de laudos e imagens por IA (OpenCV + Ultralytics YOLOv8 + Google Gemini)**, **varredura fotográfica 360°**, **vídeo pericial de 20s**, **referência FIPE (BrasilAPI)**, **dossiê em PDF com validação por protocolo/QR Code** e **rede B2B de estoque compartilhado para lojistas**.

---

## 🏛️ Identificação Institucional & Repositórios

| Campo | Informação |
| :--- | :--- |
| **Instituição** | Centro Universitário de Brasília (UniCEUB) |
| **Curso / Disciplina** | Análise e Desenvolvimento de Sistemas (ADS) — Projeto Integrador / ACE |
| **Repositório Principal** | [`carlswilson22/Automatch`](https://github.com/carlswilson22/Automatch) (com CD automatizado no GitHub Pages em `main`) |
| **Repositório Secundário** | [`CAMPUSCEUB/ADS-AUTOMATCH`](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH) (sincronizar somente `main`; preservar demais branches) |
| **Equipe de Desenvolvimento** | Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio |
| **Procedimento de Publicação** | Seguir [`docs/sincronizacao-repositorios.md`](docs/sincronizacao-repositorios.md) |

> **Modo Demonstração vs Operação Completa:** O GitHub Pages do repositório principal publica o frontend estático em modo demonstrativo (sem FastAPI, PostgreSQL, uploads ou IA no servidor). A aplicação completa executa localmente ou em servidor via Docker Compose com API e banco próprios.

---

## 🧭 Estrutura de Navegação do Repositório

| Seção | Descrição | Link |
| :--- | :--- | :--- |
| **Backlog & Kanban** | Quadro Kanban PI 2, matriz de rastreabilidade, épicos e pendências | [BACKLOG.md](BACKLOG.md) |
| **Estado Atual** | Limites reais, modo demonstração, integrações e exclusões vigentes | [docs/estado-atual.md](docs/estado-atual.md) |
| **Doc. & Arquitetura v2.0** | Documento unificado v2.0 revisado e alinhado ao código real | [docs/documentacao-projeto-arquitetura-v2.md](docs/documentacao-projeto-arquitetura-v2.md) |
| **Banco de Dados** | Entidades ORM (14 modelos), relacionamentos e migrações Alembic | [docs/DOCUMENTACAO_BANCO_DE_DADOS.md](docs/DOCUMENTACAO_BANCO_DE_DADOS.md) |
| **Requisitos** | Matriz de requisitos funcionais e não funcionais | [docs/requisitos.md](docs/requisitos.md) |
| **Arquitetura Técnica** | Diagramas Mermaid, fronteiras de acesso e ambientes | [docs/arquitetura.md](docs/arquitetura.md) |
| **Escopo dos Arquivos** | Catálogo técnico com a finalidade dos arquivos do projeto | [docs/ESCOPO_DOS_ARQUIVOS.md](docs/ESCOPO_DOS_ARQUIVOS.md) |
| **Decisões (ADRs)** | Registros de Decisões Arquiteturais (ADR-001 a ADR-008) | [docs/decisoes/README.md](docs/decisoes/README.md) |
| **Sprints & Entregas** | Relatórios das Sprints 00–08 e Entregas Avaliativas 01–03 | [sprints/README.md](sprints/README.md) / [entregas/README.md](entregas/README.md) |
| **Changelog** | Histórico cronológico de alterações e correções | [CHANGELOG.md](CHANGELOG.md) |

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias Utilizadas (Manifests Reais) |
| :--- | :--- |
| **Frontend (SPA)** | React 18, React Router DOM 7, Vite 8, TailwindCSS 3.4, Framer Motion, Lucide Icons, HTML5 Canvas |
| **Backend (API REST)** | Python 3.11, FastAPI, Uvicorn, SQLAlchemy 2, Pydantic 2, Alembic, APScheduler, httpx |
| **Banco de Dados** | PostgreSQL 15 (Docker Compose dev/prod) e SQLite (testes descartáveis / dev leve) |
| **IA & Visão Computacional** | OpenCV (`opencv-python-headless`), Ultralytics YOLOv8 (`yolov8n.pt`), Google Gemini API (`GEMINI_MODELS` opcional) + fallbacks locais |
| **Documentos & Mídia** | ReportLab (PDF vetorial A4), `qrcode[pil]`, Pillow, `pypdf` |
| **Infraestrutura & Gateway** | Docker, Docker Compose (4 serviços: `db`, `backend`, `frontend`, `gateway`; sem Redis), Nginx |
| **Segurança** | JWT (`HS256`, revogação via `token_version`), `PBKDF2-HMAC-SHA256`, Magic Bytes em uploads, CORS explícito, Rate Limiter em processo, cabeçalhos OWASP |
| **Qualidade & CI/CD** | GitHub Actions (`ci.yml` + `static.yml`), ESLint, `node --test` + `scripts/check-source-usage.mjs` (AST), Python `unittest` (`run_tests.py`) |

---

## 🌟 Principais Funcionalidades e Limites

1. **Catálogo, Vitrine Digital e Anúncios:** Busca textual, filtros dinâmicos, paginação server-side (`GET /api/cars`), cadastro, edição e exclusão com controle multilocatário (`OWASP A01`).
2. **Varredura 360° & Vídeo Pericial de 20s:** Visualizador fotográfico em até 8 ângulos (`Vehicle360Viewer.jsx`) e player de 20s em 3 fases sincronizadas com `shared/pericial-timeline.json` (`PericialVideoViewer.jsx`). *(Não é reconstrução 3D geométrica).*
3. **Scanner Visual & Auditoria de Laudos PDF por IA:** Contrato v2 (`inspection_contract.py`) com retorno `inconclusive` enquanto não houver detector calibrado de avarias; auditoria assistida de PDF/imagem via Gemini/heurística com cross-check de placa, chassi, marca/modelo, ano e km (`SEM_RESSALVAS`, `COM_ATENCAO`, `COM_RESTRICOES`) e semáforo unificado entre Scanner, Dossiê e Comparador.
4. **Dossiê Automatch em PDF & Validação Pública:** Emissão vetorial ReportLab com protocolo e QR Code (`/validar/{protocolo}`), preservando dados cadastrados sem fabricar certificação externa.
5. **Comparador, Calculadora TCO & AutoPrice™:** Confronto simultâneo de 2 a 3 veículos em 5 dimensões, estimativas ilustrativas de custo mensal (TCO) e indicador de preço frente à FIPE.
6. **Rede B2B de Estoque Compartilhado & Hold Lock:** Gestão de parcerias entre lojas, vitrine B2B paginada, cálculo de margem/comissão, reserva temporária, pedido de fechamento/consentimento, chat B2B por polling e trilha de auditoria (`routers/partnerships.py`).
7. **Consultor IA & Chat SSE:** Assistente contextual (`POST /api/chat` e `/api/chat/stream`) apoiado nos dados do anúncio, sem negociar ou prometer financiamento.
8. **Integrações, Alertas & Checkout:** Consulta FIPE via BrasilAPI com cache em memória por código/ano; DETRAN, busca de placa, publicação multicanal, feed XML demonstrativo, alertas de preço e checkout em desenvolvimento operam como demonstrações/cadastros sem disparo externo ou cobrança real.
9. **Fora do escopo ativo:** Scanner/reescaneamento de pneus e diagnóstico acústico foram retirados do código e das telas em 18/11/2026 ([limpeza e limites](docs/estado-atual.md)).

Consulte [`docs/estado-atual.md`](docs/estado-atual.md) e [`docs/requisitos.md`](docs/requisitos.md). Não há certificação WCAG AAA, garantia de acurácia de IA ou cobertura integral automática de todos os fluxos visuais.

---

## 🚀 Como Executar com Docker

### Pré-requisitos
* [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

### Passo a passo
```sh
git clone https://github.com/carlswilson22/Automatch.git
cd Automatch
cp .env.example .env
docker compose up -d --build
```
*(No PowerShell: `Copy-Item .env.example .env`. Preencha as variáveis locais sem versionar segredos. Para execução sem Docker ou produção, consulte [`docs/configuracao-e-execucao.md`](docs/configuracao-e-execucao.md).)*

### 🌐 Portas & Acesso Local (Desenvolvimento)

| Serviço | Endereço | Descrição |
| :--- | :--- | :--- |
| **Gateway (Entrada Oficial)** | `http://localhost` ou `http://localhost:3000` | Proxy Nginx unificando frontend e `/api` |
| **Frontend Vite** | `http://localhost:5173` | Servidor de desenvolvimento React |
| **Swagger UI (API)** | `http://localhost:8000/docs` | Documentação interativa FastAPI |
| **OpenAPI Schema** | `http://localhost:8000/openapi.json` | Contrato OpenAPI da API |
| **PostgreSQL (Host)** | `127.0.0.1:5433` (`db: automatch`) | Banco relacional exposto em desenvolvimento |

---

## 🔑 Acesso Público da Demonstração — GitHub Pages

| Campo | Valor |
| :--- | :--- |
| **E-mail** | `admin@automatch.com` |
| **Senha** | `admin123` |

> Esses acessos são públicos e destinados exclusivamente à apresentação no modo demonstrativo do GitHub Pages (manutenção autorizada pelo responsável em 17/11/2026). Em instalações reais/produção, defina `ADMIN_SEED_PASSWORD`, `JWT_SECRET` e credenciais exclusivas no ambiente privado.

---

## 🧪 Verificar Alterações e Testes Automatizados

No diretório `frontend`:
```sh
npm ci
npm run lint
npm test
npm run build
```
*(Inclui auditoria AST de módulos em `scripts/check-source-usage.mjs` + suítes `node --test tests/*.mjs`.)*

No diretório `backend` (ou via container isolado):
```sh
python run_tests.py
```
O runner executa testes `unittest` e cinco jornadas E2E usando bancos SQLite e diretórios temporários descartáveis, sem ler o `.env` local nem alterar o banco real. Consulte [`docs/testes-e-evidencias.md`](docs/testes-e-evidencias.md) para os resultados históricos e limites de verificação.

---

## 📚 Documentação & Governança

* **Índice Geral:** [`docs/README.md`](docs/README.md)
* **Contribuição & Sincronização:** [`CONTRIBUTING.md`](CONTRIBUTING.md) e [`docs/sincronizacao-repositorios.md`](docs/sincronizacao-repositorios.md)
* **Segurança & Conduta:** [`SECURITY.md`](SECURITY.md) e [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md)
* **Registros de Auditoria:** [`docs/auditoria-scanner-video-2026-11-19.md`](docs/auditoria-scanner-video-2026-11-19.md), [`docs/verificacao-banco.md`](docs/verificacao-banco.md), [`docs/treinamento-avarias-2026-11-19.md`](docs/treinamento-avarias-2026-11-19.md) e [`docs/analise-relevancia-testes.md`](docs/analise-relevancia-testes.md)

---

## 📄 Licença

Distribuído sob a licença MIT. Consulte [`LICENSE`](LICENSE) e [`NOTICE`](NOTICE).
