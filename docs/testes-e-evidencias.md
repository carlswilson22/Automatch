# Testes, evidências e limites

Atualizado em **17/11/2026**, referência de código `1b7d094`.
Uma porcentagem de testes aprovados não equivale à porcentagem de cobertura,
à ausência de falhas ou à certificação de acessibilidade/IA.

## Comandos atuais

No diretório `frontend`:

```sh
npm ci
npm run lint
npm test
npm run build
```

`npm test` descobre `tests/*.mjs`. Build produz a SPA e sua cópia `404.html`.
O lint pode terminar sem erros e ainda emitir avisos; registrar ambos.
Para reprodução sob uma base de publicação, configurar `VITE_BASE_PATH`
conforme o ambiente. Não há meta fixa de quantidade de testes para toda versão.

No diretório `backend`, com dependências instaladas:

```sh
python run_tests.py
```

O executor desativa carregamento do `.env`, define ambiente de teste, remove
a chave Gemini do processo de teste e cria bancos SQLite/diretórios de mídia
temporários. Executa descoberta unittest e cinco roteiros de jornada. Não
substituí-lo pela execução indiscriminada de scripts antigos sobre o banco local.

## Resultados históricos de referência

A [auditoria de 16/11](auditoria-2026-11-16.md) registra a execução anterior e
seu complemento de comportamento:

- Frontend: 263 testes aprovados no complemento, build com base `/Automatch/`,
  lint sem erros e com 209 avisos de manutenção naquela execução.
- Backend: 95 testes unittest e cinco roteiros de jornada no registro anterior,
  com dados descartáveis; o complemento seguinte atingiu apenas frontend.
- Migrações: registro anterior de aplicação/reaplicação até
  `007_persist_price_alerts`; CI também contém checagem PostgreSQL/SQLite.

Esses números não foram obtidos novamente pela revisão documental de 17/11.
Avisos residuais incluem código sem uso e componentes legados não importados
pelas telas, como scanner de pneus/acústica. Não ativar esses recursos apenas
para resolver um aviso.

## CI e publicação

`ci.yml` possui jobs de backend, frontend, migrações PostgreSQL/SQLite e builds
Docker. `static.yml` testa/compila/publica o frontend Pages somente no principal.
São workflows separados: uma execução de Pages não comprova, por si só, sucesso
de todos os jobs do backend. Conferir status por commit nos dois repositórios.
A [sincronização](sincronizacao-repositorios.md) não replica segredos ou permissões.

## Limites da evidência

- Testes locais não comprovam entrega SMTP, APIs externas de Gemini, consulta
  DETRAN oficial, publicação em portais ou pagamento real.
- Testes Node de componentes não equivalem a inspeção em navegador/dispositivo.
- Um ensaio de carga precisa informar dados, rede, concorrência, ambiente,
  percentis e commit; números históricos não são SLA.
- Preservar os relatórios acadêmicos como registros da época, adicionando notas
  datadas sem transformar conclusões antigas em aprovações novas.

## Checklist para registrar uma validação

- [ ] Commit, data e responsável pela execução.
- [ ] Comando e ambiente, com dados descartáveis ou cópia autorizada.
- [ ] Resultado real, total executado, erros, avisos e cenários não cobertos.
- [ ] Dependências externas utilizadas ou substituídas por exemplo/mock.
- [ ] Evidência de UI manual quando o comportamento visual for relevante.
- [ ] Resultado de CI, quando disponível, identificado por link/commit.
- [ ] Confirmação da atualização da `main` dos dois repositórios.

Em alterações apenas documentais, conferir links, fontes, inventário e
preservação de registros/licenças. Não relatar execução de suítes da aplicação
quando somente a documentação foi verificada.
