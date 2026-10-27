# Relatório Geral de Auditoria, Testes e Revisão do Sistema Automatch

**Data da Auditoria**: 26/10/2026  
**Ambiente**: Docker Compose (`automatch-backend`, `automatch-frontend`, `automatch-db`, `automatch-gateway`)  
**Branch de Revisão**: `revisao/geral` (isolada a partir da `main`)  
**Banco de Dados Auditado**: `automatch_test_copy` (cópia integral e isolada do PostgreSQL 15, com backup físico de segurança prévio)

---

## 1. Resumo Executivo

A auditoria completa cobriu as três frentes do sistema Automatch:
- **Frente A (Revisão de Código)**: Leitura e inspeção estática do backend (10 roteadores, models, services, tasks) e frontend (12 telas, componentes de vitrine, 360°, TCO, dossiê, scanner e autenticação).
- **Frente B (Testes do Banco de Dados)**: Executados exclusivamente na cópia isolada `automatch_test_copy`. Cobertura de esquema (B1), migrações e rollback (B2), contagem de queries N+1 e profiling com volume sintético de 10.000 veículos (B3/B4), verificação de compatibilidade PostgreSQL vs SQLite (B5) e procedimento de backup/restauração e mídias órfãs (B6).
- **Frente C (Testes de Funcionalidades)**: Matriz de permissões e segurança via chamadas diretas à API (com tokens de cada perfil) e testes de interface no navegador com capturas de tela e gravação de sessão.

### O que não foi possível testar e motivo
- **Chamada real à API Google Gemini**: A variável `GEMINI_API_KEY` não está configurada no ambiente local, fazendo o sistema operar no modo fallback pericial local (YOLOv8 + regras determinísticas).
- **Envio real de e-mails via SMTP**: A recuperação de senha opera com código OTP armazenado criptograficamente no banco e exibido em log/resposta de desenvolvimento.

---

## 2. Métricas de Linha de Base

| Métrica | Valor Apurado | Observação |
|---|---|---|
| **Tempo de subida Docker (`docker compose up -d`)** | **19,35 s** | Todos os serviços saudáveis |
| **Tempo de build Frontend (`npm run build`)** | **57,82 s** | Chunks JS + Vídeo 13,56 MB |
| **Alertas de Lint (`npm run lint`)** | **848 problemas** | 828 erros (`no-unused-vars`) e 20 warnings |
| **Testes Unitários Backend** | **70 / 70 aprovados** | 37,95 s (`python -m unittest`) |
| **Testes Unitários Frontend** | **181 / 181 aprovados** | 1,13 s (`node --test`) |
| **Endpoints REST registrados** | **61 endpoints** | 1 aviso de `operationId` duplicado |
| **Telas no Frontend** | **12 telas únicas** | 18 rotas mapeadas (aliases/redirects) |
| **Tempo de restauração física de backup (B6)** | **2,10 s** | 24 carros, 6 lojas, 33 usuários restaurados |

---

## 3. Matriz de Resultados por Frente e por Perfil

| Caso de Teste | Perfil | Frente | Resultado | Evidência / Detalhes |
|---|---|---|---|---|
| **Cadastro de Usuário Comum** | `comum` | Funcionalidade (API) | ✅ PASSOU | Retornou JWT e `role: "comum"` |
| **Tentativa de Auto-Promoção a Admin** | Hacker / Anônimo | Segurança (API) | ✅ PASSOU | Campo `role: "admin"` é sanitizado para `"comum"` |
| **Cadastro de Lojista com Loja** | `lojista` | Funcionalidade (API) | ✅ PASSOU | Criou loja e associou `store_id` |
| **Criação de Anúncio Próprio** | `comum` | Funcionalidade (API) | ✅ PASSOU | `user_id` associado automaticamente |
| **Edição Cruzada de Anúncio Alheio (IDOR)** | `lojista` | Segurança (API) | ✅ PASSOU | HTTP 403 Forbidden retornado |
| **Acesso a Estoque Compartilhado B2B** | `comum` | Permissões (API) | ✅ PASSOU | HTTP 403 Forbidden retornado |
| **Acesso a Estoque Compartilhado B2B** | `lojista` | Permissões (API) | ✅ PASSOU | HTTP 200 OK com estoque liberado |
| **Upload de PDF Falso / Corrompido** | `comum` | Segurança (API) | ✅ PASSOU | HTTP 400 por validação de Magic Bytes |
| **Upload de Arquivo Binário em `/api/analise-visual`** | `visitante` | Código / API | ❌ FALHOU | **HTTP 500 (`UnicodeDecodeError`)** |
| **Detecção de Danos em Lataria (YOLOv8)** | `visitante` | IA / Perícia | ❌ FALHOU | Retornou **98% sem avarias** em carro amassado |
| **Pergunta de Consumo ao Consultor IA** | `visitante` | IA / Regra Alvo | ❌ FALHOU | Inventou valor fixo (10 a 13 km/l) |
| **Rollback de Migração Alembic (`downgrade`)** | DBA / CI | Banco (B2) | ❌ FALHOU | **`CompileError` (constraint FK sem nome)** |
| **Carga e Paginação Tardia (10k carros)** | Sistema | Banco (B3/B4) | ⚠️ ALERTA | Latência subiu para **36,18 ms** (quicksort em memória) |
| **Tipagem de Colunas Financeiras B2B** | Sistema | Banco (B1) | ⚠️ ALERTA | Colunas monetárias utilizam `Float` em vez de `Numeric` |
| **Mídias referenciadas no Banco vs Disco** | Sistema | Banco (B6) | ❌ FALHOU | **10 carros com imagens ausentes no disco** |
| **Navegação, Dossiê Oficial e ESC** | `visitante` | Interface (E2E) | ✅ PASSOU | Modal abre com protocolo e fecha via ESC |
| **Ausência de Botões 'Explorar' / 'Ver todos'** | `visitante` | Interface (E2E) | ✅ PASSOU | Respeitado na Home |
| **Ausência de Selo Fipe nos Cards da Vitrine** | `visitante` | Interface (E2E) | ✅ PASSOU | Respeitado na Vitrine |
| **Ícones Indevidos em Badges (Estrela e Bola 🟢)** | `visitante` | Interface (E2E) | ❌ FALHOU | Estrela em `PriceDropBadge` e `🟢` em `MarketPrice` |

---

## 4. Tabela de Achados Comprovados

| ID | Severidade | Frente | Sintoma | Evidência | Causa Raiz | Onde Mais Ocorre | Correção Proposta | Risco | Esforço |
|---|---|---|---|---|---|---|---|---|---|
| **ACH-01** | **Crítica** | Banco (B2) | `alembic downgrade -1` quebra a execução | `CompileError: Can't emit DROP CONSTRAINT for constraint ForeignKeyConstraint... it has no name` | Migração `9e22ea1485c3` gerou `op.drop_constraint(None, 'users', type_='foreignkey')` sem nome da constraint | `alembic/versions/9e22ea1485c3_add_missing_indexes_and_fks.py:37,40` | Nomear explicitamente as constraints no PostgreSQL | Baixo | Baixo |
| **ACH-02** | **Crítica** | Código / Backend | `/api/analise-visual` retorna HTTP 500 ao receber upload multipart | `UnicodeDecodeError: 'utf-8' codec can't decode byte 0xff` no encoder de erros do FastAPI | Endpoint tipado apenas para JSON (`payload: AnaliseVisualRequest`), falhando na validação de multipart binário | `routers/ai_vision.py:53` | Aceitar `UploadFile` opcional e adicionar handler seguro para `RequestValidationError` | Médio | Médio |
| **ACH-03** | **Alta** | IA / Backend | Falsos negativos no scanner de avarias (lataria amassada atestada como 98% íntegra) | Carros com batida visível retornam `tem_avarias: False` e `score_lataria: 98` | Uso do modelo genérico COCO (`yolov8n.pt`) que detecta objetos ('car') e não avarias estruturais | `services/ai_service.py:executar_pericia_visual_completa` | Integrar rotina de inspeção de assimetria e contornos Canny em OpenCV | Médio | Médio |
| **ACH-04** | **Alta** | IA / Regra Alvo | Consultor IA inventa valores fixos de consumo de combustível para todos os carros | Resposta sempre afirma: *"consumo médio estimado de 10 a 13 km/l em ciclo urbano..."* | Regra estática em `ai_vision.py` sem consultar `consumoInmetro` nem dados reais do carro | `routers/ai_vision.py:302` | Ler consumo real dos specs/descrição; se ausente, informar que o dado não consta | Baixo | Baixo |
| **ACH-05** | **Alta** | Mídia / Regra Alvo | Ângulos de rotação 360° utilizam imagens repetidas em `sc-004` e `sc-005` | Ângulos 0°, 45°, 90°, 135°, 180° compartilham o mesmo hash MD5 exato | Replicação de arquivos para preencher os 8 ângulos do carrossel orbital | `frontend/public/images/cars/sc-004/` e `sc-005/` | Detectar conjunto incompleto e renderizar card de indisponibilidade | Baixo | Baixo |
| **ACH-06** | **Média** | Upload / Regra Alvo | Duração do vídeo pericial limitada em 15s sem validação temporal real no servidor | `MAX_VIDEO_SIZE_BYTES = 40MB`, `duracao_estimada_segundos = 15`. Duração temporal não é inspecionada | Backend valida apenas tamanho em bytes e não duração em segundos do vídeo | `routers/uploads.py:45,298` | Centralizar limite em 20s e validar duração via OpenCV `VideoCapture` | Médio | Baixo |
| **ACH-07** | **Média** | Vitrine / Regra Alvo | Fallback silencioso da Vitrine com dados mockados em caso de falha de API em produção | `.catch()` no `ShowcaseCatalog.jsx` injeta `showcaseCars` mesmo com `isDemoModeEnabled() === false` | Lógica de contingência não condicionada estritamente ao modo demo | `pages/ShowcaseCatalog.jsx:241-255` | Exibir estado de erro com botão "Tentar novamente" em produção | Baixo | Baixo |
| **ACH-08** | **Média** | UI / Regra Alvo | Ícone de estrela e texto "Destaque" presentes dentro do selo "Preço Baixou" | `<Star className="w-3.5 h-3.5" />` renderizado dentro de `PriceDropBadge` | Componente reutiliza ícone de destaque dentro do badge de desconto | `components/vehicle/PriceDropBadge.jsx:47-51,71-75` | Remover estrela de dentro do badge de preço reduzido | Baixo | Baixo |
| **ACH-09** | **Baixa** | UI / Regra Alvo | Emoji de bola verde (`🟢`) presente ao lado de "Super Oportunidade" | `🟢 Super Oportunidade` renderizado no indicador de preço de mercado | Emoji textual adicionado na descrição do score de mercado | `components/vehicle/MarketPriceIndicator.jsx:342` | Remover emoji `🟢` | Baixo | Baixo |
| **ACH-10** | **Média** | Banco (B4) | Desalinhamento entre banco de dados real, `seed.py` e catálogo do frontend | 24 carros no banco sem tags (NULL), 21 sem dono, lojas duplicadas e ausência de IDs `sc-001` a `sc-005` | `seed.py` não é idempotente e foi ignorado devido a registros preexistentes | `backend/seed.py`, `models.py` | Tornar `seed.py` idempotente com `upsert`, vinculando lojas e carros oficiais | Médio | Médio |
| **ACH-11** | **Média** | Banco (B1) | Campos monetários das tabelas B2B modelados como `Float` | `proposed_price`, `final_price`, `commission_amount` utilizam `Float` | Falta de padronização com a tabela `cars` que já utiliza `Numeric(12, 2)` | `backend/models.py:154,180-183` | Criar migração Alembic para converter colunas financeiras para `Numeric(12, 2)` | Médio | Médio |
| **ACH-12** | **Média** | Banco (B6) | 10 carros no banco apontam para arquivos de imagem que não existem no disco | `/images/yaris_test.jpg`, `/images/FotoTeslaModel3.jpeg` não existem | Dados de teste inseridos sem upload físico dos arquivos | Banco de dados `cars.image` | Corrigir caminhos no seed/banco para imagens reais ou `placeholder-carro.jpg` | Baixo | Baixo |
| **ACH-13** | **Baixa** | Qualidade / Lint | 848 erros de lint e testes frágeis baseados em inspeção de string no código-fonte | 828 erros de `no-unused-vars` no ESLint; asserções checando `includes('if not is_admin...')` | Código morto acumulado e suíte de testes de segurança acoplada a texto | `frontend/src/`, `frontend/tests/test_security_audit.mjs` | Limpar imports órfãos e refatorar testes para checagem de contrato de API | Baixo | Médio |
| **ACH-14** | **Baixa** | Infra / CI | `pytest` ausente na imagem Docker e aviso de duplicidade de `operationId` | `exec: pytest not found`; warning no startup de duplicate ID em `/api/chat` | Dockerfile não rebuildado após requirements; função duplicada em `ai_vision.py` | `backend/Dockerfile`, `routers/ai_vision.py` | Definir operationId explícito e garantir pytest na imagem | Baixo | Baixo |

---

## 5. Divergências em Relação às Decisões-Alvo

1. **Selo Preço Baixou**: Contém ícone de estrela embutido (`PriceDropBadge.jsx`), divergindo da regra alvo.
2. **Super Oportunidade**: Contém ícone de bola verde (`🟢`) em `MarketPriceIndicator.jsx`, divergindo da regra alvo.
3. **Vídeo Pericial**: Configurado para 15s em vez de 20s, e sem validação real da duração no servidor.
4. **Consultor IA (Consumo)**: Retorna valor fixo inventado (10 a 13 km/l) quando perguntado sobre consumo.
5. **Conjunto 360°**: `sc-004` e `sc-005` possuem imagens duplicadas repetidas em vários ângulos em vez de acusar indisponibilidade.
6. **Fallback da Vitrine**: Injeta dados de exemplo mesmo com `isDemoModeEnabled() === false` quando a API falha.
7. **Perfis de Usuário**: O enum/modelo do banco ainda possui resquícios de `comprador` e `vendedor` que dependem de normalização em tempo de execução para virar `comum`.

---

## 6. Métricas de Volume no Banco (Conjunto Sintético de 10.000 Carros)

> *Nota: Dados gerados de forma sintética e descartável exclusivamente na cópia `automatch_test_copy`, com prefixo `[TESTE]` e 100% removidos ao final do ensaio.*

- **Tempo de inserção em lote (10k registros)**: **4,55 segundos**.
- **Filtro simples de marca (`WHERE brand = 'Toyota' LIMIT 15`)**: **0,101 ms** (Seq Scan de 57 linhas com `Limit`).
- **Filtro composto indexado (`idx_cars_brand_price`)**: **0,139 ms** (Index Scan de 15 linhas usando índice).
- **Busca por texto parcial (`ILIKE '%Corolla%'`)**: **0,321 ms** (Seq Scan de 336 linhas).
- **Paginação Tardia (`ORDER BY price ASC OFFSET 5000 LIMIT 15`)**: **36,187 ms** (degradação acentuada por quicksort em memória de 1.798 kB).

---

## 7. Proposta de Lotes de Correção

Para atender ao princípio de **lotes pequenos (até cerca de 5 arquivos por lote)**, coesos, com dependências explícitas e reversíveis:

### 📦 Lote 1: Estabilidade de Migrações e Tipagem Financeira no Banco
- **Achados**: `ACH-01` e `ACH-11`.
- **Tema**: Correção do rollback de migrações Alembic e tipagem monetária de `Float` para `Numeric(12, 2)`.
- **Arquivos previstos (3)**: `backend/alembic/versions/9e22ea1485c3_add_missing_indexes_and_fks.py`, `backend/models.py`, `backend/alembic/versions/005_fix_b2b_financial_types.py`.
- **Risco**: Baixo/Médio (testado primeiro na cópia com backup).

### 📦 Lote 2: Robustez da API de Visão e Scanner (Eliminação do Erro 500)
- **Achados**: `ACH-02` e `ACH-14`.
- **Tema**: Suporte a multipart/upload em `/api/analise-visual`, tratamento seguro de `RequestValidationError` contra `UnicodeDecodeError` e unicidade de `operationId`.
- **Arquivos previstos (3)**: `backend/routers/ai_vision.py`, `backend/main.py`, `backend/schemas.py`.
- **Risco**: Baixo.

### 📦 Lote 3: Fidelidade das Regras de Negócio da IA e Duração do Vídeo Pericial
- **Achados**: `ACH-04` e `ACH-06`.
- **Tema**: Validação real de vídeo pericial de até 20s via OpenCV no backend e resposta precisa de consumo em km/l no Consultor IA (sem inventar dados).
- **Arquivos previstos (3)**: `backend/routers/uploads.py`, `backend/routers/ai_vision.py`, `backend/services/ai_service.py`.
- **Risco**: Baixo.

### 📦 Lote 4: Conformidade Estrita das Regras Visuais e Badges no Frontend
- **Achados**: `ACH-08`, `ACH-09` e `ACH-07`.
- **Tema**: Remoção da estrela do selo "Preço Baixou", remoção do ícone `🟢` de "Super Oportunidade" e tela explícita de erro com "Tentar novamente" na falha da Vitrine em produção.
- **Arquivos previstos (3)**: `frontend/src/components/vehicle/PriceDropBadge.jsx`, `frontend/src/components/vehicle/MarketPriceIndicator.jsx`, `frontend/src/pages/ShowcaseCatalog.jsx`.
- **Risco**: Baixo.

### 📦 Lote 5: Integridade de Mídias 360° e Reconciliação Idempotente do Seed
- **Achados**: `ACH-05`, `ACH-10` e `ACH-12`.
- **Tema**: Detecção de conjuntos 360° incompletos/repetidos com estado de indisponibilidade, saneamento do `seed.py` com lojas oficiais e resolução de imagens inexistentes.
- **Arquivos previstos (4)**: `frontend/src/components/vehicle/Vehicle360Viewer.jsx`, `frontend/src/data/showcaseData.js`, `backend/seed.py`, `backend/main.py`.
- **Risco**: Médio.

### 📦 Lote 6: Limpeza de Código Morto (Lint) e Fortalecimento dos Testes
- **Achados**: `ACH-13` e `ACH-03`.
- **Tema**: Eliminação dos 828 erros de `no-unused-vars` do ESLint, refatoração de testes frágeis baseados em strings e calibração heurística do scanner de lataria.
- **Arquivos previstos (5)**: `frontend/src/pages/ShowcaseVehicleDetails.jsx`, `frontend/src/pages/ShowcaseCatalog.jsx`, `frontend/src/pages/NewCarAdForm.jsx`, `frontend/tests/test_security_audit.mjs`, `backend/services/ai_service.py`.
- **Risco**: Baixo.

---

**PAUSA OBRIGATÓRIA**: Aguardando aprovação do usuário para apresentar o detalhamento e executar o **Lote 1**.
