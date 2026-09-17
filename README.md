# 🚗 Automatch™ — Marketplace Automotivo Inteligente & Perícia Multidimensional por IA

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8?logo=opencv&logoColor=white)](https://opencv.org/)

O **Automatch** é um ecossistema digital automotivo Fullstack de alto padrão projetado para transformar a compra, venda e auditoria pericial de veículos seminovos e usados no Brasil. A plataforma combina **visão computacional pericial**, **varredura 360° interativa**, **auditoria por IA de laudos em PDF**, **emissão de laudos periciais vetoriais A4 com QR Code**, **recuperação de senha segura via OTP**, **catálogo escalável com paginação no servidor**, **cruzamento cadastral em tempo real (DETRAN e Tabela FIPE)**, **central de favoritos** e **hub de exportação multicanal B2B homologado com AutoCerto DMS, Webmotors e OLX Autos**.

---

## 📋 Identificação Institucional

| Campo | Informação |
| :--- | :--- |
| **Instituição** | CEUB — Centro Universitário de Brasília |
| **Curso** | Análise e Desenvolvimento de Sistemas (ADS) |
| **Organização no GitHub** | [CampusCEUB](https://github.com/CAMPUSCEUB) |
| **Repositório Oficial** | [ADS-AUTOMATCH](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH) |
| **Equipe** | Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio |
| **ID do Projeto** | ADS-AUTOMATCH-2026 |

---

## 🛠️ Tecnologias e Arquitetura

O sistema adota uma arquitetura conteinerizada em microsserviços com isolamento de rede, orquestrada por um **API Gateway centralizado (Nginx)**:

* **Frontend:** React 18, Vite, Framer Motion, Lucide Icons, Tailwind CSS e Web Audio DSP.
* **Backend:** Python 3.11, FastAPI assíncrono com Lifespan Context Manager, SQLAlchemy ORM e Pydantic v2.
* **Banco de Dados:** PostgreSQL 15 (persistência relacional) e Redis 7 (cache de consultas e sessões).
* **Segurança & Criptografia (P0):**
  * Whitelist de CORS explícita por variável de ambiente (`ALLOWED_ORIGINS`).
  * Autenticação stateless com **JWT (RFC 7519)** assinado via HMAC-SHA256 com proteção estrita em rotas de perfil (`update_profile`).
  * Hash seguro de senhas com **PBKDF2-HMAC-SHA256** (100.000 iterações com salt aleatório).
  * Recuperação de senha via **OTP de 6 dígitos** com hash SHA-256 e rate limiting estrito.
* **Hub Pericial & Inteligência Artificial (P1):**
  * **Ultralytics YOLOv8 & OpenCV:** Detecção de classes veiculares, contornos e amassados, com *pre-warm* assíncrono no startup.
  * **Google Gemini 1.5 Flash Vision:** Scanner pericial visual e auditoria documental de laudos, com paralelização via `asyncio.gather`, timeout de 6s e exponential backoff em 503.
  * **Varredura 360° Interativa:** Inspeção contínua em 8 quadrantes angulares com mapeamento pericial.
  * **Auditoria de Laudos Cautelares:** Validação de integridade por Magic Bytes (`%PDF-`) antes da alocação de memória.
* **Geração de Documentos Oficiais:**
  * **ReportLab Engine:** Emissão de laudos cautelares em PDF vetorial A4 de alta resolução.
  * **QR Code Oficial:** Geração em 300 DPI (`qrcode` + PIL) apontando para a página pública de autenticidade (`/validar/{protocolo}`).
* **Agendador em Background:** APScheduler para auditoria periódica (a cada 60s) de veículos na Watchlist DETRAN.
* **Gateway & Infraestrutura:** Docker Compose unificando portas e rotas com Nginx Reverse Proxy.

---

## 📂 Estrutura do Repositório

```text
Automatch/
├── docker-compose.yml              # Orquestração dos 5 microsserviços (db, redis, backend, frontend, gateway)
├── .env                            # Variáveis de ambiente e segredos locais (JWT, Gemini, Postgres)
├── .env.example                    # Template oficial de variáveis de ambiente
├── .gitignore                      # Regras de exclusão Git padronizadas
├── README.md                       # Documentação principal e guia do projeto
├── BACKLOG.md                      # Backlog de requisitos e histórias de usuário (US)
├── docs/                           # Documentação institucional e técnica
│   ├── requisitos.md               # Matriz de requisitos funcionais (RF-01 a RF-26) e não funcionais
│   ├── arquitetura.md              # Visão arquitetural, modelos de dados e decisões técnicas (ADRs)
│   └── decisoes/                   # Registro formal de decisões arquiteturais (ADR-01 a ADR-06)
├── sprints/                        # Documentação dos ciclos de entrega (Sprints 00 a 03)
├── backend/                        # Microsserviço de API (FastAPI / Python 3.11)
│   ├── main.py                     # Entrypoint com lifespan, CORS explícito e pre-warm do YOLO
│   ├── models.py                   # Modelos relacionais (Car, Store, User, PasswordResetToken, etc.)
│   ├── schemas.py                  # Schemas Pydantic v2 com validação estrita de dados
│   ├── security.py                 # PBKDF2, criação/validação de tokens JWT e suporte a dotenv
│   ├── tasks.py                    # Agendador APScheduler para auditorias em background
│   ├── database.py                 # Pool de conexão SQLAlchemy e inicialização de banco
│   ├── seed.py                     # Carga inicial de concessionárias e catálogo de veículos
│   ├── test_vision_and_delete.py   # Suíte de testes automatizados (10/10 testes de integração)
│   ├── requirements.txt            # Dependências Python (FastAPI, ReportLab, qrcode, PyPDF2, etc.)
│   ├── Dockerfile                  # Imagem conteinerizada do Backend
│   ├── routers/                    # Endpoints modularizados:
│   │   ├── auth.py                 # Autenticação, perfil protegido e recuperação via OTP
│   │   ├── cars.py                 # Catálogo paginado no servidor com filtros combinados e ilike
│   │   ├── detran.py               # Auditoria de débitos e restrições (RENAJUD)
│   │   ├── ai_vision.py            # Endpoints do Hub Pericial de IA
│   │   ├── uploads.py              # Upload com validação de magic bytes de PDF
│   │   ├── tradein.py              # Simulador Troca com Troco multi-bancos
│   │   ├── alerts.py               # Radar de oportunidades e alertas de queda de preço
│   │   ├── integrations.py         # Sincronizador multicanal (AutoCerto, Webmotors, OLX)
│   │   └── laudos_export.py        # Exportação de laudo em PDF vetorial A4 com QR Code
│   └── services/                   # Motores de serviço:
│       ├── ai_service.py           # YOLOv8 pre-warm e Gemini paralelizado com backoff
│       ├── pdf_generator.py        # Geração de laudos vetoriais ReportLab com QR Code
│       └── pricing_service.py      # Avaliação de mercado e comparativo de Tabela FIPE
├── frontend/                       # Aplicação Web SPA (React 18 / Vite / Tailwind)
│   ├── package.json                # Dependências Node.js
│   ├── vite.config.js              # Configuração do Vite e plugins
│   ├── Dockerfile                  # Imagem conteinerizada do Frontend
│   ├── public/images/              # Acervo estático de fotos dos veículos
│   └── src/
│       ├── contexts/               # AuthContext (com inicialização em modo visitante)
│       ├── pages/                  # Telas ativas:
│       │   ├── Home.jsx            # Landing page institucional
│       │   ├── ShowcaseCatalog.jsx # Catálogo com paginação no servidor, skeletons e lazy loading
│       │   ├── ShowcaseVehicleDetails.jsx # Detalhes do veículo, perícia e botão "Falar com Vendedor"
│       │   ├── FavoritesPage.jsx   # Central dedicada de veículos favoritados
│       │   ├── PublicValidationPage.jsx   # Validador público de laudo via protocolo/QR Code
│       │   ├── AuthPage.jsx        # Login, cadastro por perfil e modal OTP de recuperação
│       │   ├── NewCarAdForm.jsx    # Cadastro de anúncio com upload e auditoria de laudo por IA
│       │   ├── Dashboard.jsx       # Painel B2B do lojista com métricas e sincronização
│       │   └── ...
│       ├── components/             # Componentes modulares e reutilizáveis:
│       │   ├── vehicle/            # LaudoFeedbackCard, MultichannelSyncModal, AIChatBox, etc.
│       │   ├── ui/                 # Modais, seletores e indicadores de status
│       │   └── layout/             # Navbar unificada, ScrollToTop e Footer
│       └── data/                   # favoritesManager, newCarsManager, plansData e mocks
└── gateway/                        # Proxy Reverso Central (Nginx)
    ├── nginx.conf                  # Roteamento unificado /api/* e /*
    └── Dockerfile                  # Imagem conteinerizada do Gateway Nginx
```

---

## 🚀 Como Executar o Projeto

### Opção A: Execução via Docker Compose (Recomendado)

Todos os serviços (PostgreSQL, Redis, Backend, Frontend e Nginx Gateway) sobem integrados com apenas um comando:

#### 1. Clonar e acessar o repositório:
```bash
git clone https://github.com/carlswilson22/Automatch.git
cd Automatch
```

#### 2. Configurar variáveis de ambiente:
Copie o template `.env.example` para `.env`:
```bash
cp .env.example .env
```
Variáveis principais no `.env`:
```env
GEMINI_API_KEY=sua_chave_gemini_aqui
JWT_SECRET=automatch_super_secret_jwt_key_2026_production_ready
POSTGRES_DB=automatch
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000,http://frontend:5173
```
> **Nota de Resiliência:** Caso `GEMINI_API_KEY` esteja em branco, o sistema ativa automaticamente o modo de simulação/fallback local inteligente, sem quebras ou falhas na interface.

#### 3. Subir e compilar todos os containers:
```bash
docker compose up -d --build
```

#### 4. Acompanhar os logs de execução:
```bash
# Logs de todos os microsserviços
docker compose logs -f

# Logs específicos do backend ou frontend
docker compose logs -f backend
docker compose logs -f frontend
```

#### 5. Verificar status dos containers ativos:
```bash
docker compose ps
```

#### 6. Executar a Suíte de Testes Automatizados:
O projeto conta com testes de integração cobrindo visão computacional, ciclo de exclusão de anúncios, diagnóstico acústico, scanner de pneus, visão 360°, simulador Troca com Troco, radar de alertas e integrações multicanal:
```bash
docker compose exec backend python test_vision_and_delete.py
```
*Resultado esperado:* **10/10 testes com 100% de aprovação**.

---

### Opção B: Execução Local / Híbrida (Sem Docker)

Se preferir rodar os serviços individualmente no seu ambiente de desenvolvimento:

#### 1. Banco de Dados e Redis:
Certifique-se de ter o PostgreSQL rodando na porta `5432` (banco `automatch`) e o Redis na porta `6379`.

#### 2. Inicializar o Backend (Python FastAPI):
```bash
cd backend
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Linux / macOS:
source venv/bin/activate

pip install -r requirements.txt
python seed.py
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Inicializar o Frontend (React + Vite):
Em outro terminal:
```bash
cd frontend
npm install
npm run dev
```

O frontend estará acessível em `http://localhost:5173` consumindo a API em `http://localhost:8000`.

---

## 🔗 Endereços de Acesso

| Serviço | URL | Descrição |
| :--- | :--- | :--- |
| **Aplicação Web (Gateway Nginx)** | [http://localhost](http://localhost) | Portal web completo na porta padrão HTTP 80 |
| **Porta Alternativa do Gateway** | [http://localhost:3000](http://localhost:3000) | Acesso secundário ao portal completo |
| **Frontend Vite Direto** | [http://localhost:5173](http://localhost:5173) | Interface SPA direta do servidor Vite |
| **Documentação da API (Swagger UI)** | [http://localhost:8000/docs](http://localhost:8000/docs) | Painel interativo OpenAPI para teste de rotas |

---

## 🔑 Credenciais de Demonstração

O banco de dados é inicializado automaticamente com o usuário administrador padrão:

* **E-mail:** `admin@automatch.com`
* **Senha:** `admin123`

---

## 🌟 Principais Funcionalidades do Sistema

### 1. Hub Pericial Multidimensional IA
* **Scanner de Carroceria HD:** Mapeamento pericial de riscos e amassados com coordenadas $(X, Y)$, classificação de gravidade e estimativa de reparo em R$.
* **Varredura 360° Interativa (`POST /api/analise-360`):** Inspeção com rotação contínua por arraste e mapeamento de avarias em 8 quadrantes angulares.
* **Vídeo Pericial de 15 Segundos (`PericialVideoViewer`):** Player interativo dedicado com linha do tempo de 15s e 3 checkpoints periciais (0-5s Frente & Óptica, 5-10s Linha de Cintura & Pneus, 10-15s Traseira & Motor), com upload de mídias de vistoria no backend (`POST /api/v1/pericia/video/upload`).
* **Comparador Multidimensional Lado a Lado (`VehicleComparatorModal`):** Comparação dinâmica de até 3 veículos simultaneamente sem uso de TrustScore, avaliando Preço vs Tabela FIPE Oficial, Quilometragem e Média Anual (km/ano), Integridade Estrutural do Laudo (100% Aprovado), Situação DETRAN e Ficha Mecânica.
* **Pre-warm do Modelo YOLOv8:** Inicialização em thread assíncrona durante o startup do servidor, eliminando picos de latência na primeira análise do usuário.
* **Gemini Paralelizado com Fallback:** Execução paralela dos modelos de IA (`asyncio.gather`), timeout otimizado de 6s e retry automático com exponential backoff para erros 503.

### 2. Emissão & Auditoria de Laudos Cautelares
* **Emissão de Laudo em PDF Vetorial A4 (`GET /api/v1/laudos/{car_id}/pdf`):** Documento oficial formatado via ReportLab com tipografia vetorial escalável, resumo dos 4 pilares periciais e termos legais.
* **QR Code Oficial de Validação Pública:** Código QR em 300 DPI inserido no cabeçalho do PDF que direciona para a página pública de autenticidade (`/validar/{protocolo}`).
* **Auditoria de Laudos por IA:** Análise inteligente de laudos em PDF anexados pelo vendedor com Google Gemini Document AI e geração automática do `LaudoFeedbackCard`.
* **Validação Prévia de Magic Bytes:** Inspeção estrita dos primeiros 5 bytes (`%PDF-`), impedindo que arquivos forjados ou corrompidos sobrecarreguem a memória RAM.

### 3. Catálogo Inteligente com Paginação no Servidor
* **Envelope Paginado (`GET /api/cars`):** Paginação nativa com `offset` e `limit`, busca textual `ilike` e filtros combinados de marca, modelo, ano e preço.
* **Navegação Numérica Dinâmica:** Barra de paginação com salto para primeira/última página, números inteligentes (`1 2 3 ... N`) e scroll suave automático para o topo.
* **Skeleton Loaders Animados:** Componente `CatalogSkeleton` com animação `pulse` para os modos Grid e List durante o carregamento.
* **Imagens Otimizadas:** Atributo `loading="lazy"` e dimensões fixas `width`/`height` prevenindo oscilações de layout (CLS) e acelerando o carregamento (LCP).
* **Acessibilidade Completa (a11y):** Atributos `aria-label` descritivos em todos os botões de favoritos, navegação e controles interativos.

### 4. Gestão de Favoritos & Experiência de Navegação
* **Central de Carros Curtidos (`/favoritos`):** Página dedicada que lista todos os automóveis favoritados com sincronização em tempo real via `favoritesManager`.
* **Transição Sem Saltos (`ScrollToTop`):** Reset automático de rolagem ao trocar de rota, garantindo que o usuário visualize os anúncios sempre a partir do topo.

### 5. Comunicação, Autenticação & Segurança de Conta
* **Recuperação de Senha via OTP (`POST /api/auth/reset-password`):** Fluxo seguro de redefinição com código de 6 dígitos gerado com SHA-256, validade de 15 minutos e rate limit estrito de 3 tentativas/hora.
* **Negociação Direta ("Falar com Vendedor"):** Botão de ação direta via chat interno ou WhatsApp, eliminando a cobrança de sinal online prévio.
* **Inicialização em Modo Visitante:** O sistema inicia deslogado para possibilitar testes completos de cadastro e login.
* **Perfis Especializados no Cadastro:**
  * 🛒 **Comprador:** Vitrine digital e gestão de favoritos.
  * 🚗 **Vendedor Particular:** Redirecionamento direto para a criação de anúncio (`/novo-anuncio`).
  * 🏢 **Lojista / Concessionária:** Acesso ao painel B2B (`/dashboard`) com ferramentas de estoque.

### 6. Negociação Avançada & Fintech Automotiva
* **Simulador 'Troca com Troco' (`POST /api/troca-com-troco`):** Avalia instantaneamente o seminovo do cliente pela placa, calculando se o comprador tem troco a receber em dinheiro via Pix ou saldo a financiar, integrando os bancos Itaú, Santander e BV Financeira.
* **Radar de Oportunidades & Alerta de Preço (`POST /api/alerts`):** Monitoramento de veículos com avisos por WhatsApp, E-mail ou Push.

### 7. Integrações B2B & Sincronizador Multicanal
* **Canais Homologados Exclusivos (`POST /api/integrations/sync`):** Sincronização em lote em 1 clique para os 3 canais oficiais: **AutoCerto DMS**, **Webmotors** e **OLX Autos**.
* **Feed XML AutoCerto (`GET /api/integrations/autocerto/feed.xml`):** Carga direta DMS formatada em `<carga_autocerto versao="3.1">`.
* **Feed XML Geral (`GET /api/integrations/feed.xml`):** Exportação padronizada compatível com os principais agregadores automotivos.

---

## 🧪 Comandos Úteis do Docker

```bash
# Reiniciar todos os containers
docker compose restart

# Rodar a suíte completa de testes de integração (10/10 testes)
docker compose exec backend python test_vision_and_delete.py

# Acessar o terminal interativo do container Backend
docker compose exec backend bash

# Acessar o banco de dados PostgreSQL via psql
docker compose exec db psql -U postgres -d automatch

# Parar a aplicação mantendo os dados persistidos nos volumes
docker compose down

# Parar e resetar completamente os dados do banco de dados
docker compose down -v
```

---

## 📚 Documentação Institucional & Governança

Para detalhes técnicos profundos, consulte a pasta de documentação:

* [docs/requisitos.md](docs/requisitos.md) — Matriz completa de Requisitos Funcionais (RF-01 a RF-26) e Não Funcionais.
* [docs/arquitetura.md](docs/arquitetura.md) — Arquitetura de microsserviços, diagramas de dados e integrações.
* [BACKLOG.md](BACKLOG.md) — Backlog priorizado e critérios de aceitação (DoD).
* [sprints/README.md](sprints/README.md) — Planejamento e retrospectivas das Sprints 00, 01, 02 e 03.
* [CHANGELOG.md](CHANGELOG.md) — Histórico detalhado de versões e alterações.

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e de demonstração tecnológica no âmbito do curso de Análise e Desenvolvimento de Sistemas (ADS) do CEUB. Todos os direitos reservados à equipe **Automatch**.
