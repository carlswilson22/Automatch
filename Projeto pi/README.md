# 🚗 Automatch - Plataforma Inteligente de Veículos

O **Automatch** é uma solução Fullstack moderna projetada para revolucionar a forma como usuários interagem com dados automotivos. A plataforma integra informações oficiais de mercado (como a Tabela FIPE via BrasilAPI) com um motor de simulação de Laudos Cautelares, entregando um ecossistema completo para análise de veículos.

## 🛠️ Tecnologias e Arquitetura

Este projeto foi construído utilizando uma arquitetura baseada em microsserviços, totalmente conteinerizada para garantir consistência entre os ambientes de desenvolvimento e produção.

* **Frontend:** React.js + Vite
* **Backend:** Python + FastAPI
* **Orquestração e Infraestrutura:** Docker, Docker Compose e Nginx (Gateway)
* **Integrações:** HTTPX para consumo assíncrono de APIs externas (BrasilAPI)

## 📂 Estrutura do Projeto

```text
ProjetoPI/
├── backend/        # API FastAPI, rotas híbridas e modelos de dados
├── frontend/       # Aplicação React SPA
├── gateway/        # Configurações de proxy reverso (Nginx)
├── docker-compose.yml
└── .env.example
```

## 🚀 Como Executar o Projeto Localmente

Tudo o que você precisa é ter o **Docker** e o **Docker Desktop** instalados na sua máquina. O projeto inteiro sobe com apenas um comando.

### 1. Clone o repositório:

```bash
git clone https://github.com/carlswilson22/ProjetoPI.git
cd ProjetoPI
```

### 2. Configure as variáveis de ambiente:

Crie um arquivo `.env` na raiz do projeto baseado no exemplo fornecido:

```bash
cp .env.example .env
```

### 3. Suba os containers:

```bash
docker-compose up -d --build
```

## 🔗 Acessando a Aplicação

Com os containers rodando, acesse os seguintes endereços no seu navegador:

| Serviço | URL |
|---|---|
| **Aplicação Web (Frontend)** | http://localhost |
| **Documentação da API (Swagger)** | http://localhost:8000/docs |

## 🧪 Destaque Técnico: API Híbrida de Laudo Cautelar

A plataforma conta com um endpoint avançado (`/api/v1/laudo-cautelar/{codigo_fipe}`) que realiza o cruzamento de dados em tempo real. Ele busca informações oficiais (Marca, Modelo, Ano, Valor) e injeta no motor interno para simular uma inspeção estrutural, histórico de leilão e numeração de chassi/motor, entregando um JSON consolidado para a interface.
