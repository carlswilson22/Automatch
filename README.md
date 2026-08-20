# 🚗 AutoMatch — Plataforma Inteligente de Compra e Venda de Veículos

O **AutoMatch** é uma plataforma moderna e inteligente para o mercado automotivo. O grande diferencial do projeto é a integração com a **API do Google Gemini**, oferecendo aos usuários um assistente virtual capaz de analisar dados técnicos, tirar dúvidas sobre consumo, manutenção e fornecer insights reais sobre os veículos anunciados.

O projeto utiliza uma arquitetura robusta, totalmente conteinerizada com Docker, integrando um ecossistema Single Page Application (SPA) com um back-end de alta performance em Python.

---

## 🛠️ Stack Tecnológica

A estrutura do ecossistema foi dividida e organizada da seguinte forma:

* **Front-end:** React.js, Vite, JavaScript (executando na porta `5173` nativamente).
* **Back-end API:** Python (Uvicorn / FastAPI), estruturado dentro da pasta `/server` (porta `8000`).
* **Banco de Dados:** PostgreSQL 15 (Alpine) gerenciado via Docker.
* **Proxy/Gateway:** Nginx (Atua como proxy reverso unificando a aplicação na porta padrão `80`).
* **Orquestração:** Docker & Docker Compose.
* **Inteligência Artificial:** Google Gemini API, YoloV8 (Modelos `gemini-pro` / `gemini-1.5-flash`).

---

## 📁 Estrutura de Pastas de Scripts

O projeto conta com um gerenciamento centralizado na raiz para facilitar o desenvolvimento local sem Docker, delegando comandos para a subpasta do projeto principal:

* `npm run install-all` — Instala as dependências do projeto.
* `npm run dev` — Inicia o servidor de desenvolvimento do Front-end.
* `npm run server` — Inicia os serviços de API dedicados.

---

## 🚀 Como Executar o Projeto

Você pode rodar o AutoMatch localmente de duas formas: utilizando o ambiente Docker (recomendado) ou de forma nativa na sua máquina.

### Opção 1: Via Docker Compose (Recomendado e Completo)

Certifique-se de ter o **Docker** e o **Docker Compose** instalados na sua máquina.

1. Clone o repositório para a sua máquina:
   ```bash
   git clone [https://github.com/SEU_USUARIO/automatch.git](https://github.com/SEU_USUARIO/automatch.git)
   cd automatch
