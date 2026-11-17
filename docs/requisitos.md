# Requisitos do Automatch

Revisão de **17/11/2026**, código `1b7d094`. Os identificadores RF-01 a RF-28
foram mantidos para rastreabilidade. Descrição não equivale a integração
homologada; a coluna de situação registra o comportamento encontrado.

## Objetivo e usuários

Marketplace de veículos, análise assistida de fotos/laudos e negociação entre
lojas. Visitante consulta o catálogo; conta comum anuncia e usa ferramentas
pessoais; lojista/admin acessa o B2B conforme autorização da API. Informações
automáticas auxiliam a análise e não substituem inspeção profissional.

## Requisitos funcionais e situação

| ID | Recurso | Situação e critério verificável |
| --- | --- | --- |
| RF-01 | Scanner de carroceria | Ativo com API de imagem; conferir dados retornados, erro e cancelamento. Sem acurácia milimétrica comprovada |
| RF-02 | Visualização 360° | Fotográfica; abrir ângulos cadastrados do veículo, arrastar/girar e tratar mídia ausente |
| RF-03 | Diagnóstico acústico | Fora do escopo ativo; componentes/endpoints legados não entregam diagnóstico ao usuário |
| RF-04 | Scanner de pneus | Fora do escopo ativo; não há scanner ou reescaneamento de pneus na interface |
| RF-05 | Catálogo | Busca, filtros e ordenação; API paginada e alternativa local no modo de demonstração |
| RF-06 | Preço FIPE | Exibir referência com sua origem; parte da API consulta BrasilAPI, com cache e alternativa ilustrativa. Não garantir cotação atual em toda tela |
| RF-07 | Dossiê de transparência | Apresentar dados do anúncio/laudo; ausências não comprovam inexistência de risco |
| RF-08 | Dados DETRAN | Demonstração por bases conhecidas; consulta oficial externa pendente |
| RF-09 | Troca com troco | Estimativa local de diferença; não avalia profissionalmente o usado nem transfere Pix |
| RF-10 | Financiamento | Estimativas com referências de bancos; sem contratação, consulta ou aprovação de crédito |
| RF-11 | Radar de preço | Cadastro persistido por conta na API; monitoramento e envio externo ainda pendentes |
| RF-12 | Assistente contextual | Chat com contexto do veículo, integração Gemini opcional e respostas locais; sem evidência de pipeline RAG completo |
| RF-13 | Contato com vendedor | Fluxo no anúncio/WhatsApp; não confundir com chat humano público em tempo real. Chat B2B possui persistência/polling |
| RF-14 | Multicanal B2B | AutoCerto, AutoAvaliar e OLX no código; protocolo/status de envio são simulados, sem publicação real |
| RF-15 | Feed XML | Endpoint com documento de exemplo; geração completa do estoque e compatibilidade com importadores pendentes |
| RF-16 | Novo anúncio | Formulário em etapas, mídia e análise assistida; conferir propriedade, dados e confirmação de gravação |
| RF-17 | Exclusão de anúncio | Exige autorização e confirmação da API; falha não deve ocultar registro apenas localmente |
| RF-18 | Lojas e estoque B2B | Vínculo à loja, parcerias, reserva temporária, fechamento e histórico persistidos pela API |
| RF-19 | Autenticação | Cadastro/login JWT, PBKDF2, perfil e versão de sessão; não conceder privilégio por e-mail especial |
| RF-20 | Planos/checkout | Rota de planos redireciona ao catálogo; checkout simulado fora de produção, bloqueado em produção sem provedor |
| RF-21 | PDF com QR Code | Documento Automatch vinculado a snapshot/protocolo; não é laudo oficial nem assinatura digital certificada |
| RF-22 | Validação pública | Consultar protocolo existente; inexistente não pode receber confirmação de autenticidade |
| RF-23 | Recuperação OTP | Código com hash, expiração de 15 minutos e limitação de tentativas; produção depende de SMTP TLS e não devolve OTP |
| RF-24 | Paginação | Listagem da API com `limit`/`offset` e navegação no frontend; conferir total, filtros e páginas vazias |
| RF-25 | Favoritos | Área autenticada, persistência local e atualização por eventos; sem sincronização entre dispositivos via banco |
| RF-26 | Auditoria de laudo anexado | Validar PDF/imagem e analisar por IA/heurística; divergência ou dado insuficiente exige conferência, não aprovação automática |
| RF-27 | Vídeo de inspeção | Roteiro atual de 20 segundos, upload e player; ausência/erro pode exibir representação demonstrativa |
| RF-28 | Comparação multidimensional | Dois a três veículos, cinco seções, tratamento de dados ausentes e navegação ao anúncio |

RF-03 e RF-04 registram propostas antigas, sem compromisso de implementação no
escopo atual. Não acrescentar scanner de pneus como pendência obrigatória.

## Requisitos não funcionais

| ID | Área | Implementação ou objetivo a validar |
| --- | --- | --- |
| RNF-01 | Desempenho | Carregamento sob demanda, imagens e cancelamentos; metas numéricas exigem ambiente/carga definidos. Não há SLA de 200 ms comprovado |
| RNF-02 | Segurança | Hash PBKDF2, JWT/versionamento, validações e autorização; homologar fluxos críticos e revisar dependências |
| RNF-03 | Operação | Compose com gateway/frontend/backend/banco e probes; disponibilidade/backup/restauração dependem de implantação |
| RNF-04 | Confiabilidade | Testes existentes cobrem cenários específicos; não há comprovação de cobertura integral ou ausência de defeitos |
| RNF-05 | Usabilidade | Responsividade, estados de carregamento/erro, teclado e movimento reduzido; avaliação visual/acessibilidade manual pendente |
| RNF-06 | Cache/escala | Caches e limitadores locais ao processo; Redis e coordenação distribuída não implementados |
| RNF-07 | Compatibilidade | Homologar navegadores/dispositivos escolhidos; não presumir compatibilidade universal pelos testes Node |
| RNF-08 | Privacidade | Exportação/anonimização de conta e controles pontuais; não constituem conformidade LGPD certificada |

## Evidência de conclusão

Registrar requisito, comportamento esperado, commit, comando/ambiente, resultado
e limitações. Diferenciar teste isolado, execução com API e validação externa.
Mudar a situação somente após evidência correspondente; não classificar mock
como integração ou porcentagem de testes aprovados como porcentagem de cobertura.

Referências: [estado atual](estado-atual.md), [arquitetura](arquitetura.md),
[testes](testes-e-evidencias.md) e [backlog](../BACKLOG.md).
