# Auditoria do Automatch — 16/11/2026

## Escopo e método

O inventário inicial continha 352 arquivos versionados. Foram analisadas a estrutura, as duplicidades por SHA-256, referências de mídia e as configurações de build, banco, Docker e GitHub Actions. A análise estática percorreu os módulos JavaScript/JSX e Python; os fluxos principais receberam testes de execução e regressão. A inspeção visual do navegador permanece a cargo do usuário.

Nenhum banco ou arquivo de configuração secreto do ambiente local foi usado nos testes. O executor novo cria bancos SQLite e diretórios de upload descartáveis, com carregamento do .env desativado e sem chave Gemini.

## Correções

| Área | Problema encontrado | Resultado |
| --- | --- | --- |
| Dossiê | Variáveis de IA não definidas impediam abrir o modal | Parecer em JSON/objeto é interpretado com segurança; dados inválidos não derrubam o componente |
| React | Hooks condicionais no comparador e no feedback do laudo | Abertura, fechamento e chegada assíncrona de dados mantêm a ordem dos hooks |
| Sessão | Módulos ainda liam tokens antigos do localStorage | Resolução centralizada na sessão atual; cliente HTTP adiciona Bearer somente às rotas locais da API |
| Perfil | token:null apagava a credencial em memória; erros eram tratados como sucesso | Atualização conserva o token e propaga falhas de validação/autorização |
| Anúncios | Cache trocava IDs oficiais por timestamps e acumulava duplicatas | Preservação do ID da API e atualização do registro existente |
| Exclusão | Rejeições da API ocultavam o anúncio apenas no navegador | Dados locais só mudam após confirmação; 401/403 e outras rejeições são preservadas |
| Meus Anúncios | Somente cache local era consultado | Nova rota autenticada /api/cars/mine lista os anúncios da conta |
| Permissões | E-mail especial concedia privilégios; lojista podia informar outra loja | Administração depende do papel da conta e publicação respeita a loja vinculada |
| Uploads | Usuário autenticado podia associar laudo ao anúncio de outro usuário | Propriedade é conferida antes de salvar; leitura de documentos tem limite de buffer |
| Autenticação | Sessão sobrevivia à troca de senha e à anonimização | Versão de sessão revoga tokens antigos; contas anonimizadas são rejeitadas |
| Recuperação | Código OTP era devolvido em produção e armazenado em texto puro | Produção exige SMTP com TLS, código não aparece na resposta; banco guarda somente hash; tentativas são limitadas |
| Inicialização | Seed regravava preços, fotos, status e vínculos de anúncios existentes | Somente exemplos ausentes são criados fora de produção; cadastros e anúncios particulares são preservados |
| Alertas | Lista em memória se perdia ao reiniciar | Alertas passam ao banco e seus contatos são removidos quando a conta é anonimizada |
| Reservas | Duas solicitações podiam reservar o mesmo veículo | Aquisição condicional do veículo; consentimento/cancelamento validam estado da reserva |
| Integridade | Exclusão de dependências violava a ordem de chaves estrangeiras | Avaliações/transações são removidas antes das reservas, com rollback em falhas |
| Valores | Formatação brasileira de preços/km era interpretada incorretamente | Parser compartilhado para formatos numéricos e pt-BR |
| Validação | Atualização parcial aceitava valores negativos/nulos; NaN podia causar erro 500 | Validação de preço, ano, km e reservas; entradas inválidas retornam 422 sem ecoar dados do corpo |
| Laudos | Protocolo inexistente era certificado; payload substituía o cadastro | Validação exige registro real; dados do banco prevalecem e mudanças geram snapshot correspondente |
| Leitura pericial | Negação de Renajud era interpretada como restrição; dados ausentes eram aprovados | Negativas são respeitadas e informação insuficiente exige conferência manual |
| Imagens | URLs de upload recebiam prefixo estático incorreto | Rotas /api permanecem no gateway; fallback do backend encontra public_images |
| Downloads remotos | Scanner aceitava endereços arbitrários | Downloads limitados a hosts HTTPS configurados, sem redirects e com limite de tamanho |
| Concorrência | Análises compartilhavam nomes fixos de arquivos temporários | Arquivos temporários exclusivos por análise |
| Migrações | Índices/FKs já presentes eram criados novamente; migrate.py apagava tabelas | Migrações incrementais preservam tabelas e lidam com baseline consolidada; upgrades SQLite suportados |
| Produção | Compose não encaminhava ENVIRONMENT e controles de segurança | Ambiente de produção explícito, tokens demo desativados, segredo/admin configuráveis e SQLite rejeitado |
| Dependências | Três alertas de segurança no frontend | Lockfile atualizado; Vite mínimo 8.3.8; npm audit sem vulnerabilidades conhecidas na execução |
| Automação | npm test/CI deixavam baterias de fora; cópia SPA repetida | Todas as baterias entram nos comandos; gates de lint/testes, migrações PostgreSQL/SQLite e build Docker incluídos |

## Duplicidades e mídia

As cópias entre frontend/public/images e backend/public_images são necessárias aos contextos independentes de build Docker. Foram mantidas e receberam um teste de igualdade de conteúdo. Três ângulos do HB20 na cópia do backend repetiam fotos erradas e foram substituídos pelos ângulos corretos do frontend.

Os reexports de logo e outros componentes no microkit mantêm compatibilidade de imports. Os botões com nomes semelhantes têm contratos/variantes diferentes; não foram removidos indiscriminadamente. A resolução duplicada de sessão, por outro lado, foi centralizada. Referências históricas a imagens removidas em changelog/sprints não são usadas pelo código em execução.

## Validação

- Frontend: 248 testes aprovados, incluindo renderização React, transições de hooks, sessão, cache, exclusão, cancelamento, números e correspondência das mídias.
- Backend: 94 testes unittest aprovados e cinco roteiros de jornada completos, todos em bancos descartáveis pelo comando python run_tests.py.
- Migrações: aplicação integral até 007_persist_price_alerts em SQLite vazio e segunda execução sem recriar tabelas.
- Frontend: build de produção, fallback 404.html, npm audit e ESLint sem erros bloqueantes.
- Python: verificação de nomes indefinidos e diff sem erros de espaços.
- CI: pipeline configurado para validar PostgreSQL 15 e builds Docker no GitHub Actions após o envio.

## Limites e configuração

- O ESLint terminou com zero erros e 225 avisos de manutenção, principalmente imports/variáveis sem uso e dependências de efeitos. Não são erros bloqueantes; uma limpeza de estilo ampla não foi misturada às correções funcionais.
- Não foram usadas credenciais reais de Gemini, SMTP, integrações externas ou pagamentos. A execução local validou o fallback de IA; não certifica precisão de inferência YOLO/Gemini nem entrega de mensagens.
- Integrações multicanal, consultas de demonstração e notificações externas ainda precisam de provedores reais. A persistência do alerta não equivale a envio de WhatsApp/e-mail implementado.
- Checkout em produção retorna indisponibilidade até haver um provedor de pagamento. Isso impede confirmar pagamentos fictícios como reais.
- SMTP_HOST, SMTP_FROM, SMTP_PORT, SMTP_USERNAME e SMTP_PASSWORD configuram recuperação de senha em produção. Sem SMTP, o serviço informa indisponibilidade.
- ALLOWED_IMAGE_HOSTS pode listar provedores de mídia HTTPS autorizados. Upload direto continua disponível.
- Produção usa um worker enquanto rate limiting e scheduler residirem no processo. Escala horizontal requer coordenação compartilhada.
- Antes de atualizar um banco existente, faça backup e confira sua versão Alembic. Bancos antigos sem histórico de migração precisam de conferência da baseline; não há stamp nem reset automático de dados.

## Como repetir

Frontend, no diretório frontend:

~~~sh
npm ci
npm run lint
npm test
npm run build
npm audit
~~~

Backend, com as dependências instaladas, no diretório backend:

~~~sh
python run_tests.py
~~~

Migração incremental de um banco versionado, com DATABASE_URL configurada:

~~~sh
python migrate.py
~~~
