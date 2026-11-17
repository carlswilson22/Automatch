# Contribuição e publicação — Automatch

Atualizado em **17/11/2026**. Código e documentação devem descrever o
comportamento comprovado. Comece pelo [índice](docs/README.md).

## Fluxo

1. Registrar problema, resultado esperado e requisito afetado. Usar issue/PR
   para rastreabilidade acadêmica quando aplicável, sem inventar números.
2. Implementar mudança proporcional ao escopo e preservar dados/alterações de terceiros.
3. Executar verificações adequadas: frontend com lint/testes/build; backend com
   `python run_tests.py`. Revisão só documental verifica links e fidelidade às fontes.
4. Atualizar estado/requisitos/arquitetura/banco conforme o impacto; registrar
   mudanças relevantes no changelog. Históricos recebem complementos datados.
5. Fazer commit descritivo e publicar conforme a orientação vigente do responsável.
   Nesta sessão, as entregas foram autorizadas diretamente na `main`.
6. Publicar o mesmo resultado na **main do secundário** e verificar os hashes.
   **Não alterar qualquer outra branch do secundário.**

Branches temáticas/PRs podem ser usados no principal quando o trabalho exigir
ou houver orientação específica. Não criar uma branch no secundário para
contornar a regra. Preservar contribuições e nunca forçar histórico divergente.
O [procedimento de sincronização](docs/sincronizacao-repositorios.md) é parte da conclusão.

## Qualidade e evidência

Usar commits como `fix: ...`, `feat: ...` e `docs: ...`. Relatar comando,
commit, ambiente, resultado e limitações; não fixar contagem antiga de testes
no template de PR. Lint sem erros pode ter avisos, que devem ser identificados.
Não criar testes que apenas repitam texto da implementação ou alterações
puramente editoriais; aplicar validações relevantes ao risco da mudança.

Não declarar integração externa pronta porque uma simulação retorna sucesso.
Pneus/acústica são código legado fora das telas ativas. Conferência visual
permanece manual. Ver [testes e evidências](docs/testes-e-evidencias.md).

## Segurança e autoria

Não enviar `.env`, bancos, uploads privados, tokens reais ou dados pessoais.
Os acessos públicos de demonstração no README foram explicitamente autorizados
para apresentação no GitHub Pages; manter essa identificação ao documentá-los. Usar
modelos de ambiente com placeholders e preservar `LICENSE`/`NOTICE`.
Não executar scripts de teste antigos contra banco real, resetar dados ou
recriar tabelas para fazer uma migração passar. Ver [SECURITY](SECURITY.md).
