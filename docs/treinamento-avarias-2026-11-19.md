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


## Experimento adicional com SYNDCAR

Foi executado um novo treino experimental com uma amostra do SYNDCAR. O conjunto
contém fotografias de veículo com danos simulados digitalmente; os exemplos
examinados incluem várias vistas do mesmo veículo. A amostra não comprova
diversidade de veículos e seus prefixos não identificam veículos de forma
confiável. O checkpoint **não foi ativado** no produto.

Fonte e atribuição: Loureiro, Cátia; Dixe, Sandra; Neto, Cristiana; Silva,
Antonio; Miranda, Beatriz; Rodrigues, Ricardo; Costa, Nuno; Ferreira, Diana;
Ferreira, Carlos; Machado, José; Fernandes, Duarte (2025). *SYNDCAR: Synthetic
Vehicle Damage Detection and Parts Segmentation Dataset*. Mendeley Data,
versão 1, [DOI 10.17632/hzpj48krdt.1](https://doi.org/10.17632/hzpj48krdt.1),
licença [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). O conjunto
original não foi modificado: foram selecionadas 20 imagens e suas anotações,
convertidas em cópia de quatro classes para a classe única `avaria`.

### Dados e integridade

- Treino: 20 imagens SYNDCAR, incluindo duas sem caixas, e os mesmos 27
  negativos provisórios de catálogo dos experimentos anteriores. Os três
  positivos sintéticos anteriores não foram incluídos.
- SYNDCAR forneceu 108 caixas: 24 de vidro quebrado, 32 de trincas, 24 de
  riscos e 28 de luzes quebradas. Essa amostra não garante cobertura de
  amassados ou de todas as condições reais.
- Validação: as mesmas 21 imagens anteriores, com cinco regiões selecionadas
  em três vistas de um único veículo danificado. As anotações são
  provisórias e não exaustivas; não há teste independente.
- Os 20 pares foram conferidos por CRC32 e tamanho contra o diretório do ZIP
  original e por SHA-256 contra o registro independente da extração. O
  preparador verificou também as imagens históricas e rejeitou hashes
  compartilhados entre treino e validação. Não se presumiu independência
  entre veículos do próprio SYNDCAR.

O primeiro resumo da preparação contou por engano negativos de outros
grupos como se fossem SYNDCAR. O resumo foi corrigido para dois; a versão
inicial foi preservada. As imagens, rótulos e divisões não foram alterados
por essa correção de contagem.

### Execução e resultados

O treinamento foi executado em contêiner Linux sem rede nem banco, com
projeto, dados e dependências montados somente para leitura: YOLOv8n local,
10 épocas, 416 px, lote 2, AdamW, semente 11 e CPU limitada a dois núcleos.
Torch 2.15.0, Ultralytics 8.4.201 e `polars[rtcompat]` 2.1.0 já estavam
disponíveis; não foram baixados pesos ou instalados pacotes. A imagem Docker
utilizada tinha ID `sha256:276467430d88a2b1e6b7532f484dadb01e2c9f2c65503ea3426765b5a4d7f8ad`.
A CPU informou indisponibilidade de NNPACK e a execução prosseguiu pelo
caminho disponível. O hash SHA-256 dos pesos iniciais era
`f59b3d833e2ff32e194b5bb8e08d211dc7c5bdf144b90d2c8412c47ccfc83b36`;
o hash do melhor checkpoint salvo foi
`e3eea249b2b90109b98192e9046a2162cd823fc89db310f0428e580cad340716`.

| Confiança | IoU | TP | FP | FN | Precisão | Revocação |
| ---: | ---: | ---: | ---: | ---: | --- | ---: |
| 0,25 | 0,5 | 0 | 0 | 5 | Indefinida: sem previsões | 0 |
| 0,5 | 0,5 | 0 | 0 | 5 | Indefinida: sem previsões | 0 |

As métricas nativas do Ultralytics, calculadas segundo seu procedimento
interno, foram precisão 0,000689, revocação 0,2, mAP50 0,000148 e
mAP50–95 0,0000148. Elas usam um procedimento de limiares diferente das duas
linhas acima e não são precisão ou recall validados para o produto. Em ambos
os limiares fixos não houve detecções correspondentes às cinco regiões;
os ensaios anteriores também não encontraram essas regiões nesses limiares.
A amostra é pequena, o domínio dos danos simulados difere do cenário real e
a validação também seleciona o melhor checkpoint. Assim, o experimento não
demonstra generalização nem autoriza ativar o detector.

### Reprodução com os artefatos preservados

Os scripts temporários `prepare.py` e `train.py`, o manifesto de seleção,
hashes, dados de auditoria, previsões brutas, `results.csv` e pesos ficaram
fora do Git, nas pastas locais preservadas do experimento e da amostra. Os
arquivos grandes e os checkpoints não foram enviados aos repositórios. Para
repetir, use cópias desses dois scripts, a amostra conferida e uma saída nova
vazia. A amostra deve conter `sample-selection.json`, `sample/images` e
`sample/labels_damage`; o projeto deve conter o manifesto histórico e os pesos
YOLO locais indicados no script. Os exemplos a seguir usam variáveis para
evitar registrar caminhos privados:

```powershell
# Defina $Repository, $Sample, $Compat, $Scripts e $Output com caminhos locais.
# $Output deve ser uma pasta nova e vazia; mantenha os artefatos anteriores.
Copy-Item -LiteralPath "$Scripts\prepare.py" -Destination "$Output\prepare.py"
Copy-Item -LiteralPath "$Scripts\train.py" -Destination "$Output\train.py"
docker run -d --name automatch-syndcar-repro --network none --cpus 2 --memory 3g `
  --mount "type=bind,source=$Repository,target=/project,readonly" `
  --mount "type=bind,source=$Sample,target=/syndcar,readonly" `
  --mount "type=bind,source=$Compat,target=/compat,readonly" `
  --mount "type=bind,source=$Output,target=/experiment" `
  automatch-backend:latest sleep infinity
docker exec automatch-syndcar-repro python -B /experiment/prepare.py
docker exec automatch-syndcar-repro python -B /experiment/train.py
```

Use a mesma imagem Docker, a variante compatível e os mesmos pesos para uma
comparação; outras versões ou hardware podem produzir resultados diferentes.
A seleção e a conversão não alteram a licença ou a atribuição da fonte.


## Experimento com Damaged Cars Dataset (Harvard Dataverse)

Foi executado um treino experimental por transferência de aprendizagem com o dataset
público *Damaged Cars*, composto por fotografias reais de veículos com avarias anotadas.
O objetivo foi verificar se uma base real com volume significativamente maior de
exemplares permitiria obter um detector com precisão e revocação mensuráveis e seguras.
**O modelo resultante NÃO foi ativado no scanner em produção**, pois seus índices de
revocação não sustentam a regra de confiabilidade para liberação do scanner.

Fonte e atribuição: Grec, Marcello; Perico, Danilo H. (2024). *Damaged Cars Dataset*.
Harvard Dataverse, [DOI 10.7910/DVN/MV5EME](https://doi.org/10.7910/DVN/MV5EME),
licença [CC0 1.0 Universal (Public Domain Dedication)](https://creativecommons.org/publicdomain/zero/1.0/).
Arquivo original conferido: `damages.zip` (147.575.833 bytes), MD5 `ce8222848c070a8cc5c8777e76ae3968`,
SHA-256 `77b6cf3dabc267c2568f7ea6bd2178eee3ae1951bc215c0c36d63e38da368c23`.

### Dados e particionamento anti-vazamento

- Total da base: 2.290 imagens e 4.859 caixas delimitadoras em 3 categorias:
  - `Scratched` (riscos/arranhões): 3.467 caixas (71,35%)
  - `Dented` (amassados): 867 caixas (17,84%)
  - `Broken` (peças quebradas): 525 caixas (10,80%)
- Prevenção de vazamento: As 2.290 imagens foram agrupadas em 1.666 clusters atômicos
  (combinando índice sequencial de captura e resolução da câmera). A ordenação
  determinística usou algoritmo Fisher-Yates com semente 42.
- Controles negativos: 27 fotografias de veículos íntegros do catálogo histórico do
  projeto foram incorporadas (com anotações vazias) para calibrar a taxa de falsos
  positivos.
- Divisão final dos conjuntos:
  - **Treino**: 1.622 imagens (1.603 avariadas + 19 controles negativos), 3.430 caixas.
  - **Validação**: 348 imagens (344 avariadas + 4 controles negativos), 722 caixas.
  - **Teste cego independente**: 347 imagens (343 avariadas + 4 controles negativos), 707 caixas.
- Verificação de vazamento: Conferência automatizada garantiu intersecção zero de
  arquivos e hashes entre os três conjuntos.

### Execução e ambiente de treinamento

- Contêiner Docker Linux baseado em `automatch-backend:latest`, Python 3.11.18,
  Torch 2.15.0, Ultralytics 8.4.201, CPU Intel Core i5-3330 (4 núcleos, 4 GiB de memória).
- Dependências: O método interno de persistência de métricas do Ultralytics foi
  compatibilizado para operar com `pandas 3.1.1` em substituição ao Polars (que exigia
  instruções AVX2 não suportadas pela CPU).
- Hiperparâmetros: Modelo base `backend/yolov8n.pt` (SHA-256: `f59b3d833e2ff32e194b5bb8e08d211dc7c5bdf144b90d2c8412c47ccfc83b36`),
  5 épocas, resolução 416 px, batch 16, otimizador AdamW, semente 42.
- Duração total do treino: 3.102,16 segundos (~51,7 minutos).
- Checkpoint final (`best.pt`): 6.459.562 bytes, SHA-256:
  `f209baa4dd62d83bbce0883bf12d5abc8d7ca9a5ae6fafd3d12c92dde884e52b`.

### Resultados da avaliação cega no conjunto de teste independente

Métricas calculadas no conjunto cego de teste (347 imagens, 707 instâncias, limiar conf=0,25, IoU=0,5):

| Classe | Precisão (P) | Revocação (R) | mAP50 | mAP50–95 |
| :--- | :---: | :---: | :---: | :---: |
| **Geral (todas as classes)** | **0,2074** | **0,0183** | **0,0147** | **0,0063** |
| Scratched (riscos) | 0,6222 | 0,0549 | 0,0441 | 0,0188 |
| Dented (amassados) | 0,0000 | 0,0000 | 0,0000 | 0,0000 |
| Broken (quebrados) | 0,0000 | 0,0000 | 0,0000 | 0,0000 |

### Avaliação de especificidade nos controles negativos

Nas 4 imagens de teste de veículos íntegros do catálogo histórico (`neg_047.jpg` a `neg_050.jpg`):
- Falsos positivos com confiança >= 0,25: **0**
- Falsos positivos com confiança >= 0,40: **0**
- Taxa de falso alarme em veículos íntegros: **0,0%** (especificidade preservada).

Arquivo com o resumo estruturado completo: `docs/damage-damagedcars-evaluation-summary.json`.

### Conclusão técnica e decisão de produto

1. **Evidência comprovada**: O modelo demonstrou alta especificidade (não gerou falsos
   positivos em veículos íntegros) e uma precisão preliminar relevante em riscos
   visíveis (`Scratched` P = 62,2%).
2. **Limitação impeditiva**: A revocação global foi de apenas 1,83% (98,17% das avariadas
   não foram detectadas), e as classes `Dented` e `Broken` não atingiram convergência
   suficiente no treino de 5 épocas na CPU.
3. **Decisão estrita**: O modelo **NÃO oferece cobertura ou confiabilidade suficiente**
   para atuar de forma autônoma na liberação de laudos ou atestar que um veículo está livre
   de danos.
4. **Alinhamento ao contrato de inspeção**: O scanner do produto DEVE continuar
   retornando categoricamente:
   > *"Análise inconclusiva, confirme com vistoria presencial."*
   Nenhum parecer de conformidade ou ausência de avarias é fabricado ou presumido.

