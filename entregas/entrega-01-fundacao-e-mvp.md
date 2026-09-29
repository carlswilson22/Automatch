# Entrega 01 — Fundações Arquiteturais, Autenticação, Catálogo e Perícia Visual por IA

## Identificação
* **Título:** Entrega Parcial 1 — Base Arquitetural, Serviços Core e MVP do Automatch
* **Data:** 11/09/2026
* **Instituição:** Centro Universitário de Brasília (CEUB)
* **Curso:** Análise e Desenvolvimento de Sistemas (ADS)
* **Disciplina:** Projeto Integrador 2 (PI 2)
* **Equipe:** Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio
* **Professor Orientador:** Prof. Flávio César

## Sprints relacionadas
* [Sprint 00 — Planejamento Inicial](../sprints/sprint-00-planejamento.md)
* [Sprint 01 — Infraestrutura Docker, Auth JWT e Catálogo](../sprints/sprint-01.md)
* [Sprint 02 — Scanner de Lataria com IA e Perícia](../sprints/sprint-02.md)

## Escopo
Consolidação do ambiente conteinerizado completo do Automatch, implementação dos serviços de autenticação segura, catálogo de veículos com busca e persistência no PostgreSQL, e primeiro módulo operacional de perícia automotiva assistida por IA (Visão Computacional OpenCV e YOLOv8).

## Links principais
* **Repositório Primário:** [carlswilson22/Automatch](https://github.com/carlswilson22/Automatch)
* **Repositório Institucional:** [CAMPUSCEUB/ADS-AUTOMATCH](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH)
* **Documentação de Arquitetura:** [docs/arquitetura.md](../docs/arquitetura.md)
* **Especificação de Requisitos:** [docs/requisitos.md](../docs/requisitos.md)

## Critérios atendidos
1. **Orquestração Docker Compose**: 5 serviços configurados (Frontend Vite/React, Backend FastAPI, Banco PostgreSQL 15, Cache Redis 7 e Gateway Nginx).
2. **Autenticação & Segurança**: Senhas criptografadas com `PBKDF2-HMAC-SHA256` (100.000 iterações) e emissão de tokens JWT (RFC 7519).
3. **Catálogo de Veículos**: Listagem paginada, filtros por marca, modelo e ano, e integração com cotações da Tabela FIPE.
4. **Scanner Pericial de Lataria**: Processamento de imagens por Visão Computacional identificando avarias estruturais com coordenadas cartesianas (X, Y) e score de integridade.

## Validação e Evidências
* **Testes Automatizados**: Suíte de testes `test_vision_and_delete.py` executada no backend com 100% de aprovação.
* **Build Frontend**: Compilação sem falhas no ambiente de desenvolvimento e produção com TailwindCSS.
* **Seed do Banco**: 10+ veículos cadastrados com dados fidedignos de mercado e fotos em alta resolução.

## Limitações conhecidas na época
* Geração de laudos limitada a dados em tela, sem exportação em PDF vetorial.
* Varredura 360° utilizando fotos estáticas com substituição de imagem.

## Próximos passos
* Desenvolvimento do motor de laudos em PDF A4 com autenticidade via QR Code público (Sprint 03).
* Implementação da Calculadora TCO e Comparador Multidimensional (Sprints 04 e 05).
