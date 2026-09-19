# Histórico de mudanças

Registre aqui as mudanças relevantes por sprint ou marco avaliativo.

## Sprint 05 - Termômetro de Mercado, Calculadora TCO e Price Drop Tracker (v2.3.0)
- **Termômetro Visual de Oportunidade / Preço de Mercado (Oportunidade 1)**:
  - Novo componente `MarketPriceIndicator.jsx` com modos `gauge` (régua visual graduada de dispersão) e `badge` (destaque compacto para cards).
  - Classificação analítica de oportunidade (`Super Oportunidade`, `Preço Justo FIPE`, `Na Média de Mercado`, `Acima da Média`), indicando economia real garantida em R$ frente à tabela de referência.
  - Integração nos cards da vitrine (`ShowcaseCatalog.jsx`) e no cabeçalho/sidebar de preços (`ShowcaseVehicleDetails.jsx`).
  - Endpoint REST no backend: `GET /api/cars/{car_id}/market-indicator` e função de cálculo no `pricing_service.py`.
- **Calculadora de Custo Total de Posse - TCO Mensal (Oportunidade 2)**:
  - Novo componente interativo `TcoCalculatorCard.jsx` na página de detalhes do veículo.
  - Breakdown dinâmico com 4 pilares de despesa mensal: IPVA proporcional por alíquota estadual (SP, RJ, MG, DF, etc.), Seguro estimado anualizado, Manutenção preventiva e Combustível projetado conforme a quilometragem mensal informada pelo condutor.
  - Indicador consolidado de Custo Mensal Total e Custo Diário ("R$ X/dia") para planejamento orçamentário do comprador.
  - Endpoint REST no backend: `POST /api/cars/tco-calculator` e algoritmos puros em `pricing_service.py`.
- **Histórico & Badge de Redução de Preço - Price Drop Tracker (Oportunidade 4)**:
  - Novo componente `PriceDropBadge.jsx` exibindo tags vibrantes de desconto ("Preço Baixou R$ X.XXX / -Y%") e timeline histórica expansível com a evolução dos reajustes do anúncio.
  - Colunas `original_price` e `price_history` adicionadas ao banco de dados (`backend/models.py`) e schemas Pydantic (`backend/schemas.py`).
  - Destaque sobreposto nos cards do catálogo e na ficha técnica do veículo.
- **Validação e Confiabilidade**:
  - Nova Suíte 13 de testes automatizados adicionada em `backend/test_full_system_review.py`.
  - Frontend compilado com 100% de sucesso via Vite (`2.236 módulos transformados em 21.27s`).

## Sprint 04 - Resolução de Gargalos, Vídeo Pericial 15s e Comparador Multidimensional (v2.2.0)
- **Otimização de Gargalos e Escalabilidade**:
  - Connection pooling configurado no SQLAlchemy (`pool_size=10`, `max_overflow=20`, `pool_recycle=1800`, `pool_pre_ping=True`) com suporte a concorrência assíncrona.
  - Índices nos campos de alta frequência de consulta no PostgreSQL: `Car.price`, `Car.year`, `Car.brand`, `Car.model`, `Car.store_id`.
  - Cache TTL em memória de 24 horas para cotações FIPE e consultas veiculares no backend, reduzindo latência repetida de 1.8s/6s para < 2ms.
  - Correção de anti-pattern de re-renderização de formulários e filtros no React (`ShowcaseCatalog.jsx`), evitando recriação de árvore DOM e perda de foco.
  - Reatividade global em tempo real no gerenciador de favoritos (`favoritesManager.js` via `CustomEvent` e `subscribeFavorites`), sincronizando a vitrine e a tela de favoritos instantaneamente.
- **Vídeo Pericial de 15 Segundos**:
  - Novo componente `PericialVideoViewer.jsx` com timeline dinâmica, checkpoints periciais interativos (0-5s Frente e Óptica, 5-10s Linha de Cintura e Pneus, 10-15s Traseira e Vão do Motor), controle de reprodução, áudio e replay.
  - Suporte de upload de vídeos de até 40MB (`.mp4`, `.webm`, `.mov`) no backend com streaming otimizado e armazenamento em diretório persistente dinâmico.
  - Coluna `video_url` adicionada ao modelo e schemas de `Car`.
- **Comparador Multidimensional Lado a Lado**:
  - Novo componente `VehicleComparatorModal.jsx` para comparação simultânea de 2 a 3 veículos sem dependência de TrustScore (removido definitivamente do sistema).
  - Métricas comparativas objetivas: Preço anunciado vs Tabela FIPE Oficial (diferença em R$, %, indicador visual e parcelamento simulado), Quilometragem total e Média Anual de uso (km/ano), Laudo Cautelar Estrutural (integridade de longarinas, espessura de tinta, histórico de leilão/sinistro), Situação Cadastral DETRAN (débitos, multas e restrições) e Mecânica/Categoria.

## Sprint 03 - Dossiê em PDF Vetorial com QR Code, Segurança OTP e Catálogo Paginado (v2.1.0)
- Adição da emissão do Dossiê Oficial em PDF Vetorial A4 com ReportLab e QR Code de autenticidade (300 DPI) para validação pública (`/validar/:protocolo`).
- Implementação de recuperação de senha com código OTP de 6 dígitos, hash SHA-256, prazo de 15 minutos, rate limiting e modal com popup para desenvolvimento.
- Refatoração do catálogo no servidor (`GET /api/cars`) com envelope paginado (`offset`/`limit`), busca textual unificada `ilike` e navegação numérica no frontend.
- Carga de 25+ veículos semeados no banco PostgreSQL para testes de paginação.

## Sprint 02 - Negociação Direta e Auditoria de Laudos Cautelares com IA (v2.0.0)
- Remoção da taxa de reserva de sinal online (R$ 1.500) e inserção do CTA primário "Falar com Vendedor" via chat e WhatsApp.
- Pipeline de auditoria pericial automatizada de laudos em PDF com validação por Magic Bytes (`%PDF-`) e IA Multimodal (Gemini Document AI + heurística local).
- Componente `LaudoFeedbackCard.jsx` com score pericial de procedência (0 a 100) e checklist dos 4 pilares estruturais.

## Sprint 01 - Limpeza de Anúncios, Favoritos e Homologação B2B AutoCerto (v1.1.0)
- Criação da central de veículos favoritos (`/favoritos`) com persistência em `localStorage`.
- Correção de scroll indevido na alternância de rotas (`ScrollToTop` global).
- Homologação oficial dos 3 canais B2B: Webmotors, OLX Autos e AutoCerto DMS (com rota de carga direta `/api/integrations/autocerto/feed.xml`).
- Inicialização em Modo Visitante no `AuthContext.jsx`.

## Sprint 00 - Planejamento Inicial (v1.0.0)
- Criação da arquitetura inicial em microsserviços conteinerizados com Docker Compose.
- Hub Pericial de IA: Carroceria HD (YOLOv8 + OpenCV), Varredura 360°, Diagnóstico Acústico e Tread Depth Scanner de Pneus.
- Módulos comerciais: Troca com Troco, Simulador Multi-Bancos e Radar de Alertas.
- Definição do problema, da equipe, dos papéis e do backlog inicial.
