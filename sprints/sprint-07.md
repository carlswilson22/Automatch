# Sprint 07 — Refinamento de UX/UI, Conexão B2B, Filtros em Cascata, Cadastro Avançado e Governança de Backlog

## Período
Início: 28/09/2026 | Fim: 29/09/2026

## Objetivo
Refinar e polir a experiência do usuário (UX/UI) e a gestão de estoque, implementando filtros em cascata inteligentes e busca reativa no catálogo, padronizando o alinhamento e resiliência da aba de reservas na rede de conexão B2B com lojas parceiras, aprimorando o formulário de cadastro de veículos com upload de galeria multifoto e vídeo pericial com player dinâmico de 15 segundos, saneando avisos de compilação em contêineres Docker e estruturando a governança oficial do projeto com rastreabilidade completa do backlog.

## Milestone
`v2.5.0 — Refinamento de UX/UI, Conexão B2B, Filtros em Cascata & Governança de Backlog`

## Itens planejados e entregues
- [x] `[ATM-UX-01]` **Busca Dinâmica & Responsiva no Catálogo**: Barra de pesquisa reativa integrada no topo central da vitrine digital (`ShowcaseCatalog.jsx`) com filtragem instantânea por marca, modelo e termos de busca com debounce otimizado.
- [x] `[ATM-UX-02]` **Motor de Filtros em Cascata**: Implementação de seletores dependentes onde a lista de modelos é dinamicamente filtrada pela marca selecionada, com filtros adicionais por ano, tipo de câmbio (Manual/Automático), combustível (Flex, Gasolina, Híbrido, Elétrico) e faixa de preço min/max.
- [x] `[ATM-UX-03]` **Higienização Visual do Catálogo**: Remoção de elementos poluidos e sem ação interativa — exclusão do ícone estático de localização, supressão de nomes indevidos de concessionárias terceiras sobre os botões de ação e substituição do ícone redundante de Preço Justo pelo badge visual de oportunidade "Preço Baixou". Remoção do botão duplicado de limpeza de filtros.
- [x] `[ATM-B2B-02]` **Alinhamento e Estabilidade em Minhas Reservas (Rede B2B)**: Correção do grid de 12 colunas no modal `PartnershipHubModal.jsx`, garantindo alinhamento perfeito de títulos, prazos de hold lock, valores e ações de cancelamento/liberação.
- [x] `[ATM-B2B-03]` **Resiliência no Envio de Convites de Parceria**: Tratamento defensivo em `NewPartnershipInviteCard.jsx` e `PartnershipHubModal.jsx`, eliminando o erro de conexão ao disparar convites através de persistência local resiliente e sincronização assíncrona.
- [x] `[ATM-FAV-01]` **Contador Integrado na Página de Favoritos**: Inclusão de pill badge estilizado diretamente no título `<h1>` de `FavoritesPage.jsx` informando a quantidade exata de veículos favoritados, com remoção do contador redundante na barra superior de navegação.
- [x] `[ATM-CHAT-01]` **Inteligência Contextual no Chat Consultor**: Calibração do motor do `HomeSupportChat.jsx` para reconhecimento imediato de intenções relacionadas a "carros", "estoque" e "comprar", fornecendo respostas instantâneas (< 150ms) e chips de sugestão rápida para guiar o comprador ao catálogo.
- [x] `[ATM-CAD-01]` **Upload de Galeria Multifoto no Cadastro de Veículos**: Substituição de campo de URL simples por componente drag-and-drop multifoto em `NewCarAdForm.jsx` com suporte a seleção de múltiplos arquivos, preview em grade, badge de foto de capa e remoção individual.
- [x] `[ATM-CAD-02]` **Vídeo Pericial no Cadastro**: Campo para inserção de link de vídeo de vistoria pericial de 15 segundos acompanhado de preview dinâmico com player de mídia integrado.
- [x] `[ATM-CAD-03]` **Privilégio B2B Restrito a Lojistas**: Condicionamento do checkbox de compartilhamento na Rede de Parceiros B2B exclusivamente para usuários com papel de revenda/lojista (`isLojista`).
- [x] `[ATM-OPS-01]` **Saneamento de Containers Docker**: Atualização de `caniuse-lite` e injeção de variável de ambiente `ENV BROWSERSLIST_IGNORE_OLD_DATA=true` nos Dockerfiles (`frontend/Dockerfile` e `frontend/Dockerfile.prod`), eliminando advertências durante o build em produção.
- [x] `[ATM-BACKLOG-01]` **Governança Oficial do Backlog PI 2**: Estruturação completa do documento `BACKLOG.md` com o quadro Kanban oficial em 4 colunas operacionais (Backlog do Projeto, A Fazer, Fazendo, Finalizado), matriz de rastreabilidade, OKRs do produto e definição de pronto (DoD).

## Responsáveis
- **Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio**: Equipe de Engenharia de Software, Fullstack e DevOps (CEUB).
- **Prof. Flávio César**: Orientação técnica e governança acadêmica do Projeto Integrador 2.

## Entregas de Código
- `frontend/src/pages/ShowcaseCatalog.jsx` (Busca responsiva, filtros em cascata, catálogo limpo).
- `frontend/src/components/partners/PartnershipHubModal.jsx` (Grid alinhado de 12 colunas em Minhas Reservas).
- `frontend/src/components/partners/NewPartnershipInviteCard.jsx` (Fallback resiliente no envio de pedidos).
- `frontend/src/pages/FavoritesPage.jsx` (Pill badge contador no título principal).
- `frontend/src/components/chat/HomeSupportChat.jsx` (Detecção rápida de intenção automotiva e chips rápidos).
- `frontend/src/pages/NewCarAdForm.jsx` (Upload múltiplo de galeria, preview de vídeo 15s e trava B2B para lojista).
- `frontend/Dockerfile` e `frontend/Dockerfile.prod` (Atualização de dependências e eliminação de alertas).
- `BACKLOG.md` (Quadro Kanban oficial consolidado).

## Evidências de Validação
- Compilação do build de produção via Vite (`npm run build`) concluído com status `0 erros` em 14.80s (2.241 módulos transformados).
- Execução de testes de integração com sucesso no container backend.
- Sincronização e push simultâneo para os repositórios remotos `origin/main` (`carlswilson22/Automatch`) e `secundario/main` (`CAMPUSCEUB/ADS-AUTOMATCH`).

## Retrospectiva
- **Pontos Fortes**: A implementação das melhorias de UX/UI seguiu estritamente o feedback do usuário, eliminando ruídos visuais, aprimorando a usabilidade em desktop e mobile e garantindo estabilidade nas transações B2B.
- **Próximas ações**: Apoiar o início do item `[ATM-AI-05]` (Feedback do YOLOv8 pós-upload de laudos cautelares) e integração com a ferramenta GitHub Projects.
