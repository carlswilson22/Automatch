# Treinamento experimental de avarias — 19/11/2026

Foram executados três treinos por transferência de aprendizagem a partir do
checkpoint local YOLOv8n, sem baixar novos pesos. **O experimento não produziu um
detector confiável e não foi ativado no scanner do produto.** Os checkpoints
treinados existem, mas não sustentam a regra de mostrar avarias somente com alta
confiança. Mais épocas não resolveram a falta de dados representativos.

## Dados e marcações

[Manifesto](damage-training-manifest.json): 51 imagens, classe única `avaria`.
Treino: três imagens sintéticas positivas e 27 imagens do catálogo como negativos
provisórios. Validação: três fotografias de um mesmo veículo danificado com cinco
regiões selecionadas e 18 imagens de outros dois veículos do catálogo. São 30
imagens de treino e 21 de validação; as fotos de um mesmo veículo ficam no mesmo
grupo. Hashes são verificados e o executor rejeita vazamento entre conjuntos.

As marcações são **provisórias e não exaustivas**, feitas a partir de regiões
visíveis; não foram revisadas por perito. Negativos do catálogo significam
ausência de dano óbvio na escala examinada, não comprovação de lataria íntegra.
As três vistas do veículo danificado não são três veículos independentes.
Não existe conjunto independente de teste nem amostra representativa de danos,
condições de iluminação, câmeras, oficinas e modelos reais. Essas limitações
impedem usar os números abaixo como precisão do produto.

As imagens sintéticas foram criadas com a ferramenta integrada `image_gen`:
amassado na porta de hatch prata, riscos no painel traseiro de SUV azul e
para-choque dianteiro rompido de sedan vermelho. [Prompts completos](damage-image-prompts.json).
Os PNGs originais foram preservados em `.codex/generated_images`; as cópias
usadas no experimento estão em `damage-training/synthetic/{dent,scratch,bumper}.png`
na pasta externa de evidências indicada adiante. Não são fotos de veículos do
anunciante nem prova de avaria de qualquer carro do catálogo.

## Ambiente e configurações efetivamente executadas

Imagem Docker do backend já existente, Python 3.11.18, Ultralytics 8.4.201,
Torch 2.15.0, CPU i5-3330, 2 CPUs/2 GiB limitados no contêiner, sem GPU.
Pesos locais preservados; entradas do projeto montadas somente para leitura;
saídas fora do Git. Treinos sem rede ou acesso ao banco.

O primeiro processo encerrou com código 132: Polars exigia AVX2/FMA/BMI não
disponíveis na CPU. A variante `polars[rtcompat]==2.1.0` foi instalada
**somente na pasta de dependências do experimento**, após autorização. Os três
treinos repetidos terminaram com sucesso. Não houve alteração de requirements,
Dockerfile, Compose ou CI; o log da falha inicial foi preservado.

Configurações comuns: imagens 416 px, batch 2, AdamW, lr inicial 0,001, sem AMP,
workers 0, mosaic/mixup desativados. Os dois primeiros usam semente 11; o terceiro,
29. Os pesos `best.pt` e `last.pt`, CSVs por época e hashes foram preservados.

## Métricas nativas retornadas após cada treino

São métricas do pequeno conjunto provisório, com o protocolo interno do
Ultralytics e seu ponto de operação, não limiares de alta confiança calibrados.

| Experimento | Épocas | Camadas congeladas | Precisão | Revocação | mAP50 | mAP50–95 |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| frozen-10-compatible | 10 | 10 | 0.3006 | 0.2000 | 0.2372 | 0.1608 |
| full-10-compatible | 10 | 0 | 0.0026 | 0.6000 | 0.2534 | 0.0643 |
| full-30-compatible | 30 | 0 | 0.0064 | 0.2000 | 0.0044 | 0.0012 |

[Resultados pequenos e hashes](damage-training-results.json).
O experimento com 30 épocas piorou a generalização nesse conjunto; queda da
perda de treino não significa capacidade de identificar danos em anúncios novos.

## Casos com rede e PostgreSQL

Foi iniciado um servidor local em `127.0.0.1:8099`, restrito ao banco
`automatch_audit_20261118_35737885`. A guarda do servidor rejeita outro banco;
o cliente exige essa identificação antes de escrever. Nenhuma escrita de teste
foi feita na origem. Novos anúncios, contas e lojas usaram prefixo [TESTE].
Backups completos precederam os lotes com escrita.

Vinte cenários passaram, incluindo ausência de autenticação, cadastro, login,
senha incorreta, anúncio salvo no PostgreSQL, preço inválido, imagem inválida,
foto anexada sem aprovação de laudo, scanner com contexto legado, consultor,
PDF, vídeo real de 20 s, inferência treinada, anúncio inexistente e caminho
fora da raiz. A bateria foi repetida com a guarda explícita de banco.
Os cinco pedidos de inferência dessa bateria não provam acerto do detector:
o sucesso HTTP valida o fluxo, não a qualidade da predição.

A seguir, 126 chamadas de inferência avaliaram 21 imagens × três modelos ×
duas resoluções explícitas, 416 e 640 px. Foram examinados quatro limiares
a partir das predições obtidas a 0,001; correspondência por IoU ≥ 0,5, uma
predição por região anotada, duplicatas contadas como FP. O conjunto é o
mesmo de validação; não se trata de teste independente.

Um ensaio inicialmente nomeado como 640 usava, na verdade, o tamanho 416
herdado do checkpoint. Isso foi medido no objeto predictor; o ensaio foi
preservado com a identificação corrigida e repetido com 640 explícito.
Não atribuir diferença a uma configuração apenas presumida.

| Modelo | Tamanho | Limiar | TP | FP | FN | Precisão exploratória | Revocação exploratória |
| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: |
| frozen-10-compatible | 416 | 0.25 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| frozen-10-compatible | 416 | 0.5 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| frozen-10-compatible | 416 | 0.8 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| frozen-10-compatible | 416 | 0.95 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| full-10-compatible | 416 | 0.25 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| full-10-compatible | 416 | 0.5 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| full-10-compatible | 416 | 0.8 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| full-10-compatible | 416 | 0.95 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| full-30-compatible | 416 | 0.25 | 0 | 16 | 5 | 0.000 | 0.000 |
| full-30-compatible | 416 | 0.5 | 0 | 5 | 5 | 0.000 | 0.000 |
| full-30-compatible | 416 | 0.8 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| full-30-compatible | 416 | 0.95 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| frozen-10-compatible | 640 | 0.25 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| frozen-10-compatible | 640 | 0.5 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| frozen-10-compatible | 640 | 0.8 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| frozen-10-compatible | 640 | 0.95 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| full-10-compatible | 640 | 0.25 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| full-10-compatible | 640 | 0.5 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| full-10-compatible | 640 | 0.8 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| full-10-compatible | 640 | 0.95 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| full-30-compatible | 640 | 0.25 | 0 | 24 | 5 | 0.000 | 0.000 |
| full-30-compatible | 640 | 0.5 | 0 | 4 | 5 | 0.000 | 0.000 |
| full-30-compatible | 640 | 0.8 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |
| full-30-compatible | 640 | 0.95 | 0 | 0 | 5 | indefinida (sem predições) | 0.000 |

[Resumo completo em JSON](damage-http-evaluation-summary.json).
**Nenhum dos modelos localizou as cinco regiões selecionadas nos limiares
avaliados.** Onde não há predição, a precisão é indefinida, não 100%.
Elevar o limiar eliminou predições em alguns ensaios, mas não criou capacidade
de detectar danos. Os falsos positivos do treino mais longo reforçam que ele
não deve substituir o scanner atual. Como as marcações são parciais, FP aqui
significa ausência de correspondência com as regiões selecionadas, não uma
adjudicação pericial definitiva de toda a foto.

## Reprodução controlada

`backend/tools/train_damage_experiment.py` prepara dados e treina; exige pesos
locais, hashes de origem e saída externa ao repositório.
`damage_usecase_server.py` é ferramenta de experimento, não importada no
`main.py`. `run_damage_usecases.py` verifica os fluxos HTTP e
`evaluate_damage_models_http.py` compara os modelos. Nenhuma ferramenta foi
adicionada ao fluxo publicado ou à inicialização normal da API.

Para uma nova execução, monte o projeto em `/project` e a pasta anterior de imagens sintéticas em `/existing-experiment`, ambos somente para leitura. Monte uma pasta de saída nova e vazia em `/experiment`, separada das imagens originais. Se necessário para esta CPU, monte também a pasta de compatibilidade anteriormente preparada, somente para leitura, em `/experiment/compat`. Exemplo dentro do contêiner de experimento:

```text
python -B /project/backend/tools/train_damage_experiment.py --project /project --synthetic /existing-experiment --output /experiment --weights /project/backend/yolov8n.pt
```

Não repetir o comando no mesmo diretório de resultados sem escolher uma saída
nova: os experimentos e checkpoints anteriores devem permanecer preservados.
Para repetir os casos com banco é necessário restaurar o backup em nova cópia
autorizada; a cópia usada nesta etapa já foi removida após o backup final.
Não apontar essas ferramentas para o banco real.

## Artefatos e próximos passos

Pasta local externa:
`C:/Users/Usuario/AppData/Local/Temp/automatch-audit-20261118-1795035737884/damage-training`.
Contém `results.json`, `runs/*/weights`, `runs/*/results.csv`,
`learning-curves.png`, imagens sintéticas, saídas brutas HTTP e metadados.
Dados grandes, pesos e backups não foram incluídos no Git.

Para avançar: obter fotografias reais autorizadas e diversas; revisar marcações
com especialista; separar veículos de treino, validação e teste; revisar negativos
difíceis; medir precisão/recall por tipo e tamanho de dano e calibrar em dados
independentes. Só então decidir método e limiar de alta confiança. A API do
produto permanece inconclusiva e não afirma ausência de avaria.

Referências do procedimento: [treinamento Ultralytics](https://docs.ultralytics.com/modes/train/), [transferência de aprendizagem](https://docs.ultralytics.com/guides/finetuning-guide/) e [separação e pré-processamento de dados](https://docs.ultralytics.com/guides/preprocessing-annotated-data/). As métricas deste relatório vêm das execuções locais, não dessas páginas.

## Complemento: rastreabilidade do pipeline

O preparador valida origem, grupo, hash e caixas das imagens antes de criar o
dataset. Ele recusa reutilizar uma pasta que já contenha o dataset, as execuções
ou os resultados de um treino; uma tentativa interrompida também deve ser
preservada. O registro inclui o hash dos pesos de partida e identifica os pesos
salvos pelo diretório efetivamente usado pelo treinador. Isso evita associar
métricas novas a checkpoints antigos.

Na avaliação HTTP, o servidor experimental confere o hash do checkpoint antes
da inferência e o avaliador confere os hashes da imagem e dos pesos, além do
modelo e da resolução informados na resposta. Relatórios anteriores não são
sobrescritos: escolha um caminho inédito dentro da pasta do experimento com
`--report`. No contêiner de avaliação, monte a nova saída em `/experiment` e
crie `/experiment/synthetic` para as cópias das imagens de validação. O uso
do servidor e da avaliação continua restrito à cópia de auditoria exigida pelo
código, não ao banco real. Por exemplo, após preparar e iniciar o ambiente
isolado descrito acima:

```text
python -B /project/backend/tools/evaluate_damage_models_http.py --experiment-root /experiment --image-size 416 --report /experiment/http-evaluation-nova-416.json
```

Essas proteções melhoram a reprodução e a identificação dos artefatos; não
alteram as métricas históricas nem validam o detector para uso no produto.

### Possíveis fontes de dados para pesquisa futura

O [CarDD](https://cardd-ustc.github.io/) fornece um conjunto de fotografias e
anotações de danos, mas os autores exigem solicitação de acesso e análise das
condições aplicáveis às imagens. O [RTDETR-VD](https://github.com/jeiva2000/RTDETR-VD)
descreve vídeos anotados mediante solicitação; sua licença para os dados é
CC BY-NC 4.0, com condições específicas para uso comercial. São apenas
perspectivas a avaliar: esses conjuntos não foram incorporados ou usados nos
resultados deste relatório.
