# 🚗 Automatch™ - Plataforma Inteligente de Marketplace, Vistorias Periciais & IA

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8?logo=opencv&logoColor=white)](https://opencv.org/)

O **Automatch** é um ecossistema digital automotivo Fullstack de alto padrão projetado para transformar a compra, venda e auditoria de veículos seminovos e usados no Brasil. A plataforma combina **visão computacional pericial**, **varredura 360° interativa** e **cruzamento cadastral em tempo real (DETRAN e Tabela FIPE)**.

---

## 🛠️ Tecnologias e Arquitetura

O sistema adota uma arquitetura conteinerizada em microsserviços com isolamento de rede orquestrada por um **API Gateway centralizado (Nginx)**:

* **Frontend:** React 18, Vite, Framer Motion, Lucide Icons e Tailwind CSS.
* **Backend:** Python 3.11, FastAPI assíncrono, SQLAlchemy ORM e Pydantic v2.
* **Banco de Dados:** PostgreSQL 15 (persistência relacional) e Redis 7 (cache de placas e sessões).
* **Segurança & Criptografia:** Hash seguro de senhas com **PBKDF2-HMAC-SHA256** (salt aleatório) e autenticação stateless com **JWT (RFC 7519)** assinado via HMAC-SHA256.
* **Hub Pericial IA Multidimensional:**
  * **Ultralytics YOLOv8 & OpenCV:** Detecção de classes veiculares, contornos e deformidades de lataria.
  * **Google Gemini 1.5 Flash Vision:** Scanner pericial visual com pré-compressão e Chatbot Consultivo (RAG).
* **Agendador em Background:** APScheduler para auditoria periódica (a cada 60s) de veículos na Watchlist DETRAN.
* **Gateway & Infraestrutura:** Docker Compose unificando portas e rotas com Nginx Reverse Proxy.

---

## 📂 Estrutura do Repositório

```text
Automatch/
├── docker-compose.yml              # Orquestração dos 5 containers (db, redis, backend, frontend, gateway)
├── .env.example                    # Template de variáveis de ambiente
├── .gitignore                      # Regras de exclusão Git padronizadas
├── README.md                       # Documentação principal e guia do projeto                      
├── backend/                        # Microsserviço de API (FastAPI / Python 3.11)
│   ├── main.py                     # Entrypoint da aplicação, ciclo de vida e rotas
│   ├── models.py                   # Modelos relacionais SQLAlchemy (Store, Car, User, etc.)
│   ├── schemas.py                  # Schemas Pydantic v2 de validação e serialização
│   ├── security.py                 # Hash PBKDF2 e geração/validação de tokens JWT
│   ├── tasks.py                    # Agendador periódico APScheduler para DETRAN Watchlist
│   ├── database.py                 # Pool e engine de conexão ao PostgreSQL
│   ├── seed.py                     # Carga inicial de concessionárias e estoque
│   ├── test_vision_and_delete.py   # Suíte de testes automatizados (7/7 testes de integração)
│   ├── requirements.txt            # Dependências Python gerenciadas
│   ├── Dockerfile                  # Imagem conteinerizada do Backend
│   ├── alembic/                    # Migrações versionadas do banco de dados
│   ├── routers/                    # Endpoints modularizados (auth, cars, detran, ai_vision, uploads)
│   └── services/                   # Motores de IA (ai_service com 360 e pricing_service)
├── frontend/                       # Aplicação Web SPA (React 18 / Vite / Tailwind)
│   ├── package.json                # Dependências Node.js
│   ├── vite.config.js              # Configuração do Vite e plugins
│   ├── Dockerfile                  # Imagem conteinerizada do Frontend
│   ├── public/images/              # Acervo estático de fotos dos veículos
│   └── src/
│       ├── contexts/               # AuthContext para gestão de sessão e autenticação
│       ├── pages/                  # Telas ativas (Home, ShowcaseCatalog, ShowcaseVehicleDetails, etc.)
│       ├── components/             # Componentes modulares
│       │   ├── vehicle/            # Vehicle360Viewer, etc.
│       │   ├── ui/                 # Componentes visuais, modais e seletores
│       │   └── layout/             # Navbar unificada e Footer
│       └── data/                   # Gerenciadores de estoque, plansData e mocks oficiais
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

#### 2. Configurar variáveis de ambiente (opcional):
Copie o template `.env.example` para `.env`:
```bash
cp .env.example .env
```
Variáveis principais:
```env
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
O projeto conta com testes de integração cobrindo visão computacional, ciclo de exclusão de anúncios, visão 360°, simulador Troca com Troco, radar de alertas e integrações multicanal:
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
* **Scanner de Carroceria HD:** Mapeamento de riscos e amassados com pins (X, Y), classificação de gravidade e custo de reparo em R$.
* **Varredura 360° Interativa (`POST /api/analise-360`):** Controle contínuo de rotação por arraste ou giro automático com distribuição de avarias em 8 quadrantes angulares.

### 2. Vitrine, Preço FIPE & Dossiê de Transparência
* **Catálogo Multifacetado:** Busca com filtros por marca, modelo, ano, faixa de preço, transmissão e combustível.
* **Preço de Referência FIPE:** Comparativo transparente estilo Webmotors/OLX exibindo valor anunciado, tabela FIPE e cálculo de economia.
* **Auditoria DETRAN (`GET /api/detran/{placa}`):** Levantamento de multas, débitos de IPVA, licenciamento e restrições judiciais (RENAJUD).

### 3. Gestão e Ciclo de Vida dos Anúncios
* **Publicação com Validação IA:** Cadastro intuitivo com pré-análise pericial automática das fotos enviadas.
* **Exclusão Segura (`DELETE /api/cars/{id}`):** Exclusão atômica em banco de dados e expurgo de cache com confirmação no frontend.
* **Identificação Multi-Lojas (`GET /api/stores`):** Separação visual de concessionárias e revendas parceiras com telefones e endereços.

### 4. Comunicação & Autenticação
* **Consultor Virtual IA (RAG / Gemini):** Assistente contextualizado nos dados do automóvel visualizado.
* **Negociação Direta:** Chat em tempo real com o vendedor e integração para contato via WhatsApp.
* **Login/Cadastro Unificado:** Modal centralizado no cabeçalho com autenticação criptografada BCrypt e tokens JWT.

### 5. Negociação Avançada & Fintech Automotiva
* **Simulador 'Troca com Troco' (`POST /api/troca-com-troco`):** Avaliação instantânea do veículo usado do comprador via placa/modelo/km. Calcula se o comprador tem troco a receber em dinheiro via Pix ou saldo a financiar, integrando simulador multi-bancos com Itaú, Santander e BV Financeira.
* **Radar de Oportunidades & Alerta de Queda de Preço (`POST /api/alerts`):** Ativação de alertas inteligentes por veículo com notificações via WhatsApp, E-mail ou WebPush.

### 6. Integrações B2B & Exportação Multicanal
* **Sincronizador Multicanal de Estoque (`GET/POST /api/integrations`):** Hub de integração B2B que sincroniza anúncios em 1 clique para Webmotors, OLX Autos, iCarros e Mercado Livre Veículos.
* **Feed XML Automotivo (`GET /api/integrations/feed.xml`):** Exportação padronizada compatível com os principais agregadores automotivos.

---

## 🧪 Comandos Úteis do Docker

```bash
# Reiniciar todos os containers
docker compose restart

# Rodar a suíte completa de testes de integração
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
