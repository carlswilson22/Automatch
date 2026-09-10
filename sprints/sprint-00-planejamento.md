# Sprint 00 — Planejamento Inicial do Projeto Automatch

## 1. Contexto
Início do Projeto Integrador no curso de Análise e Desenvolvimento de Sistemas (CEUB). A equipe identificou a dor crítica no mercado de seminovos de compra e venda sem laudo técnico pericial confiável e a falta de ferramentas digitais avançadas para análise remota de lataria, motor e pneus.

## 2. Equipe & Papéis
- **Carlos Wilson**: Arquiteto de Software, Engenheiro Fullstack e Especialista em IA / Visão Computacional.
- **Prof. Flávio César**: Professor Orientador da Disciplina de Projeto Integrador.
- **Equipe Automatch**: Desenvolvimento, testes de integração e documentação técnica.

## 3. Cadência Escolhida
- **Duração das Sprints**: Sprints quinzenais com entregas contínuas.
- **Checkpoints**: Revisões de sprint e alinhamento de entregáveis.
- **Versionamento**: Git com commits semânticos e branches por feature.

## 4. Problema Central da Sprint
Estruturar a base arquitetural conteinerizada com Docker Compose, definir a stack tecnológica e projetar os microsserviços de Backend (FastAPI), Frontend (React/Vite), Banco de Dados (PostgreSQL), Cache (Redis) e Gateway de Entrada (Nginx).

## 5. Objetivo da Sprint
Entregar o ambiente de desenvolvimento 100% funcional com o catálogo inicial, integração com a Tabela FIPE, banco de dados inicializado com seed e a suíte de testes de integração automatizados.

## 6. Riscos Iniciais e Mitigações
- *Risco de dependência de APIs externas*: Criação de camada de fallback no backend para consultas FIPE e DETRAN.
- *Risco de desempenho no upload de imagens*: Implantação de compressão automática LANCZOS no backend.

## 7. Backlog Inicial Priorizado
1. `[US-01]` Configuração da orquestração Docker Compose com 5 serviços.
2. `[US-02]` Criação da API REST assíncrona com FastAPI e autenticação JWT.
3. `[US-03]` Desenvolvimento do catálogo vitrine com filtros e busca.
4. `[US-04]` Implementação do Hub Pericial com Visão Computacional, Varredura 360°, Diagnóstico Acústico e Scanner de Pneus.
5. `[US-05]` Desenvolvimento do simulador "Troca com Troco" e Sincronizador Multicanal B2B.

## 8. Acordos de Trabalho (Definition of Done)
- Código fonte versionado e limpo sem dependências órfãs.
- Suíte de testes automatizados com 100% de aprovação.
- Documentação sincronizada com o template institucional do CEUB.
