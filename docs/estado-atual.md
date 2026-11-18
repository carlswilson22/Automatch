# Estado atual do Automatch

**Correções de 17/11/2026:** os cinco problemas da [revisão da demonstração](revisao-pendencias-demo-2026-11-17.md)
foram corrigidos com regressões permanentes: dados do anúncio/PDF, quilometragem,
favoritos separados por conta e cadastro local sem falso sucesso. Sem deploy ou
reformulação do banco; conferência visual e de acessibilidade permanece manual.

Atualizado em **17/11/2026**, melhorias demonstrativas sobre a base `444bc09`.
Fonte: rotas e componentes versionados, manifests, Compose, migrações e
[auditoria anterior](auditoria-2026-11-16.md). Esta revisão não refez uma
homologação integral nem mediu precisão de IA ou desempenho em aparelhos reais.

## Manutenção do frontend

A revisão sobre `8294a26` eliminou os 161 avisos de ESLint, mantendo as regras:
zero erros/avisos, 290 testes frontend e build local aprovados. Contextos/hooks
separados e efeitos legados com respostas/cache isolados por veículo. Pneus e
acústica continuam fora das telas. Ver [relatório](manutencao-avisos-2026-11-17.md).

## Escopo desta etapa

Somente demonstração, sem deploy. Pages passou a acionamento manual; nenhum
workflow de publicação foi iniciado. A reformulação do banco para a futura
execução local aguarda autorização; ORM e migrações existentes foram preservados.
Os consultores locais e o PDF não certificam integridade ou regularidade a partir
de ausência de dados. Diálogos de alerta/multicanal têm teclado e foco gerenciados.

## Modos de execução

1. **Frontend estático/Pages:** navegação e amostras locais conforme as flags
   de demonstração. GitHub Pages não hospeda a API, banco ou uploads.
2. **Aplicação com API:** backend FastAPI, banco e mídia próprios; autenticação,
   cadastro de anúncios, reservas e demais operações persistentes dependem dessa API.
3. **Serviços externos:** exigem configuração, disponibilidade e homologação
   próprias. Um botão ou resposta de exemplo não prova integração real.

## Recursos ativos

| Jornada | Implementação e limite |
| --- | --- |
| Visitante | Inicial, vitrine, busca/filtros, anúncio e validação pública de protocolo existente |
| Conta comum | Cadastro/login, perfil, favoritos locais, novo anúncio e Meus Anúncios; sem dashboard B2B |
| Lojista/admin | Dashboard e rede B2B, conforme vínculo e autorização verificados na API |
| Catálogo | API paginada; demonstração pode usar catálogo estático. Cache local não é fonte oficial de propriedade |
| Mídia | Galeria e sequência orbital por veículo; fotos disponíveis determinam os ângulos reais |
| Scanner | Análise de fotos de lataria; cancelamento/respostas isolados por anúncio. Não atesta condição mecânica nem acurácia milimétrica |
| Laudo anexado | Auditoria assistida PDF/imagem por IA/heurística, com ausência de dados exigindo conferência |
| Dossiê PDF | Cadastro prevalece; valores ausentes permanecem ausentes no snapshot, PDF e validação; protocolo não certifica regularidade externa |
| Vídeo | Player com roteiro nominal de 20 segundos; sem vídeo, há representação demonstrativa, não filmagem real |
| Comparador | Dois a três veículos, preço/FIPE, uso, laudo, documentação e ficha; origem dos dados precisa ser considerada |
| Financiamento/TCO/troca | Cálculos ilustrativos, sem consulta/aprovação de banco, transferência Pix ou proposta automática vinculante |
| Favoritos | Listas no navegador por identificador de conta, eventos de sessão e importação explícita da lista de visitante/legada; sem backend ou sincronização entre dispositivos |
| Chat público | Assistente contextual e encaminhamento ao vendedor; não há prova de central humana conectada nesse widget |
| Chat B2B | Mensagens da negociação pela API, atualizadas por polling; sem WebSocket |
| Parcerias/reservas | Proposta, aceite/encerramento, reserva temporária, pedido de fechamento e repasse com confirmação da API |
| Sessão | JWT com versão de conta; troca de senha e anonimização invalidam tokens anteriores |
| Recuperação | OTP com hash e expiração; código demonstrado só fora de produção, entrega real depende de SMTP TLS |
| Alertas | Cadastro por conta na API ou no navegador em demo; prévia interativa de queda de preço no site, sem envio externo |

Papel principal da conta é `comum`, `lojista` ou `admin`; `sub_role` registra
subperfil comercial. Não presumir que subperfis tenham uma matriz completa de
permissões em todos os endpoints apenas porque o campo existe.

## Integrações e demonstrações

| Área | Situação comprovada no código |
| --- | --- |
| Gemini | Integração opcional de visão/chat/laudos; sem chave ou em falha há caminhos locais. Não homologada nesta revisão com credenciais reais |
| YOLO/OpenCV | Processamento local e bibliotecas declaradas; resultados dependem de modelo/imagem/ambiente e não certificam veículo |
| DETRAN/placa | Registros conhecidos e respostas simuladas; não são certidões ou consultas oficiais |
| FIPE | `detran.py` consulta BrasilAPI por código, com cache por código/ano de 24h; falha permanece indisponível. Outros dados vêm do cadastro/seed |
| Multicanal | AutoCerto DMS, AutoAvaliar e OLX Autos no código atual; seleção, prévia e histórico demonstrativos, sem URL falsa ou chamada de publicação aos provedores |
| Feed XML | API gera XML do catálogo atual, com filtro de loja e somente campos públicos; demo exporta o veículo escolhido |
| Alertas WhatsApp/e-mail/Web Push | Cadastro e prévia no site; sem serviço de envio/monitoramento |
| Checkout | Pedidos simulados em desenvolvimento; produção bloqueia cobrança sem provedor |
| SMTP | Serviço implementado para recuperação de senha; entrega exige credenciais e teste operacional |

Nomes comerciais e taxas de financiamento são exemplos. Não constituem parceria
bancária, oferta ou homologação pelo fornecedor. PDFs Automatch não são laudos
oficiais de órgão público nem substituem inspeção profissional presencial.

## Recursos fora do escopo ativo

**Não há scanner ou reescaneamento de pneus disponível na interface atual.**
`TireDepthScanner.jsx` e `EngineAcousticScanner.jsx` não são importados pelas
telas ativas. Endpoints e funções correspondentes permanecem como código legado,
sem caracterizar funcionalidades entregues. Não documentar medição de sulcos,
conformidade CONTRAN ou diagnóstico acústico real como recurso pronto.
O roteiro do vídeo pode citar pneus; isso não implementa um scanner de pneus.

Redis não compõe o Compose atual. Não há certificação WCAG AAA, laudo oficial,
precisão pericial certificada, SLA ou cobertura de testes de todos os fluxos.
Existem mecanismos pontuais de acessibilidade/segurança que precisam de
homologação nas condições de uso.

## Pendências antes de operação real

- Conectar consultas cadastrais e multicanal a integrações contratadas; homologar o feed com o importador escolhido.
- Implementar monitoramento/entrega de alertas e eventual pagamento real.
- Homologar SMTP, IA, privacidade, políticas de acesso e tratamento de erros externos.
- Definir domínio/HTTPS, segredos, backups, restauração, monitoramento e retenção.
- Planejar coordenação compartilhada para rate limiting/scheduler antes de escalar workers.
- Manter limpeza de avisos de manutenção com testes proporcionais à mudança.
- Validar manualmente layout, teclado, acessibilidade e fluidez dos fluxos.

Fontes de detalhe: [arquitetura](arquitetura.md), [banco](../DOCUMENTACAO_BANCO_DE_DADOS.md),
[segurança](../SECURITY.md), [backlog](../BACKLOG.md) e
[testes](testes-e-evidencias.md).
