# Estado atual do Automatch

**Correções de 17/11/2026:** os cinco problemas da [revisão da demonstração](revisao-pendencias-demo-2026-11-17.md)
foram corrigidos com regressões permanentes: dados do anúncio/PDF, quilometragem,
favoritos separados por conta e cadastro local sem falso sucesso. Sem deploy ou
reformulação do banco; conferência visual e de acessibilidade permanece manual.

Atualizado em **19/11/2026**, correções sobre a base `f45498b`.
Fonte: rotas e componentes versionados, manifests, Compose, migrações e
[auditoria anterior](auditoria-2026-11-16.md). Esta revisão não refez uma
homologação integral. Mediu métricas exploratórias de treino em dados provisórios, sem homologar acurácia do produto ou desempenho em aparelhos reais.

## Limpeza de arquivos — 18/11/2026

Quinze módulos sem consumidores foram retirados, incluindo telas antigas e os
componentes legados de pneus/acústica. As rotas e funções correspondentes desses
dois recursos também foram removidas. Auditoria: 85 módulos alcançáveis e cinco
dependências de execução utilizadas (ver [changelog](../CHANGELOG.md)).

## Manutenção anterior do frontend

A revisão sobre `8294a26` eliminou os 161 avisos de ESLint, mantendo as regras:
zero erros/avisos, 290 testes frontend e build local aprovados. Contextos/hooks
separados e efeitos legados com respostas/cache isolados por veículo. Pneus e
acústica continuam fora das telas. Ver [relatório](manutencao-avisos-2026-11-17.md).

## Escopo desta etapa

Demonstração com Continuous Deployment (CD) automatizado no GitHub Pages a partir da branch `main` do repositório principal, mantendo opção manual de contingência. A auditoria recebeu autorização específica para aplicar as migrações pendentes e corrigir perfis no banco real, após backup e ensaio em cópia; ver [verificação](verificacao-banco.md).
Os consultores locais e o PDF não certificam integridade ou regularidade a partir
de ausência de dados. Diálogos de alerta/multicanal têm teclado e foco gerenciados.

## Modos de execução

1. **Frontend estático/Pages:** navegação e amostras locais conforme as flags
   de demonstração. GitHub Pages não hospeda a API, banco ou uploads.
2. **Aplicação com API:** backend FastAPI, banco e mídia próprios; autenticação,
   cadastro de anúncios, reservas e demais operações persistentes dependem dessa API.
3. **Serviços externos:** exigem configuração, disponibilidade e homologação
   próprias. Um botão ou resposta de exemplo não prova integração real.

## Auditoria de 19/11/2026

Migrações 006–008 aplicadas no PostgreSQL real; dez subpapéis de contas comuns corrigidos sem excluir cadastros. Scanner, consumidores e mídias corrigidos. Resultados detalhados no [relatório](auditoria-scanner-video-2026-11-19.md). Treinamento experimental não equivale a detector homologado.

## Recursos ativos

| Jornada | Implementação e limite |
| --- | --- |
| Visitante | Inicial, vitrine, busca/filtros, anúncio e validação pública de protocolo existente |
| Conta comum | Cadastro/login, perfil, favoritos locais, novo anúncio e Meus Anúncios; sem dashboard B2B |
| Lojista/admin | Dashboard e rede B2B, conforme vínculo e autorização verificados na API |
| Catálogo | API paginada; demonstração pode usar catálogo estático. Cache local não é fonte oficial de propriedade |
| Mídia | Galeria e sequência orbital por veículo; fotos disponíveis determinam os ângulos reais |
| Scanner | Contrato de evidência v2. COCO reconhece veículos, não avarias; resultado inconclusivo enquanto não houver detector calibrado. Sem pontos herdados ou score fictício. Treinos separados, experimentais |
| Laudo anexado | Auditoria assistida PDF/imagem por IA/heurística, com ausência de dados exigindo conferência |
| Dossiê PDF | Cadastro prevalece; valores ausentes permanecem ausentes no snapshot, PDF e validação; protocolo não certifica regularidade externa |
| Vídeo | Cronograma único e quatro MP4 de 20,0 s regenerados; Pulse indisponível por falta de traseira válida. Ausência/erro exibe indisponibilidade, sem vídeo simulado |
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
Os componentes legados, endpoints e funções de pneus/acústica foram removidos
na limpeza de 18/11/2026. Não documentar medição de sulcos,
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

Fontes de detalhe: [arquitetura](arquitetura.md), [banco](DOCUMENTACAO_BANCO_DE_DADOS.md),
[segurança](../SECURITY.md), [backlog](../BACKLOG.md) e
[testes](testes-e-evidencias.md).
