# ADR-008 — Principal e secundário sincronizados somente na main

## Status e data

Adotado por instrução do responsável em **17/11/2026**. Registro documental;
não representa criação de reunião, contratação de serviço ou aprovação externa.

## Contexto

O desenvolvimento principal está em `carlswilson22/Automatch`. O repositório
institucional secundário é `CAMPUSCEUB/ADS-AUTOMATCH`. Na comparação inicial,
a main secundária era ancestral da principal e estava seis commits atrás,
sem commits exclusivos. Outras branches do secundário precisam ser preservadas.

## Decisão

Toda atualização publicada no principal deve ser publicada também na main do
secundário. Usar refspec explícito `main:main`, verificar divergências antes do
envio e confirmar os hashes ao final. No secundário, não criar, alterar ou
excluir outras branches. Não forçar histórico divergente ou usar mirror/all.

## Consequências

O procedimento de entrega inclui confirmação dos dois destinos. Se houver
bloqueio, informar qual repositório ficou pendente; não declarar sincronização
parcial como concluída. Permissões, secrets e execução de Actions pertencem a
cada repositório e não são replicados pelo Git.

A regra foi registrada em `AGENTS.md`, contribuição e templates. Não há robô
de espelhamento instalado; o procedimento de publicação executa a sincronização.
Ver [instruções operacionais](../sincronizacao-repositorios.md).
