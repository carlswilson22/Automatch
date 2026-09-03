# 🚗 Automatch™ - Plataforma Inteligente de Gestão Automotiva, Vistorias Periciais & IA

O **Automatch** é uma solução Fullstack de alto padrão projetada para revolucionar o mercado automotivo. A plataforma combina **visão computacional para auditoria de laudos**, **inteligência artificial generativa multimodal (Google Gemini 1.5 Flash)**, **cruzamento cadastral em tempo real (Tabela FIPE e DETRAN)** e um **motor proprietário de precificação justa (AutoPrice™)**.

---

## 🛠️ Tecnologias e Arquitetura

O sistema adota uma arquitetura conteinerizada com isolamento de serviços orquestrada por um **API Gateway centralizado (Nginx)**:

* **Frontend:** React 18, Vite, Framer Motion, Lucide Icons e Tailwind CSS.
* **Backend:** Python 3.11, FastAPI, SQLAlchemy ORM e Pydantic v2.
* **Banco de Dados:** PostgreSQL 15 (armazenamento relacional persistente) e Redis 7 (cache e mensageria).
* **Segurança & Criptografia:** Hash seguro de senhas com **PBKDF2-HMAC-SHA256** (salt aleatório de 16 bytes) e autenticação stateless com **JWT (RFC 7519)** assinado via HMAC-SHA256.
* **Visão Computacional & IA:**
  * **Ultralytics YOLOv8:** Detecção e inspeção pericial de peças e itens em laudos veiculares via threads assíncronas.
  * **Google Gemini 1.5 Flash Vision:** Scanner visual de avarias na lataria com pré-compressão de alta performance e chatbot consultivo com RAG contextualizado no veículo.
* **Agendador de Tarefas:** APScheduler para monitoramento e auditoria periódica (a cada 60s) de veículos na Watchlist DETRAN.
* **Gateway & Infraestrutura:** Docker, Docker Compose e Nginx como Proxy Reverso unificando rotas e portas.

---

## 📂 Estrutura do Repositório

```text
Pasta Automatch/
├── docker-compose.yml              # Orquestração dos microsserviços (db, redis, backend, frontend, gateway)
├── README.md                       # Documentação oficial do projeto
├── Projeto pi/
│   ├── backend/                    # API FastAPI
│   │   ├── main.py                 # Rotas da API, ciclo de vida e orquestração de IA
│   │   ├── models.py               # Modelos SQLAlchemy (Store, Car, User, PaymentOrder, LaudoWatchlist)
│   │   ├── schemas.py              # Schemas Pydantic de validação e serialização
│   │   ├── security.py             # Criptografia PBKDF2 e geração/validação de JWT
│   │   ├── tasks.py                # Agendador periódico APScheduler para DETRAN Watchlist
│   │   ├── database.py             # Engine de conexão ao PostgreSQL
│   │   ├── seed.py                 # Povoamento inicial de lojas e estoque
│   │   ├── requirements.txt        # Dependências Python
│   │   └── Dockerfile              # Imagem Docker do Backend
│   ├── frontend/                   # Aplicação React 18 SPA
│   │   ├── src/
│   │   │   ├── contexts/           # AuthContext integrado com persistência JWT
│   │   │   ├── pages/              # Telas (Home, ShowcaseCatalog, ShowcaseVehicleDetails, etc.)
│   │   │   ├── components/         # Componentes modulares (UI, IA, Veículos, Layout)
│   │   │   └── data/               # Mocks de suporte e gerenciadores locais
│   │   ├── package.json            # Dependências Node.js
│   │   └── Dockerfile              # Imagem Docker do Frontend
│   └── gateway/                    # Proxy Reverso Central
│       ├── nginx.conf              # Roteamento unificado /api/* e /*
│       └── Dockerfile              # Imagem Docker do Gateway Nginx
```

---

## 🚀 Comandos para Inicializar e Executar o Projeto

Você pode rodar o Automatch através do **Docker Compose (Recomendado)** ou em **Modo Local/Híbrido** (desenvolvimento direto na máquina).

---

### Opção A: Execução via Docker Compose (Recomendado)

Todos os serviços (PostgreSQL, Redis, Backend, Frontend e Nginx Gateway) sobem orquestrados com apenas um comando:

#### 1. Clonar e acessar a pasta do projeto:
```bash
git clone https://github.com/carlswilson22/Automatch.git
cd Automatch
```

#### 2. Configurar variáveis de ambiente (opcional):
Crie um arquivo `.env` na raiz caso queira fornecer sua chave do Google Gemini e customizar credenciais:
```bash
GEMINI_API_KEY=sua_chave_aqui
JWT_SECRET=sua_chave_secreta_jwt_super_segura
POSTGRES_DB=automatch
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
```

#### 3. Subir e compilar todos os containers:
```bash
docker compose up -d --build
```

#### 4. Acompanhar os logs em tempo real:
```bash
# Logs de todos os microsserviços
docker compose logs -f

# Ou logs específicos do backend/frontend:
docker compose logs -f backend
docker compose logs -f frontend
```

#### 5. Verificar status dos containers ativos:
```bash
docker compose ps
```

#### 6. Comandos de Gerenciamento do Docker:
```bash
# Reiniciar todos os containers
docker compose restart

# Executar o seed de dados no PostgreSQL (lojas e carros iniciais)
docker compose exec backend python seed.py

# Acessar o terminal do container Backend
docker compose exec backend bash

# Acessar o banco de dados via terminal PostgreSQL (psql)
docker compose exec db psql -U postgres -d automatch

# Parar a aplicação mantendo os dados do banco
docker compose down

# Parar a aplicação e resetar completamente os volumes de banco de dados
docker compose down -v
```

---

### Opção B: Execução Local / Híbrida (Sem Docker)

Se preferir rodar os serviços individualmente no seu ambiente de desenvolvimento:

#### 1. Banco de Dados e Redis:
Certifique-se de ter o PostgreSQL rodando na porta `5432` com o banco `automatch` criado e o Redis ativo na porta `6379`.

#### 2. Inicializar o Backend (Python FastAPI):
```bash
# Navegar até a pasta do backend
cd "Projeto pi/backend"

# Criar e ativar o ambiente virtual
python -m venv venv

# Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# Windows (CMD):
.\venv\Scripts\activate.bat
# Linux / macOS:
source venv/bin/activate

# Instalar as dependências
pip install -r requirements.txt

# Executar o seed inicial do banco
python seed.py

# Iniciar o servidor FastAPI com hot-reload
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

#### 3. Inicializar o Frontend (React + Vite):
Em outro terminal:
```bash
# Navegar até a pasta do frontend
cd "Projeto pi/frontend"

# Instalar dependências Node.js
npm install

# Iniciar o servidor de desenvolvimento Vite
npm run dev
```

O frontend estará disponível em `http://localhost:5173` consumindo o backend em `http://localhost:8000`.

---

## 🔗 Endereços de Acesso

| Serviço | URL | Descrição |
| :--- | :--- | :--- |
| **Aplicação Web (Frontend)** | [http://localhost](http://localhost) | Portal web completo através do Nginx Gateway (Porta 80) |
| **Documentação da API (Swagger)** | [http://localhost/docs](http://localhost/docs) | Painel OpenAPI interativo para teste de endpoints |
| **Porta Alternativa do Gateway** | [http://localhost:3000](http://localhost:3000) | Acesso secundário mapeado no Docker Compose |
| **Acesso Direto ao Backend** | [http://localhost:8000/docs](http://localhost:8000/docs) | Porta interna do FastAPI para depuração |

---

## 🔑 Credenciais de Demonstração

O banco de dados é auto-inicializado com o usuário administrador do sistema:

* **E-mail:** `admin@automatch.com`
* **Senha:** `admin123`

---

## 🌟 Principais Funcionalidades Implementadas

### 1. Autenticação Segura & Gestão de Usuários
* `POST /api/register`: Criação de conta com hash PBKDF2 e emissão de JWT.
* `POST /api/login`: Autenticação e emissão de sessão segura.
* `PUT /api/users/profile`: Atualização de dados cadastrais no PostgreSQL.

### 2. Catálogo Vitrine & Multi-Unidades
* `GET /api/cars`: Consulta de estoque persistido no banco com suporte a filtros de loja (`?store_id=`), marca, modelo e texto livre (`?q=`).
* `POST /api/cars`: Cadastro completo de veículos pelo vendedor com especificações técnicas e protocolo de anúncio.
* `GET /api/stores`: Listagem de concessionárias credenciadas (Euroville BMW, Stuttgart Porsche, Tesla Auto).

### 3. Dossiê de Transparência & Perícia Veicular
* `GET /api/v1/laudo-cautelar/{codigo_fipe}`: Consulta cotação oficial FIPE via BrasilAPI e consolida o laudo pericial (TrustScore, longarinas, espessura de pintura em micras e sinistros).
* `GET /api/detran/{placa}`: Auditoria cadastral de débitos de IPVA, multas, restrições financeiras e histórico de vistoria.
* `POST /api/v1/precificacao`: Motor **AutoPrice™** que calcula o preço justo de mercado baseado na FIPE, desgaste por quilometragem excedente e avarias.

### 4. Inteligência Artificial e Visão Computacional
* `POST /api/analise-visual`: Scanner visual com **Google Gemini 1.5 Flash**, analisando fotos da lataria com pré-compressão para respostas instantâneas.
* `POST /api/v1/laudos/upload`: Upload de laudos (PDF/JPG/PNG) com inferência síncrona/thread-pool do **YOLOv8** para detecção de componentes.
* `POST /api/chat`: Consultor de vendas e financiamento com contexto contextualizado (RAG) no automóvel em visualização.

### 5. Checkout e Reserva de Veículos
* `POST /api/checkout`: Registro e confirmação de reserva de veículos com sinal ou contratação de planos de assinatura, gerando protocolo oficial (`ATM-XXXXXX`).

### 6. Auditoria em Segundo Plano (APScheduler)
* Job periódico rodando a cada 60 segundos no backend, consultando a base do DETRAN para identificar novos débitos ou impedimentos em veículos sob monitoramento.
