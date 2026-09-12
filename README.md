# 🚗 Automatch™ - Plataforma Inteligente de Marketplace, Vistorias Periciais & IA

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8?logo=opencv&logoColor=white)](https://opencv.org/)

O **Automatch** é um ecossistema digital automotivo Fullstack de alto padrão projetado para transformar a compra, venda e auditoria de veículos seminovos e usados no Brasil. A plataforma combina **visão computacional pericial**, **varredura 360° interativa**, **cruzamento cadastral em tempo real (DETRAN e Tabela FIPE)**, **aba dedicada de carros favoritos** e **hub de exportação multicanal B2B homologado com AutoCerto DMS, Webmotors e OLX Autos**.

---

## 🛠️ Tecnologias e Arquitetura

O sistema adota uma arquitetura conteinerizada em microsserviços com isolamento de rede orquestrada por um **API Gateway centralizado (Nginx)**:

* **Frontend:** React 18, Vite, Framer Motion, Lucide Icons, Tailwind CSS e Web Audio DSP.
* **Backend:** Python 3.11, FastAPI assíncrono, SQLAlchemy ORM e Pydantic v2.
* **Banco de Dados:** PostgreSQL 15 (persistência relacional) e Redis 7 (cache de placas e sessões).
* **Segurança & Criptografia:** Hash seguro de senhas com **PBKDF2-HMAC-SHA256** (salt aleatório) e autenticação stateless com **JWT (RFC 7519)** assinado via HMAC-SHA256.
* **Hub Pericial IA Multidimensional:**
  * **Ultralytics YOLOv8 & OpenCV:** Detecção de classes veiculares, contornos e deformidades de lataria.
  * **Google Gemini 1.5 Flash Vision:** Scanner pericial visual com pré-compressão e Chatbot Consultivo (RAG).
  * **Varredura 360° Interativa:** Inspeção contínua em 8 quadrantes com mapeamento pericial.
  * **Automatch Engine Sound AI & Tread Depth Scanner:** Endpoints backend dedicados de diagnóstico acústico e sulcos de pneus (Resolução 558/80 do CONTRAN).
* **Agendador em Background:** APScheduler para auditoria periódica (a cada 60s) de veículos na Watchlist DETRAN.
* **Gateway & Infraestrutura:** Docker Compose unificando portas e rotas com Nginx Reverse Proxy.

---

## 📂 Estrutura do Repositório

```text
Automatch/
├── docker-compose.yml              # Orquestração dos 5 containers (db, redis, backend, frontend, gateway)
├── .env                            # Variáveis de ambiente e chaves de API (Gemini, JWT, etc.)
├── .env.example                    # Template oficial de variáveis de ambiente
├── .gitignore                      # Regras de exclusão Git padronizadas
├── README.md                       # Documentação principal e guia do projeto
├── BACKLOG.md                      # Backlog de requisitos e sprints
├── backend/                        # Microsserviço de API (FastAPI / Python 3.11)
│   ├── main.py                     # Entrypoint da aplicação, ciclo de vida e rotas
│   ├── models.py                   # Modelos relacionais SQLAlchemy (Store, Car, User, etc.)
│   ├── schemas.py                  # Schemas Pydantic v2 de validação e serialização
│   ├── security.py                 # Hash PBKDF2 e geração/validação de tokens JWT
│   ├── tasks.py                    # Agendador periódico APScheduler para DETRAN Watchlist
│   ├── database.py                 # Pool e engine de conexão ao PostgreSQL
│   ├── seed.py                     # Carga inicial de concessionárias e estoque
│   ├── test_vision_and_delete.py   # Suíte de testes automatizados (10/10 testes de integração)
│   ├── requirements.txt            # Dependências Python gerenciadas
│   ├── Dockerfile                  # Imagem conteinerizada do Backend
│   ├── alembic/                    # Migrações versionadas do banco de dados
│   ├── routers/                    # Endpoints modularizados (auth, cars, detran, ai_vision, integrations, tradein)
│   └── services/                   # Motores de IA (ai_service com 360, motor e pneus, pricing_service)
├── frontend/                       # Aplicação Web SPA (React 18 / Vite / Tailwind)
│   ├── package.json                # Dependências Node.js
│   ├── vite.config.js              # Configuração do Vite e plugins
│   ├── Dockerfile                  # Imagem conteinerizada do Frontend
│   ├── public/images/              # Acervo estático de fotos dos veículos
│   └── src/
│       ├── contexts/               # AuthContext (com inicialização limpa em modo visitante)
│       ├── pages/                  # Telas (Home, ShowcaseCatalog, ShowcaseVehicleDetails, FavoritesPage, etc.)
│       ├── components/             # Componentes modulares
│       │   ├── vehicle/            # MultichannelSyncModal (AutoCerto), Vehicle360Viewer, AIChatBox, etc.
│       │   ├── ui/                 # Componentes visuais, modais e seletores
│       │   └── layout/             # Navbar unificada, ScrollToTop e Footer
│       └── data/                   # favoritesManager, newCarsManager, plansData e mocks
└── gateway/                        # Proxy Reverso Central (Nginx)
    ├── nginx.conf                  # Roteamento unificado /api/* e /*
    └── Dockerfile                  # Imagem conteinerizada do Gateway Nginx
```

---

## 🚀 Como Executar o Projeto

### Opção A: Execução via Docker Compose (Recomendado)

Todos os serviços (PostgreSQL, Redis, Backend, Frontend e Nginx Gateway) sobem orquestrados com apenas um comando:

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
```
> **Nota:** Caso `GEMINI_API_KEY` esteja em branco, o sistema ativa automaticamente o modo de simulação/fallback local inteligente, sem quebras ou falhas na interface.

#### 3. Subir e compilar todos os containers:
```bash
docker compose up -d --build
```

#### 4. Acompanhar os logs:
```bash
# Logs gerais
docker compose logs -f

# Logs específicos
docker compose logs -f backend
docker compose logs -f frontend
```

#### 5. Verificar status dos containers ativos:
```bash
docker compose ps
```

#### 6. Executar a Suíte de Testes Automatizados:
O projeto conta com testes de integração cobrindo visão computacional, ciclo de exclusão de anúncios, diagnóstico acústico, scanner de pneus, visão 360°, simulador Troca com Troco, radar de alertas e integrações multicanal (incluindo AutoCerto):
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

O banco de dados é inicializado automaticamente com o usuário administrador:

* **E-mail:** `admin@automatch.com`
* **Senha:** `admin123`

---

## 🌟 Principais Funcionalidades do Sistema

### 1. Hub Pericial Multidimensional IA
* **Scanner de Carroceria HD:** Mapeamento de riscos e amassados com pins $(X, Y)$, classificação de gravidade e custo de reparo em R$.
* **Varredura 360° Interativa (`POST /api/analise-360`):** Controle contínuo de rotação por arraste ou giro automático com distribuição de avarias em 8 quadrantes angulares.
* **Layout Limpo & Otimizado:** Visualização focada nas perícias visuais HD e 360°, eliminando poluição visual na página de detalhes.

### 2. Vitrine, Preço FIPE & Carros Curtidos
* **Catálogo Multifacetado:** Busca com filtros por marca, modelo, ano, faixa de preço, transmissão e combustível.
* **Preço de Referência FIPE:** Comparativo transparente estilo Webmotors/OLX exibindo valor anunciado, tabela FIPE oficial e cálculo de economia.
* **Carros Curtidos (`/favoritos`):** Página dedicada para visualização e gerenciamento de veículos favoritos salvos via coração no cabeçalho e nos cards.
* **Navegação Sem Saltos (`ScrollToTop`):** Transição suave de telas com reset instantâneo de scroll, impedindo descidas automáticas indesejadas ao abrir anúncios.
* **Auditoria DETRAN (`GET /api/detran/{placa}`):** Levantamento de multas, débitos de IPVA, licenciamento e restrições judiciais (RENAJUD).

### 3. Gestão e Ciclo de Vida dos Anúncios
* **Publicação com Validação IA:** Cadastro intuitivo com pré-análise pericial automática das fotos enviadas.
* **Exclusão Segura (`DELETE /api/cars/{id}`):** Exclusão atômica em banco de dados e expurgo de cache com confirmação no frontend.
* **Identificação Multi-Lojas (`GET /api/stores`):** Separação visual de concessionárias e revendas parceiras com telefones e endereços.

### 4. Comunicação, Autenticação & Perfis de Usuário
* **Consultor Virtual IA Otimizado (RAG / Gemini):** Assistente contextualizado nos dados do automóvel com respostas inteligentes sobre mecânica, consumo, financiamento e garantia, com fallback local resiliente.
* **Negociação Direta:** Chat em tempo real com o vendedor e integração para contato via WhatsApp.
* **Inicialização Limpa (Modo Visitante):** O sistema inicializa sempre deslogado para permitir testes manuais do fluxo de cadastro.
* **Perfis Especializados no Cadastro:**
  * 🛒 **Comprador:** Acesso a favoritos e vitrine.
  * 🚗 **Vendedor Particular:** Redirecionamento direto para `/novo-anuncio`.
  * 🏢 **Lojista / Concessionária:** Acesso ao `/dashboard` B2B e multicanal.
* **Planos de Assinatura & Checkout:** 4 modalidades (Gratuito, Pro, Revenda, Concessionária) integradas com fluxo de pagamento.

### 5. Negociação Avançada & Fintech Automotiva
* **Simulador 'Troca com Troco' (`POST /api/troca-com-troco`):** Avaliação instantânea do veículo usado do comprador via placa/modelo/km. Calcula se o comprador tem troco a receber em dinheiro via Pix ou saldo a financiar, integrando simulador multi-bancos com Itaú, Santander e BV Financeira.
* **Radar de Oportunidades & Alerta de Queda de Preço (`POST /api/alerts`):** Ativação de alertas inteligentes por veículo com notificações via WhatsApp, E-mail ou WebPush através de botão de ação discreto na barra superior.

### 6. Integrações B2B & Exportação Multicanal
* **Conexão com AutoCerto DMS (`POST /api/integrations/sync`):** Hub de integração B2B que sincroniza anúncios em 1 clique simultaneamente para os canais parceiros homologados: **AutoCerto DMS**, **Webmotors** e **OLX Autos**.
* **Feed XML AutoCerto (`GET /api/integrations/autocerto/feed.xml`):** Exportação padronizada na estrutura `<carga_autocerto versao="3.1">` homologada para carga de estoque em lote.
* **Feed XML Geral (`GET /api/integrations/feed.xml`):** Exportação padronizada compatível com agregadores automotivos.

---

## 🧪 Comandos Úteis do Docker

```bash
# Reiniciar todos os containers
docker compose restart

# Rodar a suíte completa de testes de integração (10/10 testes)
docker compose exec backend python test_vision_and_delete.py

# Acessar o terminal interativo do Backend
docker compose exec backend bash

# Acessar o banco de dados PostgreSQL via psql
docker compose exec db psql -U postgres -d automatch

# Parar a aplicação mantendo os dados
docker compose down

# Parar e resetar completamente os dados do banco
docker compose down -v
```

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e de demonstração tecnológica. Todos os direitos reservados à equipe **Automatch**.
