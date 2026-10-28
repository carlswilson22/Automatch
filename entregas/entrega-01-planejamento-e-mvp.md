# Entrega 01 — Planejamento Arquitetural, Requisitos e MVP Operacional

## Identificação
- **Projeto**: Automatch™ — Marketplace Automotivo com Perícia por Inteligência Artificial
- **Instituição**: Centro Universitário de Brasília (CEUB)
- **Curso**: Análise e Desenvolvimento de Sistemas (ADS)
- **Equipe**: Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio
- **Data da Entrega**: 12/09/2026

## Sprint Relacionada
Consolidação das **Sprints 00, 01 e 02** (Milestones `v1.0.0`, `v1.1.0` e `v2.0.0`).

## Escopo
1. **Engenharia de Requisitos**: Levantamento completo dos Requisitos Funcionais (RF-01 a RF-10) e Não Funcionais (RNF-01 a RNF-08) em `docs/requisitos.md`.
2. **Arquitetura de Microsserviços**: Configuração da orquestração Docker Compose com 5 serviços isolados (Gateway Nginx, Frontend Vite/React, Backend FastAPI, Banco PostgreSQL 15 e Cache Redis) e diagramas Mermaid em `docs/arquitetura.md`.
3. **Catálogo & Vitrine**: Interface responsiva com busca textual, filtros facetados (marca, modelo, ano, faixa de preço) e persistência de dados.
4. **Auditoria Cautelar Inicial**: Mecanismo de upload de laudos em PDF com validação por Magic Bytes (`%PDF-`) e checklist dos 4 pilares estruturais.

## Links Principais
- **Repositório**: `CAMPUSCEUB/ADS-AUTOMATCH`
- **Requisitos**: [docs/requisitos.md](../docs/requisitos.md)
- **Arquitetura**: [docs/arquitetura.md](../docs/arquitetura.md)
- **Relatórios de Sprint**: [sprint-00](../sprints/sprint-00-planejamento.md), [sprint-01](../sprints/sprint-01.md) e [sprint-02](../sprints/sprint-02.md)
- **ADRs Associados**: [ADR-001](../docs/decisoes/adr-001-microsservicos-docker-compose.md) e [ADR-002](../docs/decisoes/adr-002-autenticacao-stateless-jwt-pbkdf2.md)

## Critérios Atendidos
- [x] Especificação de Requisitos e Backlog priorizado com histórias de usuário.
- [x] Infraestrutura conteinerizada e reprodutível com `docker compose up -d --build`.
- [x] Modelagem relacional do banco de dados com script de carga (`seed.py`).
- [x] Suíte de testes de integração cobrindo fluxos críticos de autenticação e anúncios.

## Validação
- **Testes de Integração**: Execução de `pytest` cobrindo criação de anúncios, login e upload com 100% de sucesso.
- **Ambiente Docker**: Todos os 5 contêineres inicializados e respondendo com status `healthy`.
- **Responsáveis pela Verificação**: Carlos Wilson (Arquitetura) e Equipe de Desenvolvimento.

## Limitações
- Varredura 360° orbital operando apenas com imagens estáticas sem perspectiva tridimensional e sem hotspots interativos.
- Consultas DETRAN com simulação de dados estáticos sem background job de monitoramento.

## Pendências Conhecidas
- Geração de laudos oficiais para download em PDF vetorial de alta definição.
- Mecanismo de recuperação de conta via OTP e proteção anti-força bruta.

## Próximos Passos
- Implementar gerador de Dossiê em PDF vetorial A4 via ReportLab com QR Code público na Entrega 02.
- Integrar diagnóstico acústico do motor por espectrograma e comparador técnico de veículos.

