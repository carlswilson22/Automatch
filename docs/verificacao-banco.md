# Verificação e correções do banco — 18/11/2026

As correções foram autorizadas após o diagnóstico. Foram ensaiadas no banco
automatch_audit_20261118_35737885 e aplicadas ao banco real automatch.
Nenhum anúncio, conta, loja, protocolo ou registro [TESTE] foi excluído.

## Resultado

| Verificação | Antes | Depois |
| --- | --- | --- |
| Migração | 005_fix_b2b_financial_types | 008_safe_account_defaults |
| users.token_version | ausente | INTEGER NOT NULL DEFAULT 0 |
| price_alerts | ausente | tabela e índice por usuário presentes |
| Default de role no PostgreSQL | lojista | comum |
| Default de sub_role | owner | sem default |
| Contas comuns com sub_role de loja | 10 | 0 |
| Quantidade de tabelas | 14 | 15 |

As migrações 006 e 007 existentes foram aplicadas, seguidas da 008. A 006
também limpa o OTP legado armazenado em texto puro; os nove registros de
recuperação foram preservados. A nova migração altera defaults, sem promover
ou rebaixar papéis já cadastrados.

O reparo de dados retirou somente sub_role de dez contas com role=comum.
IDs, papéis, vínculos, nomes e demais campos foram preservados. Perfis owner,
manager e seller de lojistas/admin não foram alterados.

## Proteção e reversão

Backup completo antes da aplicação real: automatch-real-before-apply-20261118.dump,
fora do repositório, formato pg_dump custom.

SHA256: 2ce125c9e56854f6cc8d2c6f31abbf34dfefbe08da90519957efb2c2f44e3b46.

A restauração do backup inicial foi testada, com as contagens das 14 tabelas
iguais à origem. Na cópia, as migrações foram repetidas sem recriar dados;
o reparo de dez perfis foi aplicado, revertido e reaplicado, com guarda de
concorrência. Na origem, o reparo foi aplicado uma vez, após novo backup.

O manifesto real anterior aos reparos está fora do Git, junto ao backup.
Ele contém somente os campos de perfil necessários ao rollback, sem
senha/e-mail/nome. O comando versionado exige backup externo e grava o
manifesto com criação exclusiva, evitando sobrescrever a prova de reversão.

Com DATABASE_URL fornecida por ambiente seguro, sem colocar a credencial
em argumentos/logs:

```powershell
python repair_profiles.py
python repair_profiles.py --apply --backup <backup-externo> --report <manifesto-externo-novo>
python repair_profiles.py --rollback <manifesto-externo> --backup <novo-backup-externo>
```

A primeira forma é somente leitura. Repetir --apply após o reparo retorna
zero alterações. Um rollback se recusa a sobrescrever um perfil alterado
desde o reparo. Não carregar .env para a manutenção automatizada:
PYTHON_DOTENV_DISABLED=1; DATABASE_URL deve ser explícita.
Nunca executar downgrade/rollback na origem sem conferir impacto e backup.

## Contagens preservadas na aplicação real

cars=31; users=42; stores=8; laudo_protocols=3; password_reset_tokens=9;
store_partnerships=1; partnership_audit_logs=19; alembic_version=1.
car_reservations, laudo_watchlist, partner_messages, partner_reviews,
partner_transactions e payment_orders continuam com zero registros.
A nova price_alerts inicia vazia. Não houve limpeza automática de duplicidades.

## Saúde e integridade do diagnóstico

PostgreSQL 15.19, UTF8, UTC; serviço db, contêiner automatch-db;
127.0.0.1:5433 → 5432; volume automatch_postgres_data.
Na fotografia inicial: 9.592.167 bytes e uma conexão incluindo a auditoria.

Foram verificados 24 relacionamentos com FK, sem órfãos, e índices começando
pelas colunas de relacionamento. Tipos financeiros NUMERIC(12,2), comissão
percentual NUMERIC(5,2). Não havia valores negativos de preço/km ou anos fora
do intervalo adotado. Não há série histórica que sustente afirmar crescimento
anormal; cars não tem created_at.

Há oito grupos de anúncios com atributos iguais, dois anúncios [TESTE],
quatro usuários [TESTE] e duas lojas [TESTE]. Esses registros foram preservados:
coincidência de preço/foto/modelo não prova que um anúncio seja descartável.

As 36 referências locais de cars (31 capas e cinco vídeos) existiam. Uploads
não continha mídia real, somente laudos/.gitkeep. Os três snapshots de laudo
não continham referências de mídia. Nenhum laudo_feedback estava preenchido.

## Consultas de repetição

Executar em transação de leitura, após backup:

```sql
BEGIN TRANSACTION READ ONLY;
SELECT version_num FROM alembic_version;
SELECT count(*) FROM users WHERE role='comum' AND sub_role IS NOT NULL;
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema='public'
  AND (table_name='price_alerts'
       OR (table_name='users' AND column_name IN ('token_version','role','sub_role')));
SELECT role, sub_role, count(*) FROM users GROUP BY role, sub_role;
SELECT count(*) FROM cars;
SELECT count(*) FROM users;
SELECT count(*) FROM stores;
COMMIT;
```

O startup legado ainda possui create_all/compatibilidade de colunas e seed.
Seu default de role/sub_role foi corrigido. Migrações versionadas são a
referência para atualizar banco existente; não usar startup como ferramenta
de diagnóstico ou de migração.

## Evidências e validação

Resultados locais fora do Git: baseline-backend.log, baseline-frontend.log,
after-database-backend.log, after-database-frontend.log,
copy-repairs-result.json, real-repairs-result.json e manifestos de rollback.
O caminho da pasta temporária está no relatório entregue ao responsável.

Testes desta etapa: 284 frontend; 114 unittest backend e cinco jornadas em
bancos descartáveis; três regressões novas de migração/reparo incluídas nessa
contagem backend. Lint inicial: zero erros/avisos. Não confundir esses testes
com homologação visual, acurácia do scanner ou publicação do site.

A cópia foi removida em 19/11/2026, conforme autorização, após os experimentos, backup final e encerramento das conexões. O banco real foi reconsultado e continua saudável. Backups, contêineres e volume foram preservados.

## Complemento final — 19/11/2026

Esquema real após as correções: 15 tabelas, 145 colunas, 72 índices e 40 constraints. Vinte e cinco FKs verificadas por consulta com LEFT JOIN, todas com zero órfãos. As contagens das tabelas anteriores permaneceram idênticas; price_alerts=0. Nenhum preço/ano fora do domínio pesquisado; zero contas comuns com subpapel de loja. Os dois anúncios, quatro usuários e duas lojas [TESTE] preexistentes permanecem na origem.

O Pulse sc-005 teve somente video_url removido, por ausência de traseira válida. O reparo foi aplicado/revertido/reaplicado na cópia e depois aplicado uma vez na origem; nenhuma linha foi excluída. Quatro vínculos de vídeo permanecem ativos. Nenhum laudo_feedback estava preenchido na origem, portanto não havia resultados visuais salvos a reprocessar.

Reparo versionado: `backend/demo_media_repair.py`; CLI `backend/repair_demo_media.py`. Os controles comuns de backup e criação exclusiva do manifesto estão em `backend/maintenance_cli.py`. Os comandos --apply/--report e --rollback exigem backup externo como no reparo de perfis. A CLI sem --apply é somente leitura.

Backups desta etapa:

| Finalidade | Arquivo externo | SHA256 |
| --- | --- | --- |
| Antes do reparo de mídia em automatch_audit_20261118_35737885 | automatch-copy-before-media-20261119.dump | 260d1baa1606c250f25a2442f1743b28c4861ab646e6699b5ad7a4abd7d00d83 |
| Antes do reparo de mídia em automatch | automatch-real-before-media-20261119.dump | 3f72b0ddb59560702bf3b798f79b74889746c754a773c0346e9c5fd8be3087e9 |
| Antes da remoção da cópia | automatch-copy-final-experiments-20261119.dump | 7c184685299b4d1a4738eb138b107f45e2ec743b6d07dcb7fde59f44e8db1bf4 |

Os casos HTTP escreveram somente na cópia, protegida por guarda de nome de banco, com prefixo [TESTE]. A cópia `automatch_audit_20261118_35737885` foi removida por dropdb explícito, sem --force, somente após zero conexões e backup PGDMP. `automatch` continuou presente e pg_isready confirmou disponibilidade. Não foram removidos contêineres, imagens, volumes ou uploads.

A consulta repetível está em [verify_database_readonly.sql](../scripts/verify_database_readonly.sql), com transação READ ONLY e inventário/contagens via catálogo. Verificação final adicional usou reflexão SQLAlchemy e SELECT/LEFT JOIN nas 25 FKs; o JSON de contagens e o roteiro estão fora do Git. O banco foi consultado novamente depois da exclusão da cópia. Não houve teste de crescimento ao longo do tempo: tamanho/conexões são fotografias, não tendência.

O banco ainda não possui CHECKs de domínio adicionais; as validações atuais de preço/ano na API não equivalem a restrições SQL. Oito grupos de anúncios semelhantes continuam candidatos a duplicidade, sem prova suficiente para exclusão. Não reformular essas entidades nem apagar candidatos automaticamente.

Validação final de código: 124 unittest backend + cinco jornadas em bancos descartáveis e 288 testes frontend; lint e build executados. Treino real executado no Linux; navegador indisponível. Ver [relatório](auditoria-scanner-video-2026-11-19.md) e [experimentos](treinamento-avarias-2026-11-19.md).

Fotografia de saúde após remover a cópia: PostgreSQL healthy, pg_isready disponível, 9.624.935 bytes, uma conexão de auditoria, UTF8 e UTC. Antes: 9.592.167 bytes. A diferença pontual de 32.768 bytes após migrações não caracteriza uma tendência de crescimento anormal.
