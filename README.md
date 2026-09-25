# 🚗 Automatch™ — Marketplace Automotivo & Perícia por IA

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8?logo=opencv&logoColor=white)](https://opencv.org/)

Plataforma automotiva Fullstack que une **marketplace de compra e venda de veículos**, **perícia veicular por IA (OpenCV + YOLOv8 + Gemini)**, **varredura 360° interativa**, **auditoria cadastral DETRAN/FIPE**, **emissão de laudos periciais em PDF com QR Code público** e **painel B2B para lojistas**.

---

## 📋 Informações do Projeto

* **Instituição:** Centro Universitário de Brasília (CEUB)
* **Curso:** Análise e Desenvolvimento de Sistemas (ADS)
* **Equipe:** Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio
* **Identificador:** `ADS-AUTOMATCH-2026`

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias |
| :--- | :--- |
| **Frontend** | React 18, Vite, TailwindCSS, Framer Motion, Lucide Icons, Canvas API |
| **Backend** | Python 3.11, FastAPI assíncrono, SQLAlchemy ORM, Pydantic v2, APScheduler |
| **Inteligência Artificial** | OpenCV (5 zonas anatômicas), Ultralytics YOLOv8, Google Gemini Vision |
| **Documentos & Mídia** | ReportLab (Laudo A4 vetorial), QRCode 300 DPI, Pillow |
| **Infraestrutura** | Docker Compose, PostgreSQL 15, Redis 7, Nginx Gateway |
| **Segurança** | JWT (RFC 7519), PBKDF2-HMAC-SHA256, Magic Bytes, OWASP A01 Access Control |

---

## 🌟 Principais Funcionalidades

1. **Perícia Visual 360° & Detecção de Avarias por IA:**
   - Varredura orbital do veículo em 8 ângulos contínuos.
   - Motor CV com análise adaptativa em 5 zonas anatômicas (Capô/Teto, Para-choque, Laterais e Traseira) medindo descontinuidades e custos estimados de reparo.
2. **Laudo Pericial Oficial com QR Code:**
   - Geração de laudo cautelar em PDF vetorial A4 de alta resolução via ReportLab.
   - QR Code que direciona para a validação pública digital sem exigência de login (`/validar/{protocolo}`).
3. **Comparador Técnico Multidimensional:**
   - Comparação simultânea de 2 a 3 veículos em 5 dimensões (FIPE vs Preço, KM/ano, Integridade de Laudo, Débitos DETRAN e Ficha Técnica).
4. **Calculadora TCO & Termômetro de Mercado:**
   - Custo Total de Posse mensal detalhado (IPVA proporcional por UF, seguro, combustível e depreciação) e indicador de dispersão frente à FIPE.
5. **Painel B2B do Lojista & Sincronização Multicanal:**
   - Gestão de estoque, valor imobilizado e publicação multicanal integrada com **AutoCerto DMS**, **AutoAvaliar** e **OLX Autos**.
6. **Segurança & Resiliência:**
   - Controle estrito de acesso na exclusão de veículos (OWASP A01).
   - Validação binária de Magic Bytes (JPEG, PNG e PDF) antes de alocar buffer de upload.
   - Compressão client-side em Canvas HTML5 eliminando estouro de memória no navegador.

---

## 🚀 Como Executar

### Pré-requisitos
* [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

### 1. Clonar e configurar
```bash
git clone https://github.com/carlswilson22/Automatch.git
cd Automatch
cp .env.example .env
```

### 2. Iniciar a aplicação
```bash
docker compose up -d --build
```

### 3. Acompanhar logs
```bash
docker compose logs -f
```

---

## 🌐 Portas & Acesso Local

| Serviço | Endereço | Descrição |
| :--- | :--- | :--- |
| **Aplicação Web (Gateway)** | `http://localhost` ou `http://localhost:5173` | Interface principal do Automatch |
| **API Docs (Swagger UI)** | `http://localhost:8000/docs` | Documentação interativa dos endpoints FastAPI |
| **OpenAPI Schema** | `http://localhost:8000/openapi.json` | Contrato OpenAPI da aplicação |
| **PostgreSQL** | `localhost:5432` (`db: automatch`) | Banco relacional |
| **Cache Redis** | `localhost:6379` | Cache de cotações e sessões |

---

## 🔑 Credenciais Padrão (Ambiente de Demonstração)

* **E-mail:** `admin@automatch.com`
* **Senha:** `admin123`

---

## 🧪 Testes Automatizados

Para executar a suíte completa de testes de integração (visão pericial, ciclo de anúncios, laudos e integrações):
```bash
docker compose exec backend python test_vision_and_delete.py
```
*Status esperado:* **100% de aprovação (10/10 testes)**.

---

## 📚 Documentação Complementar

* [BACKLOG.md](BACKLOG.md) — Backlog de requisitos e histórias de usuário (US).
* [CHANGELOG.md](CHANGELOG.md) — Histórico cronológico de versões e entregas.
* [docs/requisitos.md](docs/requisitos.md) — Matriz de requisitos funcionais e não-funcionais.
* [docs/arquitetura.md](docs/arquitetura.md) — Decisões técnicas e arquitetura do ecossistema.

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos e de demonstração tecnológica no CEUB. Todos os direitos reservados à equipe **Automatch**.
