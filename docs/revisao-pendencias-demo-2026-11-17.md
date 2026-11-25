# Revisão de pendências da demonstração — 17/11/2026

> Complemento de 18/11/2026: a limpeza posterior registrada no [changelog](../CHANGELOG.md)
> retirou componentes legados e atualizou as evidências; este registro descreve a etapa anterior.

Código examinado: `ffe60e226c81e6a44b45191456faa62788cabda2`, confirmado na
`main` principal e na `main` secundária antes da revisão. A análise examinou
anúncio, normalização de dados, favoritos, cadastro local, PDF, backlog e CI.
Não é certificação de ausência de outros erros ou de cobertura integral.

> Registro histórico da análise. As correções posteriores e os testes estão
> no complemento de conclusão ao final deste documento.

## Situação dos modelos e do Automatch

As últimas solicitações dos modelos do Sites-principal estão concluídas na
`main` `7fa86cb`: alerta de preço somente no modelo que já dispõe da função,
com sino à esquerda de favoritos dentro do anúncio. Não havia alterações locais
pendentes nos dois projetos ao iniciar esta revisão.

No Automatch há cinco correções de comportamento pendentes, descritas abaixo.
As melhorias de `ffe60e2` não eliminaram todos os caminhos que preenchem dados
favoráveis automaticamente. Os testes existentes passaram mesmo com essas
inconsistências: a cobertura precisa incluir os fluxos completos.

## Achados confirmados

### A1 — Alta: anúncio contradiz os dados cadastrados

**Reprodução:** resposta controlada da API com `laudo_status='Reprovado'`,
`debt_status='Com débitos'`, `auction_history='Sim'` e sem `damagePoints`.
A página renderizou **Laudo 100% Aprovado**, **Sem Passagem por Leilão** e
**IPVA 2026 Quitado**.

O mapeador perde os campos de situação e acrescenta código FIPE, descrição de
aprovação e especificações quando não foram informados. O selo de laudo depende
somente da existência de pontos de avaria; leilão e IPVA têm textos fixos.
O formulário também começa com laudo aprovado, sem débitos e sem leilão.

**Correção necessária:** preservar a situação recebida, apresentar ausência
como não informada e usar amostras favoráveis somente nos registros de exemplo
identificados. Centralizar a normalização entre catálogo, anúncio e comparação.

**Critério de aceitação:** um cadastro reprovado/com débitos/com leilão permanece
assim no catálogo, anúncio, favoritos, comparador e dossiê. Ausência de avarias
cadastradas não comprova aprovação.

Fontes: [mapeador](../frontend/src/utils/vehicleMapper.js),
[anúncio](../frontend/src/pages/ShowcaseVehicleDetails.jsx),
[normalizador](https://github.com/carlswilson22/Automatch/blob/7fd2315928bcef6884069628911492ee9e3330a2/frontend/src/utils/vehicleNormalizer.js) e
[cadastro](../frontend/src/pages/NewCarAdForm.jsx).

### A2 — Alta: a rota do PDF ainda fabrica referência FIPE e regularidade

**Reprodução pela rota real:** veículo de R$ 100.000, sem `fipe_price`, em
SQLite em memória. `GET /api/v1/laudos/audit-pdf/pdf` retornou 200 e um PDF com
referência de **R$ 104.000,00**, código **005391-0** e **Sem débitos**, embora
esses valores não estivessem cadastrados.

O gerador de PDF foi corrigido para não criar a cotação, mas `_build_car_dict`
ainda acrescenta preço vezes 1,04, código fixo e situação favorável antes da
renderização. Caminhos de payload e query params repetem substituições similares.
O teste atual chama o gerador diretamente e não detecta esse preenchimento
anterior executado pela rota.

**Correção necessária:** preservar valores ausentes desde a montagem dos dados
até o snapshot, PDF e validação pública; retirar preenchimentos fixos do cadastro
não ilustrativo. Testar a rota completa, além da função geradora.

**Critério de aceitação:** sem FIPE ou situação informadas, o PDF e o protocolo
mantêm os campos como não informados; não surgem preço, código ou quitação novos.

Fontes: [rota do PDF](../backend/routers/laudos_export.py),
[gerador](../backend/services/pdf_generator.py) e
[teste atual](../backend/test_demo_tools.py).

### A3 — Média: favoritos exibem quilometragem incorreta de anúncios da API

**Reprodução:** anúncio da API com `km=42000`. A página de favoritos mostrou
**0 km**, sem os 42.000 km recebidos.

A lista passa por `mapVehicleToViewModel`, que retorna `mileage`. Depois,
`FavoritesPage` tenta ler `dbCar.km` e usa zero quando não encontra a propriedade.
A página reconstrói separadamente objetos de catálogo, mocks, cadastro local e
API, repetindo regras e situações favoráveis de exemplo.

**Correção necessária:** consumir os mesmos campos normalizados em todas as
fontes, preservando a quilometragem e sem reconstruções contraditórias.

**Critério de aceitação:** preço, km, situação e características do mesmo veículo
coincidem entre anúncio, favoritos e comparador; valor ausente não vira zero real.

Fonte: [favoritos](../frontend/src/pages/FavoritesPage.jsx).

### A4 — Média: favoritos não são separados por conta

**Reprodução:** salvar um veículo com uma sessão de exemplo A e trocar a sessão
para B mantém a mesma lista em `getFavorites()`. A chave é única:
`@automatch:favorites`.

A página exige login, mas a persistência é do navegador inteiro. Se o objetivo
é uma lista pessoal por conta, trocar de usuário não deve herdar automaticamente
os favoritos da outra sessão.

**Correção recomendada:** separar a chave por identificador de conta, atualizar
os assinantes ao mudar a sessão e definir a transição dos favoritos de visitante
sem apagar dados anteriores ou atribuí-los silenciosamente a outra conta.
Isso pode ser feito no navegador; não exige reformulação do banco.

Fonte: [gerenciador de favoritos](../frontend/src/data/favoritesManager.js).

### A5 — Média: cadastro demo confirma conta que não conseguiu salvar

**Reprodução:** API indisponível, modo demo explícito, leitura local normal e
`localStorage.setItem` lançando erro de quota. `register()` retornou uma conta,
marcou a sessão como autenticada e não salvou `@automatch:registered_users`.

A falha de gravação é ignorada no caminho de cadastro local. Depois de sair,
a conta criada não estará na base local usada para autenticar.

**Correção necessária:** confirmar o armazenamento antes de informar sucesso no
cadastro local; em falha, preservar o formulário e permitir nova tentativa.
Distinguir esse caso do login de conta já confirmada por uma API.

Fonte: [autenticação local](../frontend/src/contexts/AuthContext.jsx).

## Verificações executadas nesta análise

- `npm test`: **275 testes frontend aprovados**.
- `npm run lint`: **zero erros, 163 avisos**: 150 declarações sem uso,
  9 avisos de Fast Refresh, 2 dependências de efeitos e 2 diretivas desnecessárias.
- `python -X utf8 run_tests.py`: **103 testes unittest e cinco jornadas aprovados**,
  com bancos SQLite e diretórios de mídia descartáveis.
- Diagnósticos adicionais reproduziram A1 a A5 com dados fictícios em memória,
  API controlada e rota de PDF usando banco isolado. Não foram adicionados como
  testes permanentes nesta revisão documental.
- CI do código examinado: [execução 109 concluída com sucesso](https://github.com/carlswilson22/Automatch/actions/runs/44131477151),
  evento `push`, SHA `ffe60e2`. A busca de issues/PRs abertos do principal não
  retornou itens; isso não elimina as pendências encontradas no código.
- Não houve nova compilação local nesta análise; a execução CI acima inclui build.
  Os resultados anteriores continuam separados em [testes/evidências](testes-e-evidencias.md).

## Ordem recomendada

1. Corrigir A1 e A2 em todas as etapas de montagem/exibição dos dados.
2. Adicionar regressões de ponta a ponta para cadastro negativo, PDF sem FIPE,
   favoritos com km, troca de conta e falha de armazenamento no cadastro local.
3. Corrigir A3, A4 e A5 e rever os dados compartilhados entre as telas.
4. Continuar a limpeza dos 163 avisos por lotes, sem suprimir regras globalmente.
5. Realizar a conferência visual manual e de acessibilidade nos dispositivos definidos.

## Limites e autorização

Esta atualização é documental: registra os achados, não corrige funcionalidades.
Não houve deploy, acesso a `.env` privado, alteração de banco real, ORM ou migrações.
A reformulação do banco para execução local continua aguardando autorização.
Integrações oficiais, entrega externa de alertas, publicação real em portais e
homologação operacional permanecem fora do escopo desta demonstração.
Pneus/reescaneamento e diagnóstico acústico não integram as telas ativas.
A inferência YOLO real e a inspeção visual não foram homologadas por esta análise.
## Conclusão da implementação autorizada — 17/11/2026

Este complemento se refere às correções sobre a base documental `fd229c3`.
As reproduções acima descrevem o estado histórico `ffe60e2`; A1–A5 estão
corrigidos nesta versão, com os seguintes controles permanentes:

- **A1:** [mapeamento comum](../frontend/src/utils/vehicleMapper.js) preserva
  campos de laudo, débitos, leilão, referência, histórico e especificações.
  Anúncio, favoritos, normalizador e comparador o consomem. Ausência de km não
  vira zero; ausência de avarias não aprova laudo. Cadastro começa como não informado.
- **A2:** montagem da rota mantém campos ausentes; cadastro prevalece sobre o
  payload enviado. PDF, snapshot e validação pública não geram FIPE de 4%,
  código fixo ou quitação. Prévia/amostra têm origem explícita; protocolo apenas
  localiza o registro, sem consulta externa ou reescrita de snapshots históricos.
- **A3:** favoritos preservam os 42.000 km normalizados e os dados enviados à comparação.
- **A4:** chave por identificador de conta, assinantes notificados no login/logout
  e importação explícita na tela. A lista antiga e a de visitante continuam
  preservadas; falha de gravação não substitui dados e eventos de outra conta
  não são aceitos como a lista da sessão atual.
- **A5:** conta local e sessão precisam ser gravadas antes de autenticar. Erros
  de quota/corrupção são apresentados, duplicatas são preservadas e nova tentativa
  funciona. Falha no cache opcional não invalida cadastro confirmado pela API;
  recusa HTTP não dispara cadastro offline. Sessão parcialmente gravada é revertida.

Regressões: [frontend](../frontend/tests/test_confirmed_pending_fixes.mjs) e
[backend HTTP/PDF](../backend/test_confirmed_pending_fixes.py). Testes antigos
que exigiam reconstrução nas páginas ou escrita na chave global foram atualizados
para verificar os dados reais e a preservação do legado, mantendo seus cenários.

Verificações desta implementação: **287 testes frontend**, **109 unittest
backend e cinco jornadas aprovados**, com dados descartáveis; lint **zero erros
e 161 avisos**. Build local demonstrativo com base `/Automatch/`, incluindo
`404.html`. Inspeção visual/acessibilidade permanece manual; DLL de Torch/YOLO
indisponível neste Windows não permite homologar inferência real. Ver
[testes e limites](testes-e-evidencias.md).

Não houve deploy, reformulação do banco, modificação de ORM/migrações nem
alteração de `.env` privado. O envio deve manter o mesmo commit nas duas `main`,
preservando as outras branches do secundário.
