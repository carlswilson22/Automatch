# 📌 Backlog Priorizado do Produto - Automatch™
**Repositório Oficial:** [CAMPUSCEUB/ADS-AUTOMATCH](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH.git)  
**Curso:** Análise e Desenvolvimento de Sistemas (ADS) - Centro Universitário de Brasília (CEUB)  
**Papel:** Tech Lead & Product Owner (PO)  
**Framework de Priorização:** MoSCoW (Must, Should, Could, Won't) combinado com Matriz RICE (Reach, Impact, Confidence, Effort)  

---

## 🎯 1. Visão do Produto e Objetivos Estratégicos (OKRs)

O **Automatch** tem como missão eliminar a assimetria de informações e fraudes na comercialização de veículos seminovos e de alta procedência. O sistema combina **visão computacional**, **inteligência artificial generativa**, **auditoria cadastral em tempo real (FIPE/DETRAN)** e um **motor algorítmico de precificação justa (AutoPrice™)**.

### Objetivos Principais (OKRs):
* **OKR 1 (Confiabilidade):** Garantir 100% de rastreabilidade e integridade nos laudos periciais e certidões veiculares emitidas.
* **OKR 2 (Experiência do Usuário):** Tempo de resposta de inferência pericial de IA inferior a 2,5 segundos por imagem.
* **OKR 3 (Maturidade de Engenharia):** Arquitetura 100% conteinerizada com CI/CD, testes automatizados e segurança stateless.

---

## 📊 2. Matriz Geral de Releases & Priorização

```
+---------------------------------------------------------------------------------------+
| SPRINT 1-2 (RELEASE 1.0) | SPRINT 3-4 (RELEASE 2.0) | SPRINT 5-6 (RELEASE 3.0)       |
| Core & Estabilidade      | IA Avançada & Perícia    | Gateway de Pagamento & B2B     |
| [P0 - Must Have]         | [P1 - Should Have]       | [P2 - Could Have]              |
|--------------------------+--------------------------+--------------------------------|
| • Autenticação Real JWT  | • Fine-tuning YOLOv8     | • Stripe / Pagar.me Real       |
| • Catálogo no Postgres   | • Segmentação de Danos   | • Portal Concessionárias (B2B) |
| • Dossiê DETRAN / FIPE   | • Relatório PDF Oficial  | • App Mobile React Native      |
| • AutoPrice™ Conectado   | • Webhooks & Mensageria  | • Integração BIN / SENATRAN    |
+---------------------------------------------------------------------------------------+
```

---

## 📋 3. Backlog Detalhado por Épicos e Histórias de Usuário

---

### 🛡️ ÉPICO 1: Segurança, Autenticação e Gestão de Acessos (IAM)

#### 🏷️ [ATM-AUTH-01] Autenticação Segura com PBKDF2 e JWT
* **Prioridade:** 🔴 `P0 - Must Have` | **Esforço:** 5 SP | **Status:** ✅ `Concluído`
* **Camada:** Backend (FastAPI) + Frontend (React)
* **Descrição:** *Como* usuário ou administrador da plataforma, *quero* autenticar com e-mail e senha de forma criptograficamente segura, *para que* meus dados e preferências estejam protegidos contra acessos não autorizados.
* **Critérios de Aceite:**
  - [x] Senhas armazenadas exclusivamente com hash `PBKDF2-HMAC-SHA256` (salt de 16 bytes e 100.000 iterações).
  - [x] Geração de token JWT padrão RFC 7519 com expiração e assinatura HMAC-SHA256 (`JWT_SECRET`).
  - [x] Proteção das rotas `/perfil` e `/dashboard` via `ProtectedRoute.jsx`.

#### 🏷️ [ATM-AUTH-02] Recuperação de Senha via E-mail (Magic Link / OTP)
* **Prioridade:** 🟡 `P1 - Should Have` | **Esforço:** 5 SP | **Status:** ⏳ `A Fazer`
* **Camada:** Backend + Serviço SMTP/SES
* **Descrição:** *Como* usuário que esqueceu a senha, *quero* receber um link temporário com token de recuperação por e-mail, *para que* eu possa redefinir meu acesso sem depender do suporte.
* **Critérios de Aceite:**
  - Token de uso único com expiração em 15 minutos.
  - Endpoint `POST /api/auth/forgot-password` e `POST /api/auth/reset-password`.
  - Rate limiting (máximo 3 solicitações por hora por IP).

#### 🏷️ [ATM-AUTH-03] Controle de Acesso Baseado em Perfis (RBAC - Admin, Lojista, Cliente)
* **Prioridade:** 🟡 `P1 - Should Have` | **Esforço:** 8 SP | **Status:** ⏳ `A Fazer`
* **Camada:** Fullstack
* **Descrição:** *Como* administrador do sistema, *quero* restringir operações de cadastro de lojas e exclusão de anúncios a perfis autorizados, *para que* os lojistas gerenciem apenas seu próprio inventário.
* **Critérios de Aceite:**
  - Campo `role` nos claims do JWT (`admin`, `dealer`, `customer`).
  - Middleware de permissão no FastAPI (`RoleChecker(["admin"])`).

---

### 🚗 ÉPICO 2: Gestão de Estoque, Catálogo & Multi-Concessionárias

#### 🏷️ [ATM-CAT-01] Catálogo Unificado com PostgreSQL e Deduplicação
* **Prioridade:** 🔴 `P0 - Must Have` | **Esforço:** 5 SP | **Status:** ✅ `Concluído`
* **Camada:** Fullstack
* **Descrição:** *Como* comprador, *quero* visualizar os veículos cadastrados no banco de dados com filtros rápidos de marca, modelo, ano e preço, *para que* eu encontre rapidamente o veículo ideal.
* **Critérios de Aceite:**
  - [x] Consumo da rota `GET /api/cars` com suporte a query params (`?store_id=&q=`).
  - [x] Deduplicação inteligente entre estoque do banco e anúncios do usuário.
  - [x] Alternância de visualização entre Grade e Lista.

#### 🏷️ [ATM-CAT-02] Cadastro Completo de Veículo pelo Lojista/Vendedor
* **Prioridade:** 🔴 `P0 - Must Have` | **Esforço:** 5 SP | **Status:** ✅ `Concluído`
* **Camada:** Fullstack
* **Descrição:** *Como* vendedor particular ou lojista, *quero* cadastrar um veículo com fotos, especificações mecânicas e situação documental, *para que* meu anúncio seja publicado na vitrine.
* **Critérios de Aceite:**
  - [x] Envio de payload para `POST /api/cars` com validação de campos obrigatórios.
  - [x] Geração de protocolo único de anúncio formatado (`#XXXX-XXXX`).
  - [x] Suporte a imagens em base64 e upload local.

#### 🏷️ [ATM-CAT-03] Paginação no Servidor e Otimização de Busca (Full-Text Search)
* **Prioridade:** 🟡 `P1 - Should Have` | **Esforço:** 5 SP | **Status:** ⏳ `A Fazer`
* **Camada:** Backend + PostgreSQL
* **Descrição:** *Como* comprador, *quero* que o catálogo carregue instantaneamente mesmo com milhares de veículos cadastrados, *para que* a navegação seja fluida.
* **Critérios de Aceite:**
  - Paginação com `limit` e `offset` ou Cursor Pagination em `GET /api/cars`.
  - Índice GIN no PostgreSQL para busca textual em `brand`, `model` e `description`.

---

### 🔍 ÉPICO 3: Dossiê de Transparência, Laudos Cautelares & DETRAN

#### 🏷️ [ATM-LAUDO-01] Emissão e Cruzamento de Laudo Cautelar Híbrido FIPE
* **Prioridade:** 🔴 `P0 - Must Have` | **Esforço:** 5 SP | **Status:** ✅ `Concluído`
* **Camada:** Backend + BrasilAPI + Frontend
* **Descrição:** *Como* comprador interessado, *quero* consultar o histórico pericial e a cotação oficial FIPE do veículo, *para que* eu tenha certeza da integridade estrutural antes da visita presencial.
* **Critérios de Aceite:**
  - [x] Consumo assíncrono de `https://brasilapi.com.br/api/fipe/preco/v1/{codigo_fipe}` com timeout de 6s e fallback.
  - [x] Exibição de métricas periciais: TrustScore (0-100), longarinas dianteiras/traseiras, espessura de tinta e sinistros.

#### 🏷️ [ATM-LAUDO-02] Certidão Cadastral de Débitos e Restrições DETRAN
* **Prioridade:** 🔴 `P0 - Must Have` | **Esforço:** 5 SP | **Status:** ✅ `Concluído`
* **Camada:** Backend + Frontend
* **Descrição:** *Como* comprador ou despachante, *quero* checar se a placa possui multas ativas, IPVA atrasado ou gravame financeiro, *para que* eu não assuma dívidas do antigo proprietário.
* **Critérios de Aceite:**
  - [x] Normalização de placas padrão antigo e Mercosul (`ABC1234` e `ABC1D23`).
  - [x] Retorno consolidado de situação cadastral, débitos de licenciamento e restrições judiciais.

#### 🏷️ [ATM-LAUDO-03] Exportação de Laudo Cautelar em PDF com QR Code de Autenticidade
* **Prioridade:** 🟡 `P1 - Should Have` | **Esforço:** 8 SP | **Status:** ⏳ `A Fazer`
* **Camada:** Backend (ReportLab / WeasyPrint)
* **Descrição:** *Como* cliente ou lojista, *quero* baixar um PDF assinado digitalmente com o laudo pericial completo e QR Code de autenticação, *para que* eu possa utilizá-lo como comprovante de garantia.
* **Critérios de Aceite:**
  - Geração de PDF padronizado com cabeçalho oficial Automatch e dados FIPE/DETRAN.
  - QR Code apontando para rota pública de validação `https://automatch.com.br/validar/{protocolo}`.

---

### 🤖 ÉPICO 4: Inteligência Artificial & Visão Computacional

#### 🏷️ [ATM-AI-01] Scanner Pericial de Avarias por IA Multimodal (Gemini 1.5 Flash)
* **Prioridade:** 🔴 `P0 - Must Have` | **Esforço:** 5 SP | **Status:** ✅ `Concluído`
* **Camada:** Fullstack
* **Descrição:** *Como* comprador avaliando fotos online, *quero* que a IA analise a imagem do veículo e aponte avarias na lataria e faróis, *para que* eu conheça o real estado de conservação do carro.
* **Critérios de Aceite:**
  - [x] Pré-compressão proporcional de imagem (JPEG máx 1024px) no client-side para minimizar latência.
  - [x] Chamada assíncrona REST para o Gemini 1.5 Flash com `maxOutputTokens: 150` e temperatura 0.2.
  - [x] Fallback automático para evitar quebras caso a chave de API não esteja configurada.

#### 🏷️ [ATM-AI-02] Auditoria Visual de Peças em Laudos com YOLOv8
* **Prioridade:** 🔴 `P0 - Must Have` | **Esforço:** 8 SP | **Status:** ✅ `Concluído`
* **Camada:** Backend (Ultralytics YOLOv8 + OpenCV)
* **Descrição:** *Como* auditor de qualidade, *quero* que a plataforma processe as fotos anexadas nos laudos e identifique automaticamente componentes e conformidade pericial.
* **Critérios de Aceite:**
  - [x] Execução de inferência isolada do Event Loop através de `asyncio.to_thread`.
  - [x] Retorno da classe detectada e percentual de acurácia pericial.

#### 🏷️ [ATM-AI-03] Consultor IA Automatch com RAG Contextualizado
* **Prioridade:** 🔴 `P0 - Must Have` | **Esforço:** 5 SP | **Status:** ✅ `Concluído`
* **Camada:** Fullstack
* **Descrição:** *Como* interessado na compra, *quero* conversar com um assistente virtual especialista no veículo da página atual, *para que* eu tire dúvidas sobre consumo, financiamento e manutenção.
* **Critérios de Aceite:**
  - [x] Injeção de dados dinâmicos do veículo (marca, modelo, km, valor) no System Prompt da LLM.
  - [x] Comunicação 100% roteada através do Nginx Gateway (`/api/chat`).

#### 🏷️ [ATM-AI-04] Modelo Próprio de Segmentação de Avarias (YOLOv8-Seg Custom Dataset)
* **Prioridade:** 🟢 `P2 - Could Have` | **Esforço:** 13 SP | **Status:** ⏳ `A Fazer`
* **Camada:** Machine Learning / MLOps
* **Descrição:** *Como* engenheiro de produto, *quero* treinar um dataset de lataria danificada (amassados, arranhões, mossas) com YOLOv8 Segmentação, *para que* a demarcação das avarias na imagem seja precisa em pixels.
* **Critérios de Aceite:**
  - Dataset anotado com mais de 1.500 imagens de veículos brasileiros.
  - Inferência retornando polígonos de máscara para sobreposição gráfica no SVG do carro.

---

### 💰 ÉPICO 5: Motor de Precificação (AutoPrice™), Checkout & Pagamentos

#### 🏷️ [ATM-FIN-01] Algoritmo AutoPrice™ de Preço Justo de Mercado
* **Prioridade:** 🔴 `P0 - Must Have` | **Esforço:** 5 SP | **Status:** ✅ `Concluído`
* **Camada:** Backend + Frontend
* **Descrição:** *Como* comprador ou vendedor, *quero* um cálculo transparente que desconte do valor FIPE a depreciação por alta quilometragem e o custo estimado de reparos, *para que* a negociação seja justa.
* **Critérios de Aceite:**
  - [x] Cálculo de penalidade por KM excedente (R$ 0,10 por KM acima de 10.000km/ano).
  - [x] Dedução estimada por tipo de avaria (arranhão: R$ 300, amassado: R$ 1.200, farol: R$ 800).
  - [x] Piso de segurança impedindo valores abaixo de 50% da FIPE.

#### 🏷️ [ATM-FIN-02] Checkout Transacional com Emissão de Protocolo
* **Prioridade:** 🔴 `P0 - Must Have` | **Esforço:** 5 SP | **Status:** ✅ `Concluído`
* **Camada:** Fullstack
* **Descrição:** *Como* comprador, *quero* reservar um veículo com sinal reembolsável de R$ 1.500 via Pix ou Cartão, *para que* o automóvel fique reservado para mim com garantia documental.
* **Critérios de Aceite:**
  - [x] Endpoint `POST /api/checkout` persistindo a transação na tabela `payment_orders`.
  - [x] Emissão de protocolo autenticado (`ATM-XXXXXX`) e comprovante na interface.
  - [x] Contador regressivo de 15 minutos e gerador de Copia e Cola Pix.

#### 🏷️ [ATM-FIN-03] Integração com Gateway de Pagamento Real (Stripe / Pagar.me)
* **Prioridade:** 🟡 `P1 - Should Have` | **Esforço:** 8 SP | **Status:** ⏳ `A Fazer`
* **Camada:** Backend + Webhooks
* **Descrição:** *Como* lojista, *quero* processar cobranças reais com split de pagamento e conciliação bancária automática, *para que* o sinal entre diretamente na conta jurídica da loja.
* **Critérios de Aceite:**
  - Integração de webhooks para confirmação de pagamento Pix em tempo real.
  - Suporte a estorno automatizado de sinal caso a vistoria presencial seja cancelada em até 7 dias.

---

### ⚙️ ÉPICO 6: Engenharia de Infraestrutura, DevOps & Background Workers

#### 🏷️ [ATM-INFRA-01] Orquestração Multi-Container via Docker Compose e Nginx Gateway
* **Prioridade:** 🔴 `P0 - Must Have` | **Esforço:** 5 SP | **Status:** ✅ `Concluído`
* **Camada:** DevOps / Infraestrutura
* **Descrição:** *Como* desenvolvedor ou avaliador do projeto, *quero* subir todo o ambiente de microsserviços com um único comando, *para que* o deploy seja previsível e idêntico em qualquer máquina.
* **Critérios de Aceite:**
  - [x] Mapeamento correto de contextos e volumes para Windows e Linux no [docker-compose.yml](file:///c:/Users/carlos.wilsong/Downloads/Pasta%20Automatch/docker-compose.yml).
  - [x] Gateway Nginx operando como ponto único de entrada nas portas 80 e 3000.
  - [x] Healthchecks ativos para PostgreSQL e Redis.

#### 🏷️ [ATM-INFRA-02] Worker em Segundo Plano para Auditoria da Watchlist DETRAN
* **Prioridade:** 🔴 `P0 - Must Have` | **Esforço:** 5 SP | **Status:** ✅ `Concluído`
* **Camada:** Backend (APScheduler)
* **Descrição:** *Como* gestor de riscos, *quero* que um processo em segundo plano verifique periodicamente placas cadastradas, *para que* a equipe receba alertas se surgirem novos débitos ou impedimentos.
* **Critérios de Aceite:**
  - [x] Agendador executando a cada 60 segundos com compatibilidade de schema na coluna `last_check`.
  - [x] Invocação acoplada ao ciclo de vida de inicialização (`startup`) do FastAPI.

#### 🏷️ [ATM-INFRA-03] Pipeline de CI/CD com GitHub Actions e Análise Estática (SonarQube)
* **Prioridade:** 🟡 `P1 - Should Have` | **Esforço:** 5 SP | **Status:** ⏳ `A Fazer`
* **Camada:** DevOps / Qualidade
* **Descrição:** *Como* equipe de engenharia do CEUB, *quero* que cada pull request passe por linting, compilação de imagens Docker e testes de unidade, *para que* nenhum código com regressão seja mesclado na branch `main`.
* **Critérios de Aceite:**
  - Workflow `.github/workflows/ci.yml` rodando `pytest` e `npm run build`.
  - Bloqueio de merge caso a cobertura de testes seja inferior a 70%.

---

## 📈 4. Planejamento das Próximas Sprints

### 🚀 Sprint 3 (Próxima Iteração Recomendada)
* **Foco:** Exportação de Laudos Oficiais & Segurança Avançada
1. `[ATM-LAUDO-03]` Geração de PDF Oficial do Laudo Cautelar com QR Code autenticador.
2. `[ATM-AUTH-02]` Fluxo de recuperação de senha com tokens de uso único.
3. `[ATM-CAT-03]` Paginação e índices de busca no PostgreSQL para ganho de escala.

### 🚀 Sprint 4
* **Foco:** Pagamentos Reais & Aperfeiçoamento de IA
1. `[ATM-FIN-03]` Integração de Webhooks para recebimento de Pix via Gateway real.
2. `[ATM-AUTH-03]` Perfis de acesso RBAC diferenciando administradores e lojistas.
3. `[ATM-AI-04]` Dataset customizado de segmentação de avarias com demarcação visual.

---

## 🎯 5. Definição de Pronto (Definition of Done - DoD)

Para que qualquer item deste backlog seja considerado **Concluído (Done)**, ele deve cumprir os seguintes critérios obrigatórios:
1. **Código:** Seguir as diretrizes de Clean Architecture, tipagem estrita (Pydantic no Backend, PropTypes/TypeScript no Frontend) e convenções PEP8 / ESLint.
2. **Segurança:** Não conter credenciais em texto plano, respeitar o `.env` e transitar dados confidenciais sob criptografia.
3. **Gateway:** Não expor portas internas de containers diretamente para o cliente; toda chamada deve passar pelo proxy reverso Nginx (`/api/...`).
4. **Resiliência:** Possuir tratamento defensivo de exceções e fallbacks graciosos caso APIs externas (BrasilAPI, Gemini, DETRAN) fiquem indisponíveis.
5. **Documentação:** Estar registrado no [README.md](file:///c:/Users/carlos.wilsong/Downloads/Pasta%20Automatch/README.md) e referenciado no [walkthrough.md](file:///c:/Users/carlos.wilsong/.gemini/antigravity-ide/brain/541a455b-022d-43a4-b446-5e0502f6e70b/walkthrough.md).
