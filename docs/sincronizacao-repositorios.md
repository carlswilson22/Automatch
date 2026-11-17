# Sincronização dos repositórios Automatch

Decisão do responsável pelo projeto, registrada em **17/11/2026**:

- Principal: `https://github.com/carlswilson22/Automatch.git` (`origin`).
- Secundário: `https://github.com/CAMPUSCEUB/ADS-AUTOMATCH.git` (`secundario`).
- Toda atualização da `main` do principal deve ser publicada também na `main`
  do secundário, incluindo código, documentação e configurações versionadas.
- **No secundário, alterar somente a `main`. Não criar, mover ou excluir outras
  branches. Não usar push com force, mirror, all ou envio indiscriminado de tags.**

## Procedimento de publicação

No checkout do principal, com alterações revisadas e commit registrado:

```sh
git remote -v
git fetch origin
git fetch secundario
git status --short
git rev-list --left-right --count origin/main...secundario/main
```

Se o secundário não tiver commits exclusivos e a atualização for fast-forward:

```sh
git push origin main:main
git push secundario main:main
```

Usar refspec explícito limita o destino à `main`. Não substituir por comandos
que publiquem todas as branches. Conferir os dois passos; sucesso no principal
não significa que o secundário tenha recebido o commit.

```sh
git fetch origin
git fetch secundario
git rev-parse HEAD origin/main secundario/main
git ls-remote --heads secundario
```

Os três hashes devem coincidir quando a sincronização estiver completa.
Comparar também as referências não-main do secundário quando necessário para
comprovar sua preservação. Tokens, permissões e configurações do GitHub Actions
são específicos de cada repositório; não são copiados por um push de código.

## Se houver divergência ou bloqueio

Ler os commits exclusivos e integrar o trabalho na `main` sem apagar histórico.
Resolver conflitos com conferência dos autores/conteúdos quando necessário.
Não forçar o secundário a acompanhar o principal. Se houver proteção de branch
ou falta de permissão, informar o bloqueio e usar o fluxo permitido pelo
repositório para atualizar a própria `main`, preservando as demais branches.

A sincronização aqui é parte do procedimento de publicação. Não foi instalado
um robô de espelhamento ou token entre organizações. O workflow de Pages
continua restrito ao principal; CI e permissões devem ser conferidos em cada
repositório. Ver [CONTRIBUTING](../CONTRIBUTING.md).
