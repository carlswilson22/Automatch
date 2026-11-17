# Backlog atual do Automatch

Atualizado em **17/11/2026**, referência `1b7d094`. Este quadro descreve o código;
não altera status de issues ou do quadro acadêmico no GitHub. Planejamentos e
relatos anteriores estão nas [sprints](sprints/README.md) e no histórico Git.

## Base implementada

| Área | Evidência de implementação | Limite |
| --- | --- | --- |
| Catálogo/anúncios | Rotas de veículos, publicação, edição e exclusão autorizada | API necessária para persistência central |
| Conta e sessão | JWT, PBKDF2, versão de sessão, perfil e OTP | SMTP precisa de configuração/homologação |
| Análise de lataria/laudo | Serviços de visão/IA, upload e auditoria assistida | Sem certificação de precisão ou perícia oficial |
| 360°, PDF e comparação | Componentes e protocolo/snapshot | Dependem da mídia e qualidade dos dados |
| Rede B2B | Parcerias, reservas, mensagens, fechamento e transações | Operações exigem confirmação da API |
| Alertas | Modelo/rota persistente | Cadastro não equivale a notificação entregue |
| Qualidade | Baterias frontend/backend e CI com migrações/builds | Resultados históricos não significam cobertura de todos os fluxos |

## Pendências de produto e integração

| Prioridade | Item | Critério para avançar |
| --- | --- | --- |
| Alta | Substituir consultas DETRAN/placa simuladas, se contratadas | Fonte autorizada, origem/competência identificadas e erros tratados |
| Alta | Multicanal real e feed do estoque | Provedor escolhido, payload do estoque real e confirmação externa; sem links fictícios de sucesso |
| Alta | Monitorar preço e entregar alertas | Processo periódico, canal autorizado, preferência do titular, teste de entrega e falhas |
| Alta | Homologar produção | Segredos próprios, PostgreSQL, HTTPS, backup/restauração, monitoramento e acesso |
| Média | Revisar alternativas ilustrativas de FIPE/IA | Exibir origem, indisponibilidade e dados insuficientes sem aprovação automática |
| Média | Reduzir avisos de manutenção | Remover código/imports sem uso por lotes; testes proporcionais; não ativar recursos legados por acidente |
| Média | Homologar acessibilidade/fluidez | Dispositivos e navegadores definidos, teclado/leitor de tela e critérios mensuráveis |
| A definir | Pagamento operacional | Provedor e regras escolhidos; manter bloqueio de cobrança em produção até integrar |
| A definir | Favoritos em servidor | Persistência por conta e sincronização entre dispositivos, se desejado |
| A definir | Escala horizontal | Coordenação de scheduler/limites e testes de concorrência/recuperação |

## Fora do escopo ativo

Scanner/reescaneamento de pneus e diagnóstico acústico não estão disponíveis
nas telas atuais. Sua existência como componentes/endpoints legados não os
coloca no conjunto entregue nem cria compromisso de implementá-los.

## Documentação e publicação

Toda mudança publicada na `main` principal deve alcançar a `main` secundária.
Não alterar outras branches no secundário. Ver [procedimento](docs/sincronizacao-repositorios.md).
Registrar requisito afetado, commit, resultado esperado e evidência executada;
não marcar serviço externo como concluído por funcionamento de um mock.
Referências: [requisitos](docs/requisitos.md), [estado atual](docs/estado-atual.md)
e [testes](docs/testes-e-evidencias.md).
