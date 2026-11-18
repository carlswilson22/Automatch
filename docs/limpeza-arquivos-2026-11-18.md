# Limpeza de arquivos e funcionalidades sem uso — 18/11/2026

Base de início: `7fd2315928bcef6884069628911492ee9e3330a2`, confirmada nas duas
`main`. Revisão de imports estáticos/dinâmicos, rotas, dependências, serviços,
testes, configurações de build e mídia versionada. Não é garantia de ausência
de qualquer código morto em fluxos condicionais ou integrações externas.

## Código retirado

Foram removidos **15 módulos frontend** após verificar consumidores e rotas:

- `frontend/src/components/ai/AutomatchAI.jsx`.
- `frontend/src/components/ui/CarCard.jsx`.
- `frontend/src/components/ui/microkit/IconSwapButton.jsx`.
- `frontend/src/components/ui/microkit/index.js`.
- `frontend/src/components/ui/microkit/SlidingTabs.jsx`.
- `frontend/src/components/ui/StoreBadge.jsx`.
- `frontend/src/components/vehicle/AutomatchScan.jsx`.
- `frontend/src/components/vehicle/EngineAcousticScanner.jsx`.
- `frontend/src/components/vehicle/FinancingSimulator.jsx`.
- `frontend/src/components/vehicle/TireDepthScanner.jsx`.
- `frontend/src/components/vehicle/WarrantyBadgeModal.jsx`.
- `frontend/src/pages/PlansPage.jsx`.
- `frontend/src/utils/animations.js`.
- `frontend/src/utils/vehicleNormalizer.js`.
- `frontend/src/components/ui/microkit/AutomatchLogo.jsx`.

A página `/planos` continua redirecionando ao catálogo. O simulador financeiro
usado no anúncio permanece em `TradeInSimulator.jsx`; somente a implementação
antiga sem consumidores foi excluída. A análise de lataria permanece nas telas
de anúncio/cadastro; `AutomatchScan.jsx` era um segundo componente não utilizado.
O logotipo agora é importado diretamente da implementação existente, sem alias.

No backend, retirados os endpoints `/api/analise-acustica` e
`/api/analise-pneus`, seus modelos de entrada locais e as duas funções de serviço
correspondentes. Esses recursos já estavam fora do produto demonstrado.
A análise visual de lataria, o mapa 360°, o consultor e suas rotas continuam.
Não houve alteração de entidades ORM, `schemas.py`, banco real ou migrações.

## Dependências e prevenção de novas sobras

- Removidos `axios`, `clsx`, `gsap` e `tailwind-merge` do manifest/lockfile.
  Não havia consumidores ativos; Axios era usado somente pelos dois componentes
  legados retirados. A regra de chunk GSAP também foi removida.
- A auditoria [check-source-usage.mjs](../frontend/scripts/check-source-usage.mjs)
  verifica o grafo a partir de `src/main.jsx`, imports relativos e dependências
  diretas de execução. Resultado: **85 módulos alcançáveis**, nenhum órfão,
  e **cinco dependências de execução com consumidores**.
- `npm run check:usage` executa a auditoria, agora também incluída em `npm test`.
  `espree`, já instalado como dependência transitiva do ESLint, foi declarado
  explicitamente em desenvolvimento para o parser; não integra o bundle publicado.
- `.gitignore` passou a incluir caches `.vite`/`.vite-temp`. Foram removidas
  sete pastas locais de cache Python/Vite após os testes, verificando caminhos
  dentro do checkout. As ferramentas podem recriá-las; não são fontes da aplicação.

## O que foi mantido e por quê

- **Imagens frontend/backend:** a comparação SHA-256 encontrou 47 grupos iguais.
  A API usa `public_images` em seu container e a SPA usa `frontend/public`; os
  contextos de build são separados. Não são pastas que podem ser removidas sem
  alterar o empacotamento. Fixtures nomeadas e evidências também têm consumidores.
- Componentes homônimos de UI que continuam alcançáveis possuem contratos/estilos
  distintos; não foram substituídos por semelhança de nome.
- Testes úteis, fixtures, pesos YOLO, configurações de Docker/gateway, licenças,
  migrações e scripts CLI de diagnóstico/jornada foram preservados. Ausência de
  import numa tela não torna esses artefatos desnecessários.
- Documentos acadêmicos/históricos foram mantidos; links para código retirado
  apontam ao commit anterior. Documentação atual e inventário refletem a limpeza.
- Dependências instaladas e o build local continuam disponíveis para uso. Banco,
  uploads e `.env` privados não foram inspecionados, reformatados ou excluídos.

## Validação

- `npm run check:usage`: aprovado (85 módulos, cinco dependências de execução).
- `npm run lint -- --max-warnings 0`: **zero erros e zero avisos**.
- `npm test`: **284 testes frontend aprovados**. Seis testes antigos foram
  aposentados com os recursos retirados: quatro do modal de garantia e dois
  dos efeitos legados. Testes de normalização e scanner passaram a verificar
  o mapeador e a análise de lataria usados pela aplicação.
- `python -X utf8 run_tests.py`: **111 unittest e cinco jornadas aprovados**,
  usando bancos/mídia temporários. Duas regressões novas verificam rotas
  retiradas/404 e preservação do contrato da análise visual com API controlada.
- Build demonstrativo local com base `/Automatch/`, incluindo `404.html`.
- Links locais e `git diff --check`; mesma atualização nas duas `main`, sem
  alterar outras branches do secundário nem acionar Pages.

Sem deploy ou reformulação do banco. Inspeção visual permanece manual; testes
com dados controlados não homologam IA externa, acurácia pericial ou integrações.
