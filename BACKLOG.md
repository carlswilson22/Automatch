# Backlog atual do Automatch

Atualizado em **17/11/2026**, após as melhorias demonstrativas sobre a base
`444bc09`. Não altera issues ou o quadro acadêmico. Registros anteriores
permanecem no histórico Git e nas [sprints](sprints/README.md).

## Escopo autorizado

O projeto permanece uma demonstração. **Não realizar deploy.** O workflow de
Pages aceita somente acionamento manual e não foi executado nesta atualização.
A reformulação do banco e a preparação da futura operação local dependem de
nova autorização. Nenhuma entidade ORM, migração, banco real ou arquivo privado
`.env` foi alterado. As verificações usam dados descartáveis.

## Implementações desta revisão

| Área | Resultado verificável | Limite preservado |
| --- | --- | --- |
| DETRAN/placa | Origem explícita; amostras identificadas; placa desconhecida não recebe identificação ou regularidade inventada; cadastro local reflete edições | Sem fornecedor oficial |
| FIPE/laudo | Sem cotação fixa de outro modelo; cache considera código e ano; preço não aprova estrutura; ausência fica indisponível | Referência cadastrada ou BrasilAPI, conforme o fluxo |
| Consultor e dossiê | Dados ausentes não viram pintura original, ausência de avarias, quitação, garantia ou inspeção mecânica; PDF identificado como demonstrativo | Exige conferência dos documentos originais |
| Multicanal | Seleção de canais, prévia, histórico local por conta/veículo e download XML; resposta da API identifica simulação, sem URLs falsas de publicação | Nenhum anúncio enviado a provedores |
| Feed de estoque | XML da API usa catálogo atual, filtro opcional por loja e exclui vendidos e campos privados de repasse; exemplo local usa o veículo escolhido | Sem homologação de importadores externos |
| Radar de preço | Interesse local por conta na demonstração; cadastro confirmado pela API fora dela; simulação da queda mostra o aviso no próprio site | Sem monitoramento contínuo ou entrega WhatsApp/e-mail |
| Diálogos | Semântica, nomes acessíveis, foco inicial/retorno, Tab, Escape e rolagem; requisições canceladas ao fechar | Inspeção visual e leitor de tela ainda manuais |
| Manutenção | Removidos imports, estados e dados substitutos sem uso das telas alteradas | Limpeza por lotes; legado de pneus/acústica permanece inativo |

## Pendências atuais da demonstração

| Prioridade | Item | Critério de conclusão |
| --- | --- | --- |
| Média | Continuar a redução de avisos de manutenção | Remover código sem uso com verificações proporcionais, sem suprimir regras ou ativar legado |
| Média | Conferir acessibilidade e fluidez manualmente | Validar teclado/leitor de tela, contraste e comportamento nos dispositivos escolhidos; medir antes de otimizar |

## Integrações futuras, fora da implementação atual

Os itens abaixo dependem de definição e autorização para uma operação real.
Não são bloqueios para apresentar os exemplos atuais nem serviços concluídos.

- Contratar fonte de DETRAN/placa e validar origem, competência e indisponibilidade.
- Conectar provedores multicanal com confirmação externa e tratamento de falhas.
- Definir monitoramento de preços, consentimento, desativação e entrega sem duplicação.
- Homologar fontes/IA e verificar evidências antes de certificar qualquer resultado.
- Planejar a reformulação do banco para execução local quando houver autorização.
- Considerar implantação/homologação operacional somente mediante nova decisão.

Os três itens antes classificados com prioridade indefinida continuam removidos;
essa remoção não significa implementação. Scanner/reescaneamento de pneus e
acústica não fazem parte do escopo ativo.

## Evidências e sincronização

Ver [testes e limites](docs/testes-e-evidencias.md),
[estado atual](docs/estado-atual.md) e [requisitos](docs/requisitos.md).
Publicar o mesmo resultado nas duas `main`, preservando todas as demais branches
do secundário, conforme o [procedimento](docs/sincronizacao-repositorios.md).
Enviar commits não autoriza acionar o workflow manual de Pages.