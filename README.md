# Automatch™ — Marketplace Automotivo Inteligente & Perícia Multidimensional por IA

Repositório institucional de Projeto Integrador criado a partir do template do CEUB.

> **Professor(a):** Leia as DIRETRIZES INSTITUCIONAIS constantes no repositório [DIRETRIZES](https://github.com/CAMPUSCEUB/DIRETRIZES), em especial o [Guia dos Professores](https://github.com/CAMPUSCEUB/DIRETRIZES/guias/github-enterprise-campus-ceub.md) e o [checklist do GitHub Enterprise](https://github.com/CAMPUSCEUB/DIRETRIZES/guias/github-enterprise-campus-ceub.md).
>
> **Estudante:** Consulte os guias de desenvolvimento e documentação técnica em [docs/](docs/).

---

## Identificação do repositório 

| Campo | Informação |
| :--- | :--- |
| **Instituição** | CEUB — Centro Universitário de Brasília |
| **Curso** | Análise e Desenvolvimento de Sistemas (ADS) |
| **Organização no GitHub** | [CampusCEUB](https://github.com/CAMPUSCEUB) |
| **Repositório Oficial** | [ADS-AUTOMATCH](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH) |
| **Professor(a) Orientador(a)** | Prof. Valdemir dos Santos |
| **Equipe** | Carlos Wilson e Equipe Automatch |
| **ID do Projeto** | ADS-AUTOMATCH-2024 |

---

## Problema

O mercado brasileiro de compra e venda de veículos seminovos e usados movimenta milhões de transações anuais, porém sofre historicamente com assimetria de informações e desconfiança mútua:
1. **Dificuldade na Perícia Visual**: Fotos de baixa resolução ou ângulos propositalmente ocultados disfarçam avarias na lataria e deformidades estruturais.
2. **Falta de Informações Mecânicas**: O comprador comum não tem capacidade de avaliar a saúde mecânica do motor, ruídos anômalos de tuchos/válvulas ou o desgaste real dos pneus.
3. **Golpes e Insegurança**: O "golpe do intermediário" e divergências entre preço anunciado e valor real de mercado criam insegurança financeira.
4. **Desconexão B2B**: Lojistas enfrentam burocracia para sincronizar e atualizar seus estoques simultaneamente nos principais portais (Webmotors, OLX, iCarros, Mercado Livre).

---

## Solução Proposta

O **Automatch** é um ecossistema digital Fullstack de alta tecnologia que integra **Visão Computacional**, **Processamento Digital de Sinais de Áudio (DSP)**, **Machine Learning** e **integrações cadastrais em tempo real (DETRAN e Tabela FIPE)**:
- **Hub Pericial Multidimensional de IA**:
  - *Scanner de Carroceria HD*: Detecção de avarias estruturais com coordenadas (X, Y) e custo de reparo em R$ via YOLOv8, OpenCV e Gemini Vision.
  - *Varredura 360° Interativa*: Rotação contínua 360° por arraste com mapeamento de hotspots por quadrante angular.
  - *Diagnóstico Acústico do Motor*: Análise espectral de marcha lenta (~820 RPM / 27.3 Hz), checklist de tuchos/correias e sintetizador de som via Web Audio API.
  - *Tread Depth Scanner de Pneus*: Medição de sulco em milímetros com régua colorida e conformidade com a Resolução 558/80 do CONTRAN.
- **Fintech & Negociação**:
  - *Simulador "Troca com Troco"*: Avalia o seminovo do cliente e calcula troco em dinheiro via Pix ou parcelamento da diferença em multi-bancos (Itaú, Santander, BV).
  - *Negociação Direta ("Falar com Vendedor")*: Contato direto via chat interno e WhatsApp sem taxas de reserva online.
  - *Radar de Oportunidades & Favoritos*: Alertas de queda de preço e central de favoritos (`/favoritos`).
- **Dossiê Pericial & Segurança**:
  - *Dossiê em PDF Vetorial A4*: Emissão oficial com ReportLab e QR Code de 300 DPI com validação pública (`/validar/:protocolo`).
  - *Auditoria IA de Laudos*: Análise documental com Gemini AI e validação de Magic Bytes (`%PDF-`).
  - *Autenticação com OTP*: Recuperação de senha segura com código de 6 dígitos e rate limiting.
- **B2B & Sincronizador Multicanal**:
  - Sincronização em 1 clique para os 3 canais homologados: **Webmotors**, **OLX Autos** e **AutoCerto DMS** com carga de estoque direta (`/api/integrations/autocerto/feed.xml`).
- **Catálogo Escalável**:
  - Paginação nativa no servidor (`limit=20`, `offset`), busca unificada `ilike` e navegação numérica.

---

## Estrutura deste Repositório

| Item | Descrição / Link |
| :--- | :--- |
| **Requisitos do Sistema** | [docs/requisitos.md](docs/requisitos.md) — Matriz completa de Requisitos Funcionais (RF-01 a RF-26) e Não Funcionais |
| **Arquitetura de Software** | [docs/arquitetura.md](docs/arquitetura.md) — Diagrama de componentes, modelo de dados, integrações e ADRs (ADR-01 a ADR-06) |
| **Backlog Priorizado** | [BACKLOG.md](BACKLOG.md) — Rastreabilidade completa de US, tarefas técnicas e DoD |
| **Sprints e Ciclos Ágeis** | [sprints/README.md](sprints/README.md) — Histórico das Sprints 00, 01, 02 e 03 |
| **Entregas Avaliativas** | [entregas/README.md](entregas/README.md) |
| **Decisões Técnicas (ADRs)** | [docs/decisoes/README.md](docs/decisoes/README.md) |
| **Histórico de Versões** | [CHANGELOG.md](CHANGELOG.md) |
| **Backend (FastAPI)** | [backend/](backend/) — REST API assíncrona, SQLAlchemy, Pydantic v2 e serviços de IA |
| **Frontend (React / Vite)** | [frontend/](frontend/) — SPA React 18, TailwindCSS, Framer Motion e Web Audio DSP |
| **API Gateway (Nginx)** | [gateway/](gateway/) — Proxy reverso centralizado unificando portas e rotas |
| **Orquestração** | [docker-compose.yml](docker-compose.yml) — Subida de todos os 5 microsserviços integrados |

---

## 🚀 Como Executar o Projeto

### Pré-requisitos
- [Docker](https://www.docker.com/) e Docker Compose instalados.

### 1. Clonar o repositório
```bash
git clone https://github.com/CAMPUSCEUB/ADS-AUTOMATCH.git
cd ADS-AUTOMATCH
```

### 2. Subir os microsserviços via Docker Compose
```bash
docker compose up -d --build
```

### 3. Acessar a aplicação
- **Aplicação Web (Portal Principal)**: [http://localhost](http://localhost) (ou [http://localhost:3000](http://localhost:3000))
- **Documentação da API (Swagger UI)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Frontend Vite Direto**: [http://localhost:5173](http://localhost:5173)

### 4. Executar os Testes Automatizados (10/10 Testes)
```bash
docker compose exec backend python test_vision_and_delete.py
```
*Cobrem visão computacional, exclusão atômica de anúncios, diagnóstico acústico, scanner de pneus, 360°, simulador Troca com Troco, radar de alertas e integrações multicanal.*
