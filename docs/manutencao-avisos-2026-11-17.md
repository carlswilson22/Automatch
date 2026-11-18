# Revisão dos avisos de manutenção — 17/11/2026

> Complemento de 18/11/2026: a [limpeza posterior](limpeza-arquivos-2026-11-18.md)
> retirou componentes legados e atualizou as evidências; este registro descreve a etapa anterior.

Base examinada: `8294a2617ba9bd341b93356abdf79761c16aa599`, igual nas duas
`main` no início. Escopo desta revisão: frontend, seus testes e documentação.
Não houve deploy, alteração do backend/banco, migração ou leitura de `.env` privado.

## Origem dos 161 avisos

| Quantidade | Regra / causa | Tratamento |
| --- | --- | --- |
| 148 | `no-unused-vars`: imports, parâmetros, estados e funções sem consumidores | Removidos 112 vínculos de importação, 12 nomes de erros não utilizados em `catch` e demais declarações mortas; preservados os caminhos utilizados |
| 9 | `react-refresh/only-export-components`: helpers/hooks exportados junto com componentes JSX | Sete formatadores de páginas tornados internos; `useAuth` e `useTour` separados dos providers, mantendo o mesmo objeto de contexto |
| 2 | `react-hooks/exhaustive-deps`: funções/dados capturados sem dependências completas | Efeitos dos arquivos legados isolados por contexto do veículo, com cancelamento, descarte de resposta antiga e cache coerente |
| 2 | Diretivas `eslint-disable` sem infração correspondente | Removidas de `mockData.js` e `vehicleMapper.js` |

Esses avisos não eram 161 falhas de execução. Os imports e declarações mortas
acumulavam manutenção desnecessária; Fast Refresh afetava a atualização durante
o desenvolvimento. Os efeitos mereciam atenção de comportamento: o resultado
acústico podia pertencer ao veículo anterior; o cache de rodas podia sobreviver
à troca de veículo e impedir uma atualização solicitada.

## Correções e limites

- [Providers](../frontend/src/contexts/AuthContext.jsx) e
  [tour](../frontend/src/contexts/TourContext.jsx) exportam seus componentes.
  [useAuth](../frontend/src/contexts/useAuth.js) e
  [useTour](../frontend/src/contexts/useTour.js) concentram os contextos/hooks;
  consumidores e testes foram atualizados. Login, cadastro e permissões mantidos.
- Removidos upload/duração/estados não lidos, cálculo sem consumidor e handler
  antigo de convite duplicado. O cartão ativo de convite e a reserva continuam
  com seus próprios fluxos. O valor padrão de margem foi preservado.
- Opções sem efeito foram retiradas dos parâmetros/call sites. A cor opcional
  de borda do `SpotlightCard` passou a ser aplicada quando fornecida; o estilo
  padrão e a possibilidade de passar `style` continuam preservados.
- O tour já usa rolagem instantânea; foi retirada uma consulta de movimento
  reduzido cujo resultado não era usado, sem introduzir animação de rolagem.
- Os componentes `EngineAcousticScanner.jsx` e `TireDepthScanner.jsx` continuam
  **fora das telas e rotas ativas**. Corrigir seus efeitos não disponibiliza
  scanner de pneus, diagnóstico acústico nem certificação. Exemplos legados
  permanecem sem homologação; não são funcionalidades oferecidas pelo sistema.
- As regras do ESLint permaneceram iguais. Não foram acrescentados `eslint-disable`,
  exclusões de arquivos ou nomes prefixados apenas para ocultar os avisos.

## Verificação desta revisão

- `npm run lint -- --max-warnings 0`: **zero erros e zero avisos**, contra 161 antes.
- `npm test`: **290 testes frontend aprovados**, incluindo três regressões novas
  de contexto compartilhado, resposta atrasada/cancelamento e cache por veículo.
- `VITE_DEMO_MODE=true VITE_BASE_PATH=/Automatch/ npm run build`: build local
  aprovado, com a cópia `404.html`.
- [Regressões de manutenção](../frontend/tests/test_maintenance_regressions.mjs)
  usam React em Node, API controlada e fronteiras de animação; os componentes
  legados são montados apenas no teste, sem integrá-los à aplicação.
- Testes antigos que exigiam símbolos/opções sem uso foram ajustados para
  verificar o contrato efetivo, mantendo as verificações de selo sem estrela,
  destaque, autenticação, B2B e rolagem instantânea.
- Backend não modificado nem reexecutado nesta revisão. Os 109 unittest e cinco
  jornadas da etapa anterior continuam como evidência histórica, não nova execução.
- `git diff --check`, links locais da documentação e preservação do workflow
  exclusivamente manual de Pages conferidos antes da publicação nas duas `main`.

Zero avisos de lint não comprova ausência de outros defeitos. Inspeção visual,
leitor de tela, desempenho em dispositivos, integrações reais e disponibilidade
de Torch/YOLO no Windows continuam sujeitos aos limites já documentados em
[testes e evidências](testes-e-evidencias.md).
