# Auditoria e correções de scanner, vídeo e banco — 19/11/2026

Base examinada: `f45498b`. Trabalho em `fix/auditoria-banco-frontend-20261118`,
sem deploy ou envio às main. A fase 1 foi somente leitura, com as exceções
autorizadas de backup/restauração e inferência isolada. A fase 2 foi autorizada
pelo responsável; a aplicação no banco real e a remoção da cópia também receberam
autorização expressa.

## Scanner: causa raiz e comportamento corrigido

O checkpoint `backend/yolov8n.pt` tem 80 classes COCO, para objetos genéricos.
Ele reconhece veículos; não foi treinado para riscos, amassados ou pintura.
O método anterior combinava esse reconhecimento com bordas/texturas de
Canny/Laplaciano/Sobel. Isso não segmentava lataria nem distinguia reflexo,
fresta, vidro, placa, asfalto e dano. Coordenadas calculadas pela heurística
não eram localização comprovada de uma lesão.

Havia uma segunda causa independente: `car_context.damages` era convertido
diretamente em pontos, custos e pontuação fixos. A tela enviava seus próprios
apontamentos ao reescanear. A ausência de dano na foto não impedia o retorno
de uma avaria, pois o contexto pulava a análise da região.

No Tracker `sc-004`, o catálogo trazia um risco de 1,8 cm no retrovisor,
com marcador x=42%, y=46%, sem medição. A tela enviava esse texto ao scanner;
a rotina retornava outro marcador fixo, x=35%, y=55%, custo R$ 350 e score 91.
A confiança apresentada vinha do reconhecimento do veículo, não do dano.
O recorte do ponto original incidia em capô/farol, sem a avaria alegada.
O caso foi reproduzido no Linux com os mesmos bytes de imagem.
No Pulse, o contexto também fabricava um ponto; o detalhe estético alegado
não tem gabarito validado e permanece duvidoso.

A correção removeu a inferência de dano por texto/bordas e seus custos/scores,
sem exceção por marca ou modelo. Os apontamentos fictícios do catálogo foram
retirados **depois de corrigida a lógica**. Também foram eliminados:
retorno padrão aprovando imagem inválida, placeholder usado como foto de análise,
conversão de confiança COCO em confiança de avaria, projeção de um dano em oito
ângulos, aprovação visual de foto anexada por simples detecção de objeto e a
rotina Gemini genérica sem calibração que não tinha consumidor válido.

### Cadeia atual, entradas e consumidores

| Etapa | Código e comportamento |
| --- | --- |
| Anúncio | [ShowcaseVehicleDetails](../frontend/src/pages/ShowcaseVehicleDetails.jsx): usa a foto de capa do anúncio atual; não analisa automaticamente a galeria inteira. O contexto contém ID/dados do carro, sem apontamentos herdados |
| Navegador | Canvas mantém proporção, reduz maior dimensão a 1024 e JPEG a 0,8; falha não troca pela foto de outro veículo |
| Entrada API | [ai_vision](../backend/routers/ai_vision.py): arquivo/base64/URL permitida/mídia local, limites e proteção de caminhos existentes. Imagem ausente ou inválida retorna 422 |
| Pré-processamento | [ai_service](../backend/services/ai_service.py): orientação EXIF, thumbnail proporcional até 1024, JPEG 80. Compressão falha não transforma bytes inválidos em sucesso pericial |
| Modelo | YOLOv8n local, carregado sem download automático. Confiança 0,15 serve ao reconhecimento de car/truck/bus/motorcycle, não é limiar calibrado de dano |
| Resultado | [inspection_contract](../backend/services/inspection_contract.py): versão 2, hash da imagem analisada, ID quando disponível, data UTC, método/versão e motivo. Sem detector calibrado, inconclusivo; pontos vazios e score/confiança de dano nulos |
| Cadastro | [NewCarAdForm](../frontend/src/pages/NewCarAdForm.jsx): salva contrato completo em `cars.laudo_feedback.visual_inspection`; troca de foto invalida resposta antiga. Erro tem aviso e Tentar novamente |
| Foto anexada | [uploads](../backend/routers/uploads.py): análise visual separada de avaliação de documento; não aprova laudo por reconhecer um veículo |
| Anúncio/360° | [visualInspection](../frontend/src/utils/visualInspection.js) e [Vehicle360Viewer](../frontend/src/components/vehicle/Vehicle360Viewer.jsx): pontos somente de resultado validado; não usar ausência de pontos como “100% íntegro”. Resultado de outro ID/foto não é reutilizado |
| Consultor local/API | [AIChatBox](../frontend/src/components/vehicle/AIChatBox.jsx), [aiConsultantCore](../frontend/src/utils/aiConsultantCore.js) e ai_vision: recebem resumo normalizado. Apontamento enviado pelo cliente não certifica avaria; falta de evidência não aprova |
| Dossiê e PDF | [OfficialDossierModal](../frontend/src/components/vehicle/OfficialDossierModal.jsx), [laudos_export](../backend/routers/laudos_export.py), [pdf_generator](../backend/services/pdf_generator.py): estado visual coerente e aviso de vistoria, sem score inventado. Prévia enviada pelo cliente é normalizada |
| Filtros/relatórios | Não havia filtro de scanner ativo nem coluna própria de inspeção por foto. Não foi criado filtro baseado em resultado fictício. Status documental informado pelo anunciante é distinto de inspeção visual automática |

A interface tem os três rótulos: avaria detectada com alta confiança, análise
inconclusiva e nenhuma avaria detectada na análise automática. Os dois estados
conclusivos exigem método de dano validado; **o método atual não os emite**.
O resultado neutro não é uma garantia de ausência de avaria e informa que a
análise por imagens não substitui a vistoria presencial.

No banco real havia zero `laudo_feedback` preenchidos: nenhum resultado salvo
precisou ser reprocessado. Dados legados recebidos por cliente não são convertidos
em evidência. O scanner ao vivo do anúncio não grava silenciosamente no banco.

### Auditoria de todos os anúncios e limites de métricas

Foram reanalisadas no Linux as 45 fotos distintas da vitrine: capa + oito
fotografias de cada um dos cinco veículos. Os 31 anúncios reais referenciam
seis capas distintas por hash; as seis foram cobertas na execução, sem contar
reutilização de bytes como 31 inferências independentes.

[Tabela de todas as fotos](scanner-catalogo-resultados.csv), com hash, resultado
anterior sem contexto e resultado corrigido. Foram examinadas ainda imagens
de borda/dano e os dois casos com contexto herdado: 55 análises no total.

| Veículo | Fotos da vitrine | Antes sem contexto | Antes com contexto da tela | Depois |
| --- | ---: | --- | --- | --- |
| Corolla Cross sc-001 | 9 | Sem pontos e score fictício alto | Sem apontamento herdado | 9 inconclusivas, zero pontos |
| Polo TSI sc-002 | 9 | Sem pontos e score fictício alto | Sem apontamento herdado | 9 inconclusivas, zero pontos |
| HB20 sc-003 | 9 | Sem pontos e score fictício alto | Sem apontamento herdado | 9 inconclusivas, zero pontos |
| Tracker sc-004 | 9 | Sem pontos e score fictício alto | Um ponto fabricado a partir do risco do cadastro | 9 inconclusivas; contexto não cria ponto |
| Pulse sc-005 | 9 | Sem pontos e score fictício alto | Um ponto fabricado; alegação estética sem gabarito | 9 inconclusivas; contexto não cria ponto |

Os arquivos chamados “controle sem danos”/“não é carro” mostram edifícios e
montanhas, respectivamente; não são um gabarito de carro limpo. O arquivo
“para-choque danificado” tinha os mesmos bytes da capa do Polo. Nomes de arquivo
não foram usados como verdade de referência.

**Precisão, revocação e taxa formal de falsos positivos antes/depois não são
estimáveis com rigor para o catálogo**, pois falta gabarito completo revisado.
O falso positivo reproduzido do Tracker foi removido; zero acusações na rotina
corrigida mede abstinência, não acurácia de detecção. Casos duvidosos, inclusive
o detalhe alegado do Pulse e defeitos sutis/reflexos, exigem decisão humana.
Não declarar 100% de precisão ou “veículos sem avarias”.

Após autorização adicional, foram feitos três treinos e testes com HTTP/banco.
Os resultados não habilitam um detector no produto:
[relatório de treinamento](treinamento-avarias-2026-11-19.md).

## Vídeos: divergência e correção

A legenda era controlada por `currentTime/onTimeUpdate` no player, não por uma
faixa WebVTT. O texto descrevia frente/laterais/traseira, enquanto os primeiros
quatro MP4 mostravam frente diagonal, traseira e frente diagonal nos instantes
2,5/10/17,5 s. O Pulse mostrava frente, frente e frente. Todos tinham 20 s,
portanto não se tratava simplesmente de duração antiga.

O checklist retornado pelo upload descrevia ainda outra sequência, terminando
em interior/motor; textos de ajuda/tour repetiam versões diferentes. O mapeador
de mídia aceitava prefixo numérico de UUID e fallback por nome, podendo emprestar
fotos 360° de outro anúncio.

A fonte única é [shared/pericial-timeline.json](../shared/pericial-timeline.json):
frente 0–5 s, laterais 5–15 s, traseira 15–20 s. O trecho central usa lateral A
e B; não se afirma esquerda/direita anatômica a partir de imagens sintéticas.
O [mapa visual](pericial-angle-map.json) registra as fotos por ID.
Consumidores frontend/backend são gerados por
[sync_pericial_timeline.py](../scripts/sync_pericial_timeline.py), conferidos por
hash/testes, para manter os contextos Docker existentes.

Os quatro vídeos válidos foram regenerados a partir do próprio conjunto:
0°/90°/270°/180°. Há movimento suave dentro de cada foto, transição curta por
preto nas fronteiras de 5/15 s e dissolvência somente entre as duas laterais,
sem misturar frente/traseira com fase errada. Em 10 s pode aparecer a
dissolvência entre laterais; não é dano nem reconstrução 3D.
Nenhum guia novo de envio ou análise automática de conteúdo foi adicionado.
Limites, extensões, tamanho e tolerância de duração do upload foram preservados. A tolerância existente é 0,9 s; se OpenCV não consegue medir, a rotina legada aceita o arquivo e usa duração estimada. Isso não equivale a validar conteúdo ou duração de todo arquivo recebido e não foi alterado fora do escopo autorizado.

| Anúncio | Duração | Bytes | 2,5 s | 10 s | 17,5 s | Formato |
| --- | ---: | ---: | --- | --- | --- | --- |
| sc-001 | 20.0 s | 379,378 | Frente | Transição entre laterais | Traseira | H.264, 1280×720, 24 fps, faststart |
| sc-002 | 20.0 s | 459,649 | Frente | Transição entre laterais | Traseira | H.264, 1280×720, 24 fps, faststart |
| sc-003 | 20.0 s | 415,601 | Frente | Transição entre laterais | Traseira | H.264, 1280×720, 24 fps, faststart |
| sc-004 | 20.0 s | 449,010 | Frente | Transição entre laterais | Traseira | H.264, 1280×720, 24 fps, faststart |

Total dos quatro vídeos ativos: 1,703,638 bytes (1.62 MiB). Cada vídeo tem 480 quadros. Pranchas/metadados permanecem fora do Git. O Pulse
continua sem uma traseira válida; não foi inventado ou emprestado um vídeo.
Seu vínculo foi retirado do catálogo/seed e do banco real por reparo guardado,
idempotente e reversível. O arquivo físico anterior foi preservado, conforme
a restrição de não apagar mídia. Ausência/erro agora mostra vídeo indisponível,
sem simular uma filmagem aprovada.

## Banco real, cópia e preservação

[Relatório completo do PostgreSQL](verificacao-banco.md). Migrações 006/007/008
aplicadas após ensaio e backup; defaults de conta comum corrigidos, dez subpapéis
indevidos retirados. Nenhum cadastro de cliente ou registro [TESTE] da origem
foi excluído. Candidatos a duplicidade não foram apagados sem prova/decisão.

A cópia foi usada também nos casos HTTP e, após novo backup e encerramento das
conexões, foi removida por autorização expressa. O banco real foi reconsultado:
31 carros, 42 usuários, oito lojas, 15 tabelas, zero órfãos nas 25 FKs,
migração 008. Contêineres, volume, uploads e backups foram preservados.
O servidor de experimento foi parado; a origem não recebeu dados dos casos HTTP.

## Validações efetivamente executadas

| Etapa | Frontend | Backend |
| --- | --- | --- |
| Antes das correções | 284 testes | 111 unittest + cinco jornadas |
| Depois do banco | 284 | 114 + cinco jornadas |
| Depois do scanner | 288 | 118 + cinco jornadas |
| Depois de vídeo/reparo de mídia | 288 | 121 + cinco jornadas |
| Depois dos experimentos | 288 | 124 + cinco jornadas |

Também: lint sem erros/avisos de código e build frontend; conferência dos
consumidores gerados; quatro MP4 de 20,0 s com tolerância de um quadro para o
teste de geração; hashes por tomada; resposta 422 para imagens inválidas;
reparos ensaiados com rollback e repetição; 20 cenários HTTP protegidos e
avaliação de inferência em duas resoluções.

As primeiras execuções de regressão falharam, e os logs foram mantidos:
testes antigos exigiam scores inventados, danos herdados de texto ou imagens
fictícias/ausentes. Três testes condicionais não executavam suas asserções no
Windows. Foram substituídos por casos com arquivos existentes e contratos de
evidência, não apenas removidos para obter verde. O checklist de vídeo passou
a verificar os três intervalos canônicos em vez das quatro fases divergentes.

O plugin ESLint ainda imprime uma mensagem de configuração sobre versão do
React não especificada; não são avisos de código desativados. O Torch instalado
no Windows mantém erro `shm.dll/WinError 126`; a inferência real e os treinos
foram executados no Linux, não apresentados como execução nativa Windows.

O PDF de teste foi gerado, lido e renderizado com Windows.Data.Pdf: uma página,
sem corte/sobreposição observados, estado inconclusivo e sem score fabricado.
Foram extraídos e conferidos os quadros dos vídeos; **a conferência do usuário
sobre as pranchas ainda não ocorreu**. A automação de navegador foi tentada,
mas retornou `browser access host unavailable` e pipe nativo indisponível.
Logo, não há alegação de navegação visual completa ou homologação de
acessibilidade. Não foi executado compose contra a origem para “validar” via
startup que poderia escrever; o teste com API/HTTP usou a imagem existente,
código atual somente para leitura e cópia PostgreSQL.

## Evidências e repetição

Pasta externa, preservada:
`C:/Users/Usuario/AppData/Local/Temp/automatch-audit-20261118-1795035737884`.

- Diagnóstico original: `diagnostico-fase1.md`, `verificacao-banco-fase1.md`.
- Scanner: `scanner-linux-results.json`, `scanner-after-linux-results.json`,
  recortes `tracker-marcador-fixo-42-46.png` e `tracker-saida-contexto-35-55.png`.
- Vídeos: `video-metadata.json` anterior; `video-final-metadata.json` atual;
  `regenerated-videos/*-verification.png` com 2,5/10/17,5 s e quadros de fronteira.
- Banco: backups PGDMP, manifestos de rollback, `real-repairs-result.json`,
  `media-repairs-result.json`, `final-real-database-verification.json`,
  `copy-removal-result.json`.
- Testes: logs baseline, after-database, after-scanner, after-video,
  after-experiments e delivery; tentativas com falha foram preservadas.
- PDF: `dossie-visual-corrigido.pdf`, `dossie-visual-corrigido.png` e
  `damage-training/http-usecases-final/dossie-http.pdf`.
- Treino: dados grandes, checkpoints, curvas e saídas brutas em `damage-training`.

Comandos usuais: `python run_tests.py` no backend; `npm test`,
`npm run lint`, `npm run build` no frontend; `python -B
scripts/sync_pericial_timeline.py --check` na raiz. Para repetir a consulta
somente leitura, usar [verify_database_readonly.sql](../scripts/verify_database_readonly.sql)
via psql com `ON_ERROR_STOP=1`, sem iniciar o backend. Para gerar mídias,
usar `scripts/generate_demo_videos.py --evidence <pasta-externa>`, com ffmpeg já
instalado e backup preservado. Não executar ferramentas experimentais na origem.

## Decisões pendentes

1. Revisão humana das marcações/danos duvidosos e das pranchas de vídeo.
2. Dados reais autorizados, gabarito especializado e teste independente antes
   de calibrar/ativar um detector de avarias.
3. Substituir o conjunto incompleto do Pulse e gerar seu vídeo somente depois.
4. Conferência visual manual do site, enquanto a automação estiver indisponível.
5. Aprovar merge e push para as duas main. Os hashes remotos continuam `f45498b`;
   a branch extra do secundário foi preservada. Nenhum deploy foi acionado.
