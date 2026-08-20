# Segurança e dados sensíveis

Não registre credenciais, senhas, tokens, chaves de API, certificados, dados pessoais ou dados sensíveis neste repositório.

## Boas práticas

- Use variáveis de ambiente para configurações locais.
- Mantenha os arquivos locais fora do Git com o `.gitignore`.
- Revise os arquivos antes de abrir um `pull request`.
- Documente dados de teste sem expor dados reais.

## Incidente

Se uma credencial ou informação sensível for publicada:

1. Avise imediatamente o professor.
2. Remova o segredo do estado atual do repositório.
3. Rotacione a credencial afetada. Considere-a comprometida mesmo após a remoção, pois ela permanece no histórico do Git.
4. Registre o ocorrido e a correção na sprint.
