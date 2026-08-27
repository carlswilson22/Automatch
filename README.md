# 🚗 Automatch - Plataforma Inteligente de Veículos

O **Automatch** é uma solução Fullstack moderna projetada para revolucionar a forma como usuários interagem com dados automotivos. A plataforma integra informações oficiais de mercado (como a Tabela FIPE via BrasilAPI) com um motor de simulação de Laudos Cautelares, entregando um ecossistema completo para análise de veículos.

## 🛠️ Tecnologias e Arquitetura

Este projeto foi construído utilizando uma arquitetura baseada em microsserviços, totalmente conteinerizada para garantir consistência entre os ambientes de desenvolvimento e produção.

* **Frontend:** React.js + Vite
* **Backend:** Python + FastAPI (com suporte a Multipart para uploads e persistência local)
* **Inteligência Artificial:** YOLOv8 (Ultralytics) para Visão Computacional e Google Gemini 1.5 Flash
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

## 🧪 Destaques Técnicos

### API Híbrida de Laudo Cautelar
A plataforma conta com um endpoint avançado (`/api/v1/laudo-cautelar/{codigo_fipe}`) que realiza o cruzamento de dados em tempo real. Ele busca informações oficiais (Marca, Modelo, Ano, Valor) e injeta no motor interno para simular uma inspeção estrutural, histórico de leilão e numeração de chassi/motor, entregando um JSON consolidado para a interface.

### 🧠 Pipeline de IA e Visão Computacional
A plataforma agora possui:

- **Upload Seguro de Documentos:** Suporte nativo para envio e armazenamento estruturado de Laudos Cautelares.
- **Feedback em Tempo Real (YOLOv8):** Motor de inferência local acoplado à esteira de upload que realiza análise de imagens para detecção de avarias ou validação de documentos de forma instantânea.
- **Análise Generativa de Alta Velocidade:** Uso do Gemini 1.5 Flash para varredura semântica leve e rápida do contexto veicular.
