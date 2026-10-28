# ADR-001: Arquitetura em Microsserviços Conteinerizados via Docker Compose

## Título
Isolamento e conteinerização dos serviços do ecossistema Automatch com Docker Compose.

## Status
Aprovado

## Data
20/08/2026

## Contexto
O ecossistema Automatch possui múltiplas camadas especializadas: interface rica em React/Vite, API assíncrona em Python/FastAPI, motor pericial de visão computacional (OpenCV/YOLOv8), banco relacional (PostgreSQL 15), cache de contingência e gateway de entrada com proxy reverso (Nginx). Executar esses componentes diretamente no ambiente do host causava conflito de versões de bibliotecas, inconsistências entre sistemas operacionais (Windows/Linux) e complexidade no setup de desenvolvimento e produção.

## Decisão
Adotar Docker Compose como padrão de orquestração local e de implantação, dividindo o ecossistema em 5 contêineres desacoplados:
1. `gateway`: Nginx Alpine para terminação HTTP e roteamento dinâmico.
2. `frontend`: Node/Vite compilando a SPA React 18 com TailwindCSS.
3. `backend`: Python 3.11 com FastAPI, SQLAlchemy e APScheduler.
4. `db`: PostgreSQL 15 com persistência em volume seguro (`db_data`).
5. `cache`: Redis Alpine para caching de respostas de cotações FIPE e DETRAN.

## Alternativas Consideradas
- **Arquitetura Monolítica Tradicional (Django ou Flask puro)**: Descartada pela baixa flexibilidade na camada de apresentação SPA e acoplamento desnecessário do motor de IA ao ciclo de renderização web.
- **Kubernetes (K8s)**: Descartado pelo overhead operacional e complexidade desproporcional para o estágio atual do projeto.

## Consequências
- **Positivas**: Reprodutibilidade garantida em qualquer máquina com um único comando (`docker compose up -d --build`); isolamento de falhas (a queda do banco não corrompe os arquivos estáticos da SPA); facilidade de migração para nuvem.
- **Negativas**: Consumo moderado de memória RAM durante o build inicial de imagens contendo pacotes de visão computacional (OpenCV e PyTorch).

## Links Relacionados
- **Documento de Arquitetura**: [docs/arquitetura.md](../arquitetura.md)
- **Relatório de Sprint 00**: [sprints/sprint-00-planejamento.md](../../sprints/sprint-00-planejamento.md)
- **Arquivo Compose**: [docker-compose.yml](../../docker-compose.yml)
