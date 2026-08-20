# 🚗 Automatch — Plataforma Inteligente de Compra e Venda de Veículos

<div align="center">

![Automatch Banner](https://img.shields.io/badge/Automatch-Plataforma%20Automotiva%20Inteligente-blue?style=for-the-badge&logo=car&logoColor=white)

[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=flat-square&logo=vite)](https://vitejs.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-009688?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![Gemini AI](https://img.shields.io/badge/Google%20Gemini-AI-4285F4?style=flat-square&logo=google)](https://ai.google.dev/)

</div>

---

## 📖 Sobre o Projeto

O **Automatch** é uma plataforma full-stack moderna para o mercado automotivo brasileiro, focada em **transparência e confiança** na compra e venda de veículos seminovos.

### ✨ Diferenciais

| Funcionalidade | Descrição |
|---|---|
| 🤖 **IA Damage Scanner** | Análise pericial automatizada da lataria via Google Gemini Vision |
| 🛡️ **TrustScore™** | Índice de transparência 0–100 baseado em laudo, histórico e débitos |
| 📋 **Dossiê de Procedência** | Timeline de histórico completo: laudo cautelar, leilão, multas |
| 💳 **Checkout Integrado** | Reserva de veículo com sinal online via PIX, Cartão ou Boleto |
| 🏪 **Painel B2B** | Dashboard para lojistas e concessionárias com gestão de estoque |
| 💰 **Simulador de Financiamento** | Cálculo de parcelas em tempo real com taxa a partir de 1,49% a.m. |

---

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** com hooks modernos e Context API
- **Vite 5** — build ultrarrápido com HMR
- **TailwindCSS** — design system utilitário
- **Framer Motion** — animações e transições fluidas
- **React Router v6** — roteamento SPA

### Backend
- **FastAPI** (Python) — API REST assíncrona de alta performance
- **SQLAlchemy** — ORM com migrations e seed de dados
- **PostgreSQL 15** — banco de dados relacional
- **Pydantic v2** — validação de schemas

### Inteligência Artificial
- **Google Gemini 1.5 Flash** — Chat consultivo e análise visual de veículos

---

## 📁 Estrutura do Projeto

```
ProjetoPI/
├── 📄 .env.example          # Template de variáveis de ambiente
├── 📄 .gitignore            # Regras de segurança Git
├── 📄 README.md
│
├── 🌐 frontend/             # React 18 + Vite + TailwindCSS
│   ├── src/
│   │   ├── components/      # TrustScore, Timeline, DamageScanner, Chat IA
│   │   ├── contexts/        # AuthContext (autenticação global)
│   │   ├── data/            # Mock data, inventário, newCarsManager
│   │   └── pages/           # Home, Vitrine, Checkout, Planos, Dashboard...
│   └── public/images/       # Fotos dos veículos
│
└── ⚙️ backend/              # FastAPI + SQLAlchemy + PostgreSQL
    ├── main.py              # Rotas e endpoints REST
    ├── models.py            # Modelos ORM (Store, Car, User)
    ├── schemas.py           # Validação Pydantic
    ├── database.py          # Conexão com o banco de dados
    ├── seed.py              # Dados iniciais para desenvolvimento
    └── requirements.txt     # Dependências Python
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- **Node.js** 18+ e **npm**
- **Python** 3.11+
- **PostgreSQL** 15+ (ou acesso a uma instância)

### 1. Clone o repositório
```bash
git clone https://github.com/carlswilson22/ProjetoPI.git
cd ProjetoPI
```

### 2. Configure as variáveis de ambiente
```bash
cp .env.example .env
# Edite .env com suas credenciais reais (banco de dados, chave Gemini, etc.)
```

### 3. Inicialize o Backend (FastAPI)
```bash
cd backend
pip install -r requirements.txt
python migrate.py       # Cria as tabelas no banco de dados
python seed.py          # Popula dados iniciais
uvicorn main:app --reload --port 8000
```

### 4. Inicialize o Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev             # Disponível em http://localhost:5173
```

---

## 🔐 Variáveis de Ambiente

Consulte o arquivo [`.env.example`](./.env.example) para ver todas as variáveis necessárias.

As principais são:

```env
DATABASE_URL=postgresql://usuario:senha@localhost:5432/automatch
GEMINI_API_KEY=sua_chave_gemini_aqui
JWT_SECRET=seu_jwt_secret_aqui
VITE_API_BASE_URL=http://localhost:3000/api
```

> ⚠️ **Nunca** envie o arquivo `.env` preenchido para o repositório. Ele está bloqueado pelo `.gitignore`.

---

## 📄 Licença

Este projeto foi desenvolvido como **Projeto Integrador** para fins acadêmicos.

---

<div align="center">
  <sub>Desenvolvido com ❤️ pela equipe <strong>Automatch</strong></sub>
</div>
