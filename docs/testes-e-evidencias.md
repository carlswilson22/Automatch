# Testes, evidências e limites

Atualizado em **17/11/2026**, melhorias demonstrativas sobre a base `444bc09`.
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
python -X utf8 run_tests.py
```

O executor desativa carregamento do `.env`, define ambiente de teste, remove
a chave Gemini do processo de teste e cria bancos SQLite/diretórios de mídia
temporários. Executa descoberta unittest e cinco roteiros de jornada. Não
substituí-lo pela execução indiscriminada de scripts antigos sobre o banco local.

## Limpeza — execução atual de 18/11/2026

Base: `7fd2315`. `npm test` executa a auditoria de uso (85 módulos alcançáveis e
cinco dependências utilizadas) e **284 testes frontend aprovados**. Lint com
`--max-warnings 0`: **zero erros/avisos**; build local `/Automatch/` concluído.
O runner backend executou **111 unittest e cinco jornadas aprovados**, com bancos
SQLite e uploads temporários, sem `.env` privado ou dados reais.

Seis testes dos componentes retirados foram aposentados; os testes de dados e
scanner foram direcionados à implementação usada. Duas regressões HTTP novas
protegem a retirada dos endpoints excluídos e a análise visual mantida (detalhes
no [changelog](../CHANGELOG.md)). Não houve deploy nem migração.

## Manutenção — execução anterior de 17/11/2026

Base: `8294a26`. Frontend somente: `npm run lint -- --max-warnings 0` com
**zero erros/avisos**, `npm test` com **290 testes aprovados**, build local
`VITE_DEMO_MODE=true VITE_BASE_PATH=/Automatch/ npm run build` concluído.
Três regressões novas verificam contexto de tour compartilhado, cancelamento de
resposta antiga e cache/repetição por veículo em componentes legados isolados.
API e animações desses testes são controladas; não equivalem a validação visual.
Backend não alterado/reexecutado nesta etapa. Sem banco real, migrações ou deploy.
[Relatório de causas e correções](manutencao-avisos-2026-11-17.md).

## Execução anterior: correções A1–A5 em 17/11/2026

Base de início: `fd229c3`, posterior ao diagnóstico `ffe60e2`.

- `npm test`: **287 testes aprovados**. Doze regressões novas exercitam mapper,
  anúncio/comparador renderizados, favoritos com km, separação de contas/importação,
  falhas de armazenamento, nova tentativa de cadastro e sucesso confirmado pela API. A validação pública renderizada também não
  promete carimbo, assinatura ou hash inexistentes.
- `npm run lint`: **zero erros, 161 avisos**: 148 declarações sem uso,
  9 Fast Refresh, 2 dependências de efeitos em scanners legados e 2 diretivas
  desnecessárias. Nenhuma regra foi suprimida para aprovar a mudança.
- `VITE_DEMO_MODE=true VITE_BASE_PATH=/Automatch/ npm run build`: build local
  concluído, incluindo cópia `404.html`. Sem deploy.
- `python -X utf8 run_tests.py`: **109 unittest e cinco jornadas aprovados**;
  seis testes novos exercitam HTTP → montagem → PDF → snapshot → validação.
  São verificados dados negativos, ausência de FIPE, km zero, prioridade do
  cadastro, prévia/amostra, reutilização de protocolo e snapshot anterior incompleto.
- Armazenamento do navegador e API controlados nos testes frontend; SQLite em
  memória/temporário e uploads descartáveis no backend. Sem banco real ou migrações.

Na primeira execução completa, três testes antigos exigiam a chave global ou
textos de implementação removidos; foram ajustados para verificar o contrato
centralizado e a preservação do legado. A suíte final acima passou integralmente.
O primeiro comando de build recebeu um argumento incompatível com o passo Node;
o comando padrão foi repetido e concluiu as duas etapas.

Os limites de Torch/YOLO, IA externa, inspeção visual e leitor de tela abaixo
continuam válidos. Estes resultados não comprovam ausência de outros defeitos.

## Execução anterior — melhorias sobre `444bc09` em 17/11/2026

Ambiente: Windows/PowerShell, Node 22 e Python 3.11 em ambiente isolado via uv.
Nenhum `.env` privado foi lido; bancos e uploads usados no backend são temporários.

- `npm test`: **275 testes aprovados**, incluindo regressões de armazenamento,
  isolamento por conta/veículo, erro sem falso sucesso, cancelamento, XML,
  valores ausentes e foco/Tab/Escape em diálogos aninhados.
- `npm run lint`: **zero erros e 163 avisos**, comparados a 209 na análise anterior.
  Não houve supressão global de regras; a limpeza foi concentrada nas telas alteradas.
- `VITE_DEMO_MODE=true`, `VITE_BASE_PATH=/Automatch/`, `npm run build`: compilação local
  e cópia `404.html`; não houve envio de artefatos ou deploy.
- `python -X utf8 run_tests.py`: **103 testes unittest e cinco jornadas aprovados**,
  com SQLite e arquivos descartáveis. Consultas externas dos novos testes usam mocks.
- XML validado com parser e conferência de atualizações/filtro por loja; PDF tem
  texto extraído para verificar dados ausentes, escape de marcação e ausência de
  certificação/cotação fictícia. QR identifica o exemplo, sem URL de órgão externo.

O Python do sistema não estava instalado; o ambiente de testes foi preparado
separadamente. Ultralytics/Torch apresentou dependência de DLL indisponível neste
Windows; as verificações locais não homologam inferência YOLO real nem as fixtures
externas de imagens. Não confundir testes de caminhos locais/mocks com acurácia IA.
Inspeção visual, leitor de tela e medições de desempenho em dispositivos continuam
manuais. Não foram testados entrega externa, importação por portais, deploy ou banco real.
## Reanálise sobre `ffe60e2` — 17/11/2026

Executados novamente: 275 testes frontend, 103 unittest backend e cinco jornadas
aprovados; lint com zero erros e 163 avisos. Não houve novo build local nessa
reanálise. O CI do SHA examinado terminou com sucesso, incluindo build.

Diagnósticos adicionais em memória confirmaram cinco lacunas nos testes:
selos favoráveis contradizem o cadastro; a rota do PDF ainda injeta FIPE de 4%
a mais; favoritos exibem km incorreto e compartilham lista entre contas; cadastro
local confirma sucesso após erro de armazenamento. Veja o
[relatório com reproduções](revisao-pendencias-demo-2026-11-17.md).
A análise não corrigiu esses casos nem os adicionou às regressões permanentes.
Banco real, `.env` privado, entidades e migrações não foram alterados.

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
Docker. `static.yml` testa/compila/publica o frontend Pages automaticamente no repositório principal a cada push na `main` que altere `frontend/**` ou `.github/workflows/static.yml`, mantendo `workflow_dispatch` como contingência manual; no secundário não executa deploy de Pages.
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

## Complemento executado — 19/11/2026

Baterias antes/depois de banco, scanner, vídeo e experimentos: resultado final 288 testes frontend, 124 unittest backend e cinco jornadas isoladas. Lint/build executados; mensagem de configuração de versão do plugin React ainda é emitida, sem avisos de código. Vinte cenários HTTP protegidos passaram e três modelos foram avaliados por HTTP em dois tamanhos explícitos; sucesso HTTP não significa acerto de IA. PDF renderizado e quadros de vídeo inspecionados; navegação visual continua pendente por host de automação indisponível. [Relatório e evidências](auditoria-scanner-video-2026-11-19.md).
