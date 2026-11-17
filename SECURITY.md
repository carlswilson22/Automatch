# Segurança e proteção de dados — Automatch

Revisado em **17/11/2026**, código `1b7d094`. Este arquivo descreve mecanismos
e orientações de operação; não certifica conformidade LGPD, imunidade a ataques
ou auditoria independente. A revisão documental não implementou novos controles.

## Medidas no código

- Senhas com PBKDF2-HMAC-SHA256, salt aleatório e comparação de hash;
  `backend/security.py` é a referência dos parâmetros atuais.
- JWT assinado e conferido com versão da conta. Alteração de senha e
  anonimização invalidam tokens antigos; conta anonimizada não autentica.
- Produção exige segredo próprio, rejeita tokens demo e SQLite.
- OTP tem expiração e hash, sem armazenamento aberto; produção usa SMTP TLS e
  não retorna o código na resposta. Sem SMTP configurado, não há entrega real.
- Rotas verificam sessão/propriedade/cargo conforme a operação. Vínculo à loja
  não deve ser confundido com autorização universal de todos os subperfis.
- Uploads possuem verificações de formato/conteúdo/tamanho; downloads de imagens
  remotas restringem hosts e redirects. Isso não é antivírus ou garantia de arquivo seguro.
- Limitadores ficam em memória no processo; produção tem um worker enquanto
  não houver coordenação compartilhada.
- Exportação/anonimização de conta e logs B2B são pontuais; não comprovam
  eliminação de todas as cópias, bases externas ou backups.

## Configuração e operação

Não versionar `.env`, credenciais reais, bancos ou documentos privados. `JWT_SECRET`,
senha administrativa, banco, Gemini e SMTP pertencem ao ambiente protegido.
`VITE_*` é configuração pública de frontend; não armazenar segredos nesses campos.

Os acessos públicos de demonstração documentados no README são uma exceção
expressamente autorizada para o GitHub Pages. Não são segredos e não devem ser
confundidos com credenciais de uma instalação real.

O Pages estático usa demonstração e não comprova autorização em servidor.
Favoritos/caches locais não devem guardar informações confidenciais nem ser
tratados como banco central. Dados demonstrativos não são laudos oficiais.

Antes de operar, definir HTTPS, origens, limites, papéis, backup/restauração,
atualizações, monitoramento e processo de incidentes. O Nginx de produção
versionado escuta HTTP em 80; publicar 443 não configura certificados.
Não há rotina de backup automatizada ou trilha imutável comprovada.

## Privacidade

Inventariar dados e fornecedores, finalidade, base de tratamento, acesso,
retenção e procedimento de solicitações. Não presumir conformidade integral
porque existe um botão de exportar/anonimizar. Avaliar documentos, logs, alertas,
mensagens, backups e compartilhamentos separadamente para a operação real.

Não afirmar que fotos de pneus, áudio ou consultas simuladas certificam
conformidade técnica/legal. Os recursos ativos e pendências estão em
[estado atual](docs/estado-atual.md) e [backlog](BACKLOG.md).

## Reporte reservado

Comunicar vulnerabilidades aos mantenedores por canal reservado disponível;
não publicar tokens, dados pessoais ou detalhes exploráveis em issues públicas.
Não há prazo de resposta ou SLA definido neste arquivo. Se houver exposição,
revogar/rotacionar credenciais afetadas e avaliar o alcance antes de publicar
um relato sanitizado.

A mesma orientação vale para os dois repositórios. Enviar correções à `main`
principal e secundária, preservando as outras branches do secundário, conforme
[sincronização](docs/sincronizacao-repositorios.md).
