# Orientações para manutenção do Automatch

## Repositórios

- Principal: `carlswilson22/Automatch`, branch `main`.
- Secundário: `CAMPUSCEUB/ADS-AUTOMATCH`, branch `main`.
- Ao publicar uma alteração no principal, publicar o mesmo resultado no secundário.
- No secundário, modificar somente `main`. Preservar todas as demais branches;
  não usar force push, mirror, all nem excluir referências.
- Seguir `docs/sincronizacao-repositorios.md`; conferir divergências antes do envio
  e verificar os dois hashes ao concluir. Não relatar sincronização sem confirmação.

## Documentação e verificação

- Usar `docs/README.md` e `docs/estado-atual.md` como referências atuais.
- Não oferecer scanner/reescaneamento de pneus ou diagnóstico acústico: foram
  retirados do escopo e tiveram os arquivos/endpoints legados removidos.
- O responsável autorizou manter públicos os acessos da demonstração do GitHub
  Pages no README; são exemplos de apresentação, não segredos de produção.
  Preservar essa identificação e não removê-los como se fossem credenciais reais.
- Distinguir demonstração, integração real e pendência. Não inventar resultados
  de testes, métricas, aprovações, participantes ou datas de reuniões.
- Preservar registros históricos; adicionar complementos datados quando necessário.
- Não ler/divulgar segredos de `.env`, alterar banco real ou rodar scripts de teste
  antigos contra dados do usuário. Backend: `python run_tests.py` usa dados temporários.
- Frontend: `npm run lint`, `npm test`, `npm run build`, conforme impacto da mudança.
- Em mudanças apenas documentais, validar links, referências e fidelidade ao código;
  não apresentar testes anteriores como reexecutados. A inspeção visual é manual.

## Escopo demonstrativo autorizado

- Deploy no GitHub Pages: O repositório principal `carlswilson22/Automatch` conta com Continuous Deployment (CD) automatizado no GitHub Pages para commits enviados à branch `main`. O acionamento manual (`workflow_dispatch`) permanece disponível como contingência.
- Repositório secundário: Em `CAMPUSCEUB/ADS-AUTOMATCH`, modificar exclusivamente a branch `main` e preservar integralmente a branch `ProfFlavioCesar-patch-1`. Nenhum deploy de Pages deve ser executado no secundário.
- Não reformular banco, entidades ou migrações para execução local antes de nova autorização.
- Exemplos devem permitir interação no site sem alegar envio externo ou certificação inexistente.
