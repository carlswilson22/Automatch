# Documentação do Automatch

Revisão documental: **17/11/2026**. Melhorias demonstrativas sobre a base `444bc09`.
O principal é [carlswilson22/Automatch](https://github.com/carlswilson22/Automatch);
o secundário é [CAMPUSCEUB/ADS-AUTOMATCH](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH).
Ambos devem receber a mesma atualização na `main`; outras branches do secundário
permanecem intactas.

## Referências atuais

| Documento | Finalidade |
| --- | --- |
| [Estado atual](estado-atual.md) | Recursos ativos, demonstrações, integrações e exclusões |
| [Requisitos](requisitos.md) | RF/RNF com situação e critérios verificáveis |
| [Arquitetura](arquitetura.md) | Componentes, dados, serviços e limites de implantação |
| [Banco de dados](../DOCUMENTACAO_BANCO_DE_DADOS.md) | Entidades, relações e migrações |
| [Escopo dos arquivos](../ESCOPO_DOS_ARQUIVOS.md) | Inventário de arquivos técnicos e responsabilidades |
| [Configuração e execução](configuracao-e-execucao.md) | Docker, ambiente local, produção e arquivos `.env` |
| [Testes e evidências](testes-e-evidencias.md) | Comandos, resultados históricos e limites de verificação |
| [Backlog](../BACKLOG.md) | Pendências reais, sem marcar integração simulada como concluída |
| [Sincronização dos repositórios](sincronizacao-repositorios.md) | Publicação principal e secundária somente na `main` |
| [Contribuição](../CONTRIBUTING.md) | Fluxo de alteração, documentação e validação |
| [Segurança](../SECURITY.md) | Controles, limitações e reporte reservado |
| [Changelog](../CHANGELOG.md) | Mudanças atuais e registros de ciclos anteriores |

## Limpeza de arquivos — 18/11/2026

[Relatório de remoções e preservações](limpeza-arquivos-2026-11-18.md): 15 módulos
sem uso, quatro dependências e duas funcionalidades legadas retiradas. Auditoria
permanente de imports adicionada ao `npm test`; documentação histórica preservada.

## Revisões anteriores da demonstração

A [análise sobre o código `ffe60e2`](revisao-pendencias-demo-2026-11-17.md)
registra cinco problemas reproduzidos, suas fontes e critérios de correção.
O complemento de conclusão registra as cinco correções e seus testes permanentes.
A correção A1–A5 passou em 287 testes frontend, 109 unittest backend e cinco jornadas.
A [manutenção posterior](manutencao-avisos-2026-11-17.md) passou em 290 testes
frontend, build local e lint sem erros/avisos; backend não reexecutado nessa etapa.
Ver [evidências e limites](testes-e-evidencias.md). Sem deploy ou reformulação do banco.

## Documentação acadêmica e histórica

- [ADRs](decisoes/README.md): decisões registradas e ressalvas de implementação atuais.
- [Sprints](../sprints/README.md): planejamento e relatos dos ciclos 00 a 08.
- [Entregas](../entregas/README.md): relatórios acadêmicos dos marcos 01 a 03.
- [Reuniões](reunioes/README.md): atas preservadas, sem inventar novas reuniões.
- [Protótipo](prototipo/README.md): referência visual e links informados do Figma.
- [Auditoria de 16/11/2026](auditoria-2026-11-16.md): correções e verificações anteriores.
- Demais auditorias e relatórios de teste possuem aviso de registro histórico.
  Datas, participantes, métricas e aprovações antigas não constituem nova
  execução de testes, certificação ou descrição automática da versão atual.

## Como manter estes documentos

Atualizar primeiro estado/requisitos quando o comportamento mudar; ajustar
arquitetura/banco se afetados e registrar a mudança no changelog. Relatórios
históricos recebem complementos datados, sem reescrever evidências anteriores.
Resultados de testes devem informar comando, commit, ambiente e limitações.

A primeira revisão de 17/11 foi documental; a etapa seguinte corrigiu os exemplos
interativos e os comportamentos descritos no backlog, sem deploy ou reformulação
do banco. Não implementou serviços externos, scanner de
pneus, diagnóstico acústico ou pagamentos reais. As
licenças e as mídias de teste foram preservadas. Veja os
[critérios de evidência](testes-e-evidencias.md).
