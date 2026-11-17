# Protótipo visual do Automatch

Atualizado em **17/11/2026**, código de referência `1b7d094`.
O protótipo é uma referência de design; não comprova que cada tela ou integração
esteja implementada. Os links abaixo foram preservados da documentação do
projeto e não receberam nova inspeção externa nesta revisão.

## Links informados

| Artefato | Acesso |
| --- | --- |
| Design no Figma | [Abrir design](https://www.figma.com/design/O0idlMRlPkxnmLzbPVQjY7/Pr%C3%B3tipo-Automatch?t=VME6ovfehwIe4vmL-0) |
| Protótipo navegável | [Abrir protótipo](https://www.figma.com/proto/O0idlMRlPkxnmLzbPVQjY7/Pr%C3%B3tipo-Automatch?t=EXzmIrlbqRdvcOC5-1&scaling=scale-down&content-scaling=fixed&page-id=0%3A1&node-id=65-108375&starting-point-node-id=65%3A108375) |

CEUB, ADS, Projeto Integrador. Equipe registrada: Carlos Wilson, Matheus Porto,
Paulo Arthur e Vinicius Aurelio. Principal:
[carlswilson22/Automatch](https://github.com/carlswilson22/Automatch); secundário:
[CAMPUSCEUB/ADS-AUTOMATCH](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH).

## Jornadas e correspondência atual

| Jornada/tela | Rota ou componente | Requisito relacionado |
| --- | --- | --- |
| Inicial e vitrine | `/`, `/encontrar` | RF-05 e RF-24 |
| Anúncio e galeria orbital | `/encontrar/:id`, `Vehicle360Viewer` | RF-02 e RF-07 |
| Vídeo e análise de lataria | `PericialVideoViewer`, `AutomatchScan` | RF-01 e RF-27 |
| Dossiê e validação pública | `OfficialDossierModal`, `/validar/:protocolo` | RF-21 e RF-22 |
| Comparação, TCO e financiamento | Ferramentas do anúncio | RF-10 e RF-28; estimativas locais |
| Login, cadastro e perfil | `/login`, `/perfil` | RF-19 e RF-23 |
| Favoritos | `/favoritos` | RF-25, persistência local |
| Anunciar e consultar anúncios próprios | `/novo-anuncio`, `/meus-anuncios` | RF-16 e RF-17 |
| Lojista e rede B2B | `/dashboard`, hub de parcerias | RF-18 |

A tabela usa os IDs da [especificação atual](../requisitos.md); não reutiliza
os antigos números divergentes do protótipo como se fossem novos requisitos.
O vídeo tem roteiro de 20 segundos; sem filmagem, o player pode mostrar uma
representação demonstrativa. PDF Automatch não é certidão oficial.

## Diretrizes de conferência

Predominam fundo escuro, azul de ação e cores de situação. Tokens, tipografia,
contraste e comportamentos devem ser conferidos nos componentes/styles e nos
aparelhos escolhidos para homologação. Suporte pontual a teclado, foco e movimento
reduzido não comprova certificação WCAG AAA.

Validar navegação, estados vazios/erro/carregamento, diálogos, textos e fotos
manualmente. Não apresentar scanner de pneus/diagnóstico acústico como telas
entregues. Canais multicanal, dados DETRAN e notificações têm os limites descritos
no [estado atual](../estado-atual.md). O protótipo continua centralizado nesta
pasta; demais documentos devem apontar para esta referência.
