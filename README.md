# 🚗 Automatch™ — Marketplace Automotivo Inteligente & Perícia Multidimensional por IA

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8?logo=opencv&logoColor=white)](https://opencv.org/)

O **Automatch** é um ecossistema digital automotivo Fullstack de alto padrão projetado para transformar a compra, venda e auditoria pericial de veículos seminovos e usados no Brasil. A plataforma combina **visão computacional pericial**, **varredura 360° interativa**, **auditoria por IA de laudos em PDF**, **emissão de laudos periciais vetoriais A4 com QR Code**, **comparador técnico multidimensional em 5 dimensões**, **recuperação de senha segura via OTP**, **catálogo escalável com paginação no servidor**, **cruzamento cadastral em tempo real (DETRAN e Tabela FIPE)**, **central de favoritos**, **simulador de financiamento bancário multi-bancos** e **hub B2B de gestão de estoque e exportação multicanal homologado com AutoCerto DMS, AutoAvaliar e OLX Autos**.

---

## 📋 Identificação Institucional

| Campo | Informação |
| :--- | :--- |
| **Instituição** | CEUB — Centro Universitário de Brasília |
| **Curso** | Análise e Desenvolvimento de Sistemas (ADS) |
| **Organização no GitHub** | [CampusCEUB](https://github.com/CAMPUSCEUB) |
| **Repositório Oficial** | [Automatch](https://github.com/carlswilson22/Automatch.git) |
| **Equipe** | Carlos Wilson, Matheus, Paulo Arthur e Vinicius Aurelio |
| **ID do Projeto** | ADS-AUTOMATCH-2026 |

---

## 🛠️ Tecnologias e Arquitetura

O sistema adota uma arquitetura conteinerizada em microsserviços com isolamento de rede, orquestrada por um **API Gateway centralizado (Nginx)**:

* **Frontend:** React 18, Vite, Framer Motion, Lucide Icons, Tailwind CSS e Web Audio DSP.
* **Backend:** Python 3.11, FastAPI assíncrono com Lifespan Context Manager, SQLAlchemy ORM e Pydantic v2.
* **Banco de Dados:** PostgreSQL 15 (persistência relacional) e Redis 7 (cache de consultas e sessões).
* **Segurança & Criptografia:**
  * Whitelist de CORS explícita por variável de ambiente (`ALLOWED_ORIGINS`).
  * Autenticação stateless com **JWT (RFC 7519)** assinado via HMAC-SHA256 com proteção estrita em rotas de perfil (`update_profile`).
  * Hash seguro de senhas com **PBKDF2-HMAC-SHA256** (100.000 iterações com salt aleatório).
  * Recuperação de senha via **OTP de 6 dígitos** com hash SHA-256 e rate limiting estrito.
* **Hub Pericial & Inteligência Artificial:**
  * **Ultralytics YOLOv8 & OpenCV:** Detecção de classes veiculares, contornos e amassados, com *pre-warm* assíncrono no startup.
  * **Google Gemini 1.5 Flash Vision:** Scanner pericial visual e auditoria documental de laudos, com paralelização via `asyncio.gather`, timeout de 6s e exponential backoff em 503.
  * **Varredura 360° Interativa:** Inspeção orbital contínua em 8 quadrantes com mapeamento tridimensional de avarias.
  * **Auditoria de Laudos Cautelares:** Validação de integridade por Magic Bytes (`%PDF-`) antes da alocação de memória.
* **Geração de Documentos Oficiais:**
  * **ReportLab Engine:** Emissão de laudos cautelares em PDF vetorial A4 de alta resolução.
  * **QR Code Oficial de Autenticidade:** Geração em 300 DPI (`qrcode` + PIL) apontando para a página pública de autenticidade (`/validar/{protocolo}`).
* **Agendador em Background (APScheduler):** Monitoramento assíncrono periódico a cada 60s com tratamento de logs otimizado e shutdown seguro.
* **Comparador Multidimensional:** Análise técnica simultânea de 2 a 3 veículos em 5 dimensões objetivas.
* **Painel B2B para Lojistas:** Gestão de estoque, valor imobilizado, margens e sincronização multicanal homologada com **AutoCerto DMS**, **AutoAvaliar** e **OLX Autos**.
* **Financiamento Bancário:** Simulador transparente integrado às taxas homologadas (Itaú Auto, Santander Auto e BV Financeira), permitindo negociação direta de seminovos como entrada.

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
│   ├── requisitos.md               # Matriz de requisitos funcionais e não funcionais
│   ├── arquitetura.md              # Visão arquitetural, modelos de dados e decisões técnicas (ADRs)
│   ├── decisoes/                   # Registro formal de decisões arquiteturais (ADR-01 a ADR-07)
│   └── reunioes/                   # Atas de alinhamento e saúde do sistema
├── backend/                        # Microsserviço de API (FastAPI / Python 3.11)
│   ├── main.py                     # Entrypoint com lifespan, CORS explícito e pre-warm do YOLO
│   ├── models.py                   # Modelos relacionais (Car, Store, User, PasswordResetToken, etc.)
│   ├── schemas.py                  # Schemas Pydantic v2 com validação estrita de dados
│   ├── security.py                 # PBKDF2, criação/validação de tokens JWT e suporte a dotenv
│   ├── tasks.py                    # Agendador APScheduler para auditorias em background
│   ├── database.py                 # Pool de conexão SQLAlchemy e inicialização de banco
│   ├── seed.py                     # Carga inicial de concessionárias e catálogo de veículos
│   ├── test_vision_and_delete.py   # Suíte de testes automatizados de integração
│   ├── requirements.txt            # Dependências Python (FastAPI, ReportLab, qrcode, PyPDF2, etc.)
│   ├── Dockerfile                  # Imagem conteinerizada do Backend
│   ├── routers/                    # Endpoints modularizados:
│   │   ├── auth.py                 # Autenticação, perfil protegido e recuperação via OTP
│   │   ├── cars.py                 # Catálogo paginado no servidor com filtros combinados e ilike
│   │   ├── detran.py               # Auditoria de débitos e restrições (RENAJUD)
│   │   ├── ai_vision.py            # Endpoints do Hub Pericial de IA e Varredura 360°
│   │   ├── uploads.py              # Upload com validação de magic bytes de PDF
│   │   ├── alerts.py               # Radar de oportunidades e alertas de queda de preço
│   │   ├── integrations.py         # Sincronizador multicanal (AutoCerto, AutoAvaliar, OLX Autos)
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
│       ├── contexts/               # AuthContext (inicialização em modo visitante)
│       ├── pages/                  # Telas ativas:
│       │   ├── Home.jsx            # Landing page institucional
│       │   ├── ShowcaseCatalog.jsx # Catálogo com paginação no servidor e lazy loading
│       │   ├── ShowcaseVehicleDetails.jsx # Detalhes do veículo, varredura 360°, laudo e financiamento
│       │   ├── FavoritesPage.jsx   # Central de veículos favoritados com comparador multidimensional
│       │   ├── PublicValidationPage.jsx # Validador público de laudo via protocolo/QR Code
│       │   ├── AuthPage.jsx        # Login, cadastro por perfil e modal OTP de recuperação
│       │   ├── NewCarAdForm.jsx    # Cadastro de anúncio com auditoria de laudo por IA
│       │   ├── Dashboard.jsx       # Painel B2B do lojista (gestão de estoque, valor imobilizado e canais)
│       │   └── ...
│       ├── components/             # Componentes modulares e reutilizáveis:
│       │   ├── vehicle/            # Vehicle360Viewer, VehicleComparatorModal, MultichannelSyncModal, etc.
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
# Logs unificados de todos os microsserviços
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
O projeto conta com testes de integração cobrindo visão computacional, ciclo de exclusão de anúncios, diagnóstico acústico, scanner de pneus, visão 360°, geração de PDF com QR Code, radar de alertas e integrações multicanal:
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

## 🌐 Mapeamento de Portas & Endereços de Execução Local

> [!NOTE]
> Os endereços listados abaixo são pontos de comunicação local (**localhost**). Eles são ativados no seu computador assim que os microsserviços são inicializados no terminal através do comando:
> ```bash
> docker compose up -d
> ```

| Microsserviço / Camada | Porta Exposta | Endereço Local (Copiar) | Protocolo | Finalidade & Rota |
| :--- | :---: | :--- | :---: | :--- |
| **Gateway Central (Nginx)** | `80` | `http://localhost` | HTTP | Ponto de entrada de produção: entrega o frontend e roteia `/api/*` para a API |
| **Gateway Secundário (Nginx)** | `3000` | `http://localhost:3000` | HTTP | Acesso alternativo espelhado para testes locais de concorrência |
| **Frontend SPA (Vite)** | `5173` | `http://localhost:5173` | HTTP / WS | Servidor de desenvolvimento com *Hot Module Replacement* (HMR) |
| **Backend API (FastAPI)** | `8000` | `http://localhost:8000/docs` | HTTP / REST | Painel interativo Swagger UI para inspeção e testes diretos de endpoints |
| **OpenAPI Specification** | `8000` | `http://localhost:8000/openapi.json` | HTTP / JSON | Contrato JSON da API para geração de SDKs e automações |
| **Banco de Dados (PostgreSQL)** | `5432` | `localhost:5432` *(db: automatch)* | TCP / SQL | Conexão para ferramentas de banco (DBeaver, pgAdmin, VS Code ou `psql`) |
| **Cache em Memória (Redis)** | `6379` | `localhost:6379` | TCP | Armazenamento temporário de cotações FIPE e controle de sessões |

### ⚡ Comandos Rápidos de Ciclo de Vida:
```bash
# Iniciar todos os 5 microsserviços em segundo plano
docker compose up -d

# Verificar se todos os containers estão ativos (status "Up")
docker compose ps

# Desligar todos os serviços e liberar as portas do computador
docker compose down
```

---

## 🔑 Credenciais de Demonstração

O banco de dados é inicializado automaticamente com o usuário administrador padrão:

* **E-mail:** `admin@automatch.com`
* **Senha:** `admin123`

---

## 🌟 Detalhamento das Principais Funcionalidades

### 1. Varredura 360° Interativa (`POST /api/analise-360`)
* **Rotação Orbital Fluida:** Componente `Vehicle360Viewer.jsx` permitindo ao usuário girar o veículo em 8 quadrantes angulares contínuos (0° a 315°) via toque, mouse ou arraste com aceleração por hardware.
* **Mapeamento Tridimensional de Avarias:** Cada avaria detectada pelo modelo de IA é vinculada ao ângulo correspondente e renderizada como um *hotspot* interativo com coordenadas $(X, Y)$ na lataria.
* **Badge Dinâmico de Integridade:** Quando nenhuma avaria é detectada, exibe o selo **"Carroceria 100% Íntegra"** em verde esmeralda. Ao detectar avarias, detalha a peça afetada, o tipo de dano (risco, mossa, desalinhamento) e o orçamento estimado de reparo.
* **Resolução de Gargalo:** O endpoint foi otimizado para responder em milissegundos com ordenação polar dos ângulos e fallback estruturado caso a imagem do quadrante esteja ausente.

### 2. Geração de Documentos Oficiais & Validador com QR Code
* **Emissão de Laudo em PDF Vetorial A4 (`GET /api/v1/laudos/{car_id}/pdf`):** Relatório pericial completo gerado com a biblioteca **ReportLab**, estruturado em grade tipográfica profissional A4 com selo de autenticidade, resumo pericial em 4 pilares (Estrutura, Pintura/Lataria, Histórico DETRAN e FIPE) e termos de conformidade.
* **QR Code Oficial em Alta Resolução (300 DPI):** Gerado via `qrcode` + PIL e estampado no cabeçalho do documento oficial.
* **Página Pública de Validação (`/validar/{protocolo}`):** Ao escanear o QR Code pelo smartphone, o comprador é direcionado ao validador público (`GET /api/v1/laudos/validar/{protocolo}`), que valida a assinatura digital, número de protocolo e integridade dos dados cadastrais sem exigir login prévio.
* **Auditoria de Laudos por IA:** Upload de laudos em PDF pelo vendedor com verificação obrigatória de integridade de *Magic Bytes* (`%PDF-`) prevenindo estouro de buffer e injeção de binários maliciosos.

### 3. Agendador em Background (APScheduler)
* **Auditoria Periódica Assíncrona (`backend/tasks.py`):** Monitoramento contínuo em ciclos de 60 segundos de veículos marcados na watchlist do DETRAN e verificação de alertas de preço salvos pelos usuários.
* **Resolução de Gargalo de Log:** Foi corrigido o problema de poluição contínua de logs no console/arquivo. Quando a watchlist está vazia, o agendador registra as verificações apenas em nível `DEBUG`, mantendo os logs de produção limpos e evitando consumo desnecessário de I/O em disco.
* **Ciclo de Vida Limpo (FastAPI Lifespan):** Inicialização no startup com `start_scheduler()` e encerramento gracioso com `shutdown_scheduler(wait=False)`, garantindo liberação imediata de recursos no encerramento da aplicação.

### 4. Comparador Multidimensional (5 Dimensões Técnicas)
* **Comparação Simultânea na Central de Favoritos (`/favoritos`):** O usuário pode selecionar de 2 a 3 veículos curtidos e abrir o `VehicleComparatorModal.jsx` para uma auditoria comparativa lado a lado.
* **5 Dimensões Técnicas e Objetivas:**
  1. **Tabela FIPE vs Preço Anunciado:** Diferença monetária em R$ e percentual real de desconto/ágio frente à referência oficial de mercado.
  2. **Quilometragem Média Anual (KM/ano):** Desgaste real calculado pela divisão da quilometragem total pela idade do carro (comparado à média nacional de 15.000 km/ano).
  3. **Laudo Cautelar & Integridade Estrutural:** Status do laudo de integridade de monobloco, longarinas e espessura de tinta.
  4. **Auditoria Cadastral DETRAN:** Situação de débitos, multas e existência de bloqueios judiciais (RENAJUD).
  5. **Ficha Técnica & Motorização:** Comparação direta de combustível, câmbio, potência e carroceria.

### 5. Painel B2B para Lojistas e Concessionárias (`/dashboard`)
* **Público-Alvo e Finalidade:** A aba de Painel B2B foi concebida especificamente para lojistas, revendedores e gerentes de concessionárias gerenciarem suas operações com agilidade.
* **Gestão Centralizada de Estoque:** Visualização instantânea de todos os veículos cadastrados no pátio da loja com status de publicação, fotos e preço.
* **Métricas Financeiras em Tempo Real:**
  * **Valor Imobilizado Total:** Soma do capital investido em estoque ativo.
  * **Margem Bruta Projetada:** Estimativa de rentabilidade calculada entre o valor de entrada e o preço de venda de cada unidade.
* **Hub de Sincronização Multicanal:** Publicação em lote do estoque com 1 clique para os canais de venda integrados.
* **Feed XML Padronizado:** Exportação automatizada para sistemas DMS externos (`/api/integrations/autocerto/feed.xml` e `/api/integrations/feed.xml`).
* **Funil de Conversão:** Acompanhamento de cliques, veículos mais visualizados e propostas recebidas.

### 6. Homologação Oficial de Canais B2B (AutoAvaliar, AutoCerto e OLX)
* **Substituição de Webmotors por AutoAvaliar:** O canal Webmotors foi formalmente substituído por **AutoAvaliar** em todo o ecossistema (backend, rotas, schemas Pydantic e interface visual).
* **Os 3 Canais Homologados Oficiais:**
  1. **AutoCerto DMS:** Integração nativa de inventário em XML para gestão de concessionárias.
  2. **AutoAvaliar:** Plataforma líder de avaliação e repasse B2B no Brasil, integrada para precificação e giro de estoque.
  3. **OLX Autos:** Maior portal de classificados automotivos do país com publicação automatizada de anúncios.

### 7. Simulador de Financiamento Bancário (Sem Troca com Troco)
* **Foco em Transparência Financeira:** A modalidade de "Troca com Troco" foi completamente removida do backend e da interface, visto que a aceitação e precificação de carros usados como parte do pagamento é uma negociação que deve ser tratada diretamente e de forma personalizada entre vendedor e comprador pelo chat/WhatsApp.
* **Simulador de Crédito Multi-Bancos:** O componente `TradeInSimulator.jsx` opera exclusivamente como simulador de financiamento bancário, exibindo propostas e taxas reais de instituições parceiras:
  * **Itaú Auto:** 1,42% a.m. (Menor taxa de mercado)
  * **Santander Auto:** 1,45% a.m. (Aprovação ágil)
  * **BV Financeira:** 1,49% a.m. (Entrada facilitada)
* **Controles Interativos:** Ajuste dinâmico de valor de entrada (com atalhos rápidos de 20%, 30% e 50%) e prazos flexíveis de 12x a 60x meses com valor estimado de parcela em destaque.

### 8. Catálogo com Paginação no Servidor & Central de Favoritos
* **Paginação com Envelope Seguro (`GET /api/cars`):** Navegação com `offset` e `limit`, busca `ilike` e filtros combinados.
* **Skeleton Loaders e Acessibilidade:** Carregamento suave com `CatalogSkeleton` e rótulos `aria-label` completos.
* **Favoritos em Tempo Real:** Sincronização automática via `favoritesManager` e navegação limpa sem saltos de rolagem (`ScrollToTop`).

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

Para detalhes técnicos e históricos das decisões de engenharia, consulte:

* [docs/requisitos.md](docs/requisitos.md) — Matriz de Requisitos Funcionais e Não Funcionais.
* [docs/arquitetura.md](docs/arquitetura.md) — Diagramas arquiteturais, modelos relacionais e fluxos de dados.
* [docs/decisoes/](docs/decisoes/) — Registro formal de Decisões Arquiteturais (ADRs).
* [docs/reunioes/](docs/reunioes/) — Atas e alinhamentos de governança do sistema.
* [BACKLOG.md](BACKLOG.md) — Histórias de usuário e critérios de aceitação.

---

## 📄 Licença

Este projeto é desenvolvido para fins educacionais e de demonstração tecnológica no âmbito do curso de Análise e Desenvolvimento de Sistemas (ADS) do CEUB. Todos os direitos reservados à equipe **Automatch**.
