# Backlog atual do Automatch

Atualizado em **17/11/2026**, base examinada `72794b1` (implementação `1b7d094`). Este quadro descreve o código;
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

## Análise das pendências mantidas

Análise de código em 17/11/2026. As prioridades da tabela foram mantidas.
As ações abaixo são propostas de conclusão; não foram implementadas nesta
revisão. Não houve teste de provedores externos ou inspeção visual. Os três
itens de prioridade indefinida foram retirados por solicitação do responsável;
a remoção não significa implementação de suas funcionalidades.

### 1. DETRAN e preenchimento por placa — Alta

**Situação:** as rotas usam bases locais de demonstração. Para placas não
conhecidas, podem gerar identificação, débitos e situação regulares sem
consultar uma fonte externa. No preenchimento por placa, dados conhecidos ou
locais podem vir com `is_simulado=false`, sem comprovar consulta oficial.

**Avaliação:** integração pendente para uso real. Na demonstração, identificar
a origem e evitar apresentar quitação, ausência de sinistro ou “Nada consta”
como verificações realizadas. Ter o veículo cadastrado não permite inferir
sua regularidade externa.

**Próximo passo:** distinguir cadastro, exemplo e consulta externa; informar
“não consultado” ou indisponibilidade quando faltar informação. Conectar um
fornecedor quando o uso real estiver definido.
**Conclusão verificável:** origem e data identificadas, tratamento de placa
desconhecida e indisponibilidade, sem inventar resultado favorável.

Fontes: [DETRAN](backend/routers/detran.py) e
[preenchimento por placa](backend/routers/vehicle_lookup.py).

### 2. Multicanal e feed do estoque — Alta

**Situação:** os canais exibem conexão fixa. A sincronização monta protocolo,
resposta “publicado” e URLs sem solicitar publicação aos provedores. O XML
contém um veículo fixo, em vez de consultar o estoque da loja.

**Avaliação:** a interface demonstra o fluxo, mas não publica anúncios reais.
O feed com dados do banco pode ser feito separadamente da integração com um
portal, permitindo avanço sem credenciais externas.

**Próximo passo:** identificar a simulação, gerar feed com dados autorizados
da loja e implementar o adaptador do fornecedor escolhido. Protocolo gerado
localmente não confirma publicação no portal.
**Conclusão verificável:** feed acompanha alterações do estoque correto;
somente confirmação externa marca publicação real, com falhas informadas.

Fontes: [rotas e XML](backend/routers/integrations.py) e
[interface multicanal](frontend/src/components/vehicle/MultichannelSyncModal.jsx).

### 3. Monitoramento de preço e entrega de alertas — Alta

**Situação:** modelo, migração e rotas de cadastro/listagem por conta existem.
O scheduler verifica uma watchlist DETRAN simulada, sem processar alertas de
preço. Não foi encontrado consumidor que compare os valores e envie mensagens.
O SMTP existente atende recuperação de senha.

A resposta de cadastro e a alternativa local do modal prometem notificação,
embora cadastrar o interesse não execute monitoramento nem entrega.

**Avaliação:** recurso parcialmente implementado. A mensagem pode ser corrigida
independentemente da integração, confirmando registro do interesse sem prometer
que uma rotina de notificação já está funcionando.

**Próximo passo:** definir disparo, tratar veículo removido, permitir desativação,
comparar preço-alvo, controlar reenvios e integrar o canal escolhido. Registrar
tentativas e tratar falhas de entrega.
**Conclusão verificável:** queda válida gera uma entrega; repetir processamento
não duplica a mensagem e falha não vira confirmação de envio.

Fontes: [alertas](backend/routers/alerts.py), [scheduler](backend/tasks.py),
[modal](frontend/src/components/vehicle/PriceAlertModal.jsx) e
[SMTP de recuperação](backend/services/recovery_mail.py).

### 4. Homologação de produção — Alta

**Situação:** o Compose já separa ambientes, exige configuração administrativa,
usa PostgreSQL, volumes e um worker. Há probes e restrições de configuração.
O Nginx de produção versionado escuta HTTP em 80; publicar 443 não instala
certificado. Não há rotina automatizada de backup/restauração versionada.

**Avaliação:** frente de implantação e operação. A infraestrutura externa pode
complementar esses pontos, mas não foi examinada. O HTTPS do Pages não homologa
o servidor FastAPI ou o banco de uma futura instalação.

**Próximo passo:** configurar domínio/HTTPS, acessos, segredos e origens; aplicar
migrações controladas e testar restauração, SMTP e monitoramento. Manter os
acessos públicos do Pages identificados como demonstração.
**Conclusão verificável:** conexão segura, acesso por perfil, migração sem perda
de dados, restauração testada e falhas operacionais visíveis.

Fontes: [Compose de produção](docker-compose.prod.yml),
[Nginx](gateway/nginx.prod.conf) e [probes da API](backend/main.py).

### 5. Alternativas ilustrativas de FIPE e IA — Média

**Situação:** na rota FIPE, indisponibilidade ou ausência de resposta pode
substituir a consulta por um preço/modelo fixos e guardar o resultado no cache
por 24 horas. O laudo associado traz conclusões estruturais fixas que não são
comprovadas pela consulta de preço.

A IA tem caminhos externos e locais distintos. O avaliador heurístico de laudos
já exige conferência quando faltam dados; preservar esse comportamento. Uma
alternativa local pode ser útil, desde que sua origem e limites fiquem claros.

**Avaliação:** melhoria de confiança dos dados. Embora classificada como média,
a identificação de exemplo/indisponibilidade deve acompanhar as correções
imediatas de DETRAN, multicanal e alertas.

**Próximo passo:** identificar origem, referência temporal, método e ausência
de dados; separar preço de mercado de conclusão pericial. Não preencher preço
de outro modelo como se fosse a consulta solicitada.
**Conclusão verificável:** indisponibilidade não produz cotação/aprovação
fictícia; resultados locais e remotos ficam identificáveis.

Fontes: [FIPE e laudo ilustrativo](backend/routers/detran.py),
[visão/chat](backend/services/ai_service.py) e
[avaliação documental](backend/services/laudo_ia_evaluator.py).

### 6. Avisos de manutenção — Média

**Verificação executada nesta análise:** ESLint, com a configuração do frontend,
terminou com **0 erros e 209 avisos**: 196 declarações sem uso, 9 avisos de Fast
Refresh, 2 dependências de efeitos e 2 diretivas ESLint sem necessidade. Esse
resultado é do lint, não de uma execução das suítes de testes.

Os dois avisos de efeitos estão no legado de pneus/acústica, não importado pelas
telas ativas. Detalhes do anúncio concentra 30 avisos, sobretudo código sem uso.

**Avaliação:** manutenção válida, com escopo controlado. O total não representa
209 falhas de comportamento. Adicionar funções a efeitos indiscriminadamente
pode introduzir chamadas repetidas.

**Próximo passo:** limpar imports/variáveis por lotes nas telas ativas, rever
diretivas e separar arquivos quando necessário para Fast Refresh. Avaliar o
isolamento do legado sem ativar scanners fora do escopo.
**Conclusão verificável:** reduzir avisos sem suprimir regras globalmente,
com lint e testes proporcionais aos fluxos alterados.

Fontes: [ESLint](frontend/eslint.config.js),
[detalhes do anúncio](frontend/src/pages/ShowcaseVehicleDetails.jsx) e
[registro de testes](docs/testes-e-evidencias.md).

### 7. Acessibilidade e fluidez — Média

**Situação:** existem mecanismos de teclado/foco em partes do sistema, mas não
são uniformes. Os modais de alerta e multicanal usam bloqueio de rolagem, sem
semântica de diálogo, nome acessível no botão de fechar ou gestão própria de
foco/Escape nesses componentes. O hook de rolagem não fornece essas funções.
Análise estática não mede contraste ou fluidez em um dispositivo real.

**Avaliação:** há trabalho concreto além de uma conferência genérica de aparência.
Lint não demonstra acessibilidade ou desempenho de renderização.

**Próximo passo:** padronizar diálogo, foco inicial/retorno, Tab, Escape e nomes
dos controles; conferir estados vazios/erro e movimento reduzido. Medir anúncio,
360° e hub B2B em dispositivos definidos antes de otimizar.
**Conclusão verificável:** jornadas completas por teclado/leitor de tela, sem
foco perdido; fluidez medida nas condições escolhidas.

Fontes: [modal de alertas](frontend/src/components/vehicle/PriceAlertModal.jsx),
[modal multicanal](frontend/src/components/vehicle/MultichannelSyncModal.jsx) e
[hook de rolagem](frontend/src/utils/useScrollLock.js).

## Sequência recomendada

1. Identificar os estados demonstrativos/indisponíveis de DETRAN, FIPE/IA,
   multicanal e alertas, evitando confirmar operações que não ocorreram.
2. Corrigir os problemas objetivos de acessibilidade e limpar avisos por lotes,
   verificando os fluxos atingidos.
3. Implementar os serviços externos selecionados e concluir o monitoramento
   de preço, com confirmação e tratamento de falhas reais.
4. Homologar o ambiente operacional quando houver uma instalação real definida.

Essa sequência melhora a apresentação atual e prepara a operação, sem tratar
integrações externas ainda pendentes como trabalho concluído.

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
