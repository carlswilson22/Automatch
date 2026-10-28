# Guia de Contribuição — Automatch™

Este projeto adota um fluxo de trabalho estruturado, com branches temáticas, commits semânticos, testes automatizados e pull requests rastreáveis.

---

## 1. Fluxo de Trabalho (Git Workflow)

1. **Escolha ou Crie uma Issue**: Toda alteração no código ou documentação deve estar vinculada a uma Issue aberta com critérios de aceitação definidos.
2. **Crie uma Branch Padronizada**:
   - `feature/<numero-issue>-descricao`: Implementação de novas funcionalidades ou requisitos.
   - `fix/<numero-issue>-descricao`: Correção de bugs ou divergências funcionais.
   - `docs/<numero-issue>-descricao`: Atualizações de documentação, ADRs ou relatórios.
   - `chore/<numero-issue>-descricao`: Tarefas de manutenção, dependências ou infraestrutura.
3. **Desenvolva com Testes**:
   - Escreva testes unitários/integração para novas rotas ou componentes.
   - Execute a suíte de testes antes de comitar: `npm test` no frontend e suíte de integração no backend.
4. **Commits Semânticos**:
   - `feat: adicionar visualizador orbital 360`
   - `fix: corrigir sincronização de laudo cautelar no scanner`
   - `docs: atualizar relatório da sprint 08`
   - `test: adicionar bateria de testes do consultor IA`
5. **Abra um Pull Request**:
   - Preencha integralmente o `.github/PULL_REQUEST_TEMPLATE.md`.
   - Adicione link para a issue (`Closes #ID`).
   - Apresente evidências de validação (saída de testes, logs de build).
6. **Revisão e Merge**:
   - O merge deve ocorrer somente após a suíte de testes passar 100% e o build de produção (`npm run build`) compilar com sucesso.

---

## 2. Padrões de Código e Qualidade

- **Frontend**: Componentes modulares em React 18, TailwindCSS, hooks organizados e importações limpas.
- **Backend**: FastAPI com tipagem estrita via Pydantic v2, routers desacoplados e logs semânticos.
- **Documentação**: Arquivos Markdown formatados, títulos concisos, tabelas alinhadas e diagramas Mermaid.
- **Comentários**: Códigos devem conter comentários explicativos indicando objetivo e motivo de criação, preservando a manutenibilidade.
