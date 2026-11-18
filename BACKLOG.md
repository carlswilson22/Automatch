# Backlog atual do Automatch

Atualizado em **17/11/2026**, após as melhorias demonstrativas sobre a base
`444bc09`. Não altera issues ou o quadro acadêmico. Registros anteriores
permanecem no histórico Git e nas [sprints](sprints/README.md).

## Correções das pendências confirmadas

Os cinco problemas reproduzidos na base `ffe60e2`, registrados no commit
documental `fd229c3`, foram corrigidos nesta implementação autorizada.
O [relatório](docs/revisao-pendencias-demo-2026-11-17.md) preserva os achados
originais e recebe um complemento de conclusão com testes permanentes.

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
| Consultor e dossiê | Anúncio, comparador e PDF preservam laudo, débitos, leilão e ausência de FIPE; snapshot/validação não criam quitação | Dados do anunciante exigem conferência dos documentos originais |
| Multicanal | Seleção de canais, prévia, histórico local por conta/veículo e download XML; resposta da API identifica simulação, sem URLs falsas de publicação | Nenhum anúncio enviado a provedores |
| Feed de estoque | XML da API usa catálogo atual, filtro opcional por loja e exclui vendidos e campos privados de repasse; exemplo local usa o veículo escolhido | Sem homologação de importadores externos |
| Radar de preço | Interesse local por conta na demonstração; cadastro confirmado pela API fora dela; simulação da queda mostra o aviso no próprio site | Sem monitoramento contínuo ou entrega WhatsApp/e-mail |
| Diálogos | Semântica, nomes acessíveis, foco inicial/retorno, Tab, Escape e rolagem; requisições canceladas ao fechar | Inspeção visual e leitor de tela ainda manuais |
| Manutenção | Removidos imports, estados e dados substitutos sem uso das telas alteradas | Limpeza concluída sobre os consumidores atuais; legado de pneus/acústica retirado |

## Pendências A1–A5 concluídas

| Item | Comportamento corrigido | Evidência |
| --- | --- | --- |
| A1 | Mapeamento único preserva dados negativos e ausentes; cadastro começa sem aprovação presumida; anúncio/comparador usam os dados recebidos | Regressões de dados e componentes em `test_confirmed_pending_fixes.mjs` |
| A2 | Rota completa não fabrica FIPE/código/quitação; cadastro prevalece sobre payload; snapshot e validação mantêm ausência e km zero | Seis testes HTTP/PDF em `test_confirmed_pending_fixes.py` |
| A3 | Favoritos consomem os campos canônicos; 42.000 km permanecem iguais no anúncio e na comparação | Renderização dos favoritos e dados enviados ao comparador |
| A4 | Listas por conta, atualização na troca de sessão e importação explícita; dados legados/visitante preservados | Login/logout, duas contas, importação na tela, evento de outra conta e falha de gravação |
| A5 | Cadastro local só autentica depois de salvar conta e sessão; quota/corrupção não confirmam sucesso; cache opcional da API é distinto | Falha, repetição, login posterior, duplicata, recusa da API e rollback de sessão parcial |

## Manutenção concluída

Os 161 avisos de ESLint foram tratados: **zero erros e zero avisos**, sem
desativar regras. Providers/hooks separados, código sem consumidores removido
e efeitos legados corrigidos sem integrar esses recursos às telas.
Ver [causas, mudanças e evidências](docs/manutencao-avisos-2026-11-17.md).

## Limpeza concluída — 18/11/2026

Removidos 15 módulos frontend sem consumidores, quatro dependências e o legado
de pneus/acústica (componentes, rotas e funções). A auditoria de imports passou
para `npm test`; os 85 módulos restantes são alcançáveis. Mídia, fixtures,
licenças, histórico e recursos ativos preservados. Ver [relatório](docs/limpeza-arquivos-2026-11-18.md).

## Pendências atuais da demonstração

| Prioridade | Item | Critério de conclusão |
| --- | --- | --- |
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