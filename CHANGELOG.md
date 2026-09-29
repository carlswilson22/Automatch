# Histórico de mudanças

Registre aqui as mudanças relevantes por sprint ou marco avaliativo.

## Sprint 07 - Aprimoramento Orbital 360°, Desempenho B2B, Fechamento Resiliente e Unificação de Lojas (v2.5.0)
- **Varredura 360° Fotográfica Fidedigna & Correção do Quadrante 180°**:
  - Resolução definitiva do bug de perspectiva: o clique em "Traseira 180°" exibe a imagem traseira autêntica (`/images/carro_360_traseira.jpg`), eliminando a exibição frontal incorreta.
  - Mapeamento completo de fotos em 8 ângulos (`photos360`) e galeria enriquecida (`gallery`) nos veículos da vitrine (`showcaseData.js`), com miniaturas visuais navegáveis no `Vehicle360Viewer.jsx`.
- **Interface Limpa & Remoção de Botões Duplicados de Contato**:
  - Remoção dos botões redundantes "Falar com Vendedor" na barra de navegação superior e no card de preços em `ShowcaseVehicleDetails.jsx`.
  - Foco na seção centralizada de chat interativo (`#chat-section`) com alternância limpa entre IA Automatch e Vendedor.
- **Otimização de Performance e Fluidez da Rede B2B**:
  - Eliminação de travamentos no `PartnershipHubModal.jsx`: isolamento do contador regressivo em `ReservationTimerBadge` memoizado, evitando que o tick de 1 segundo re-renderize todo o modal.
  - Aplicação de cache local com TTL de 60s e debounce para buscas de estoque compartilhado.
- **Solicitação de Fechamento com Retirada do Hold Lock e Tradução Explicativa**:
  - Feedback visual imediato (atualização otimista) com persistência local e banner afirmativo ao clicar em "Solicitar Fechamento".
  - Retirada automática da trava Hold Lock após a solicitação, liberando o veículo para a formalização da venda e exibindo o status "Fechamento Solicitado / Aguardando Aprovação".
  - Tradução para "Trava de Reserva Exclusiva (Hold Lock)" com banner educativo explicando seu funcionamento e propósito comercial aos lojistas.
- **Unificação de Lojas da Vitrine e da Rede B2B**:
  - Padronização das lojas em todo o ecossistema (AutoShop Prime, Motors Campinas, Concessionária Alpha) em `inventoryData.js`, `showcaseData.js`, `seed.py` e fallbacks do Hub B2B.
- **Contadores Dinâmicos de Veículos no Perfil do Usuário**:
  - Integração em tempo real no `ProfilePage.jsx` dos contadores dinâmicos de Meus Carros (`newCarsManager.js`), Carros Favoritos (`favoritesManager.js` com `subscribeFavorites`) e Estoque Total da Vitrine, com atalhos de navegação clicáveis.

## Sprint 06 - Otimização Global de Performance, Code Splitting, Varredura 360° e Resiliência B2B (v2.4.1)
- **Comparador Multidimensional & Seleção de Terceiro Veículo**:
  - Remoção do botão redundante `Adicionar 3º Carro` no canto superior direito do cabeçalho em `VehicleComparatorModal.jsx`, mantendo o layout limpo e focado.
  - Implementação de seletor interativo embutido diretamente no 3º slot vazio com barra de busca, miniatura com foto real, especificações (ano, km) e preço em BRL, preenchendo a 3ª coluna de confronto instantaneamente.
- **Rede de Conexão B2B & Hold Lock Resiliente**:
  - Eliminação de travamentos da aplicação ao efetuar reservas com proteção `AbortSignal.timeout(1500)` em `PartnershipHubModal.jsx`.
  - Mecanismo híbrido de contingência: persistência de reservas no `localStorage` (`automatch_b2b_reservations`) caso o backend ou Docker estejam offline, atualizando o catálogo B2B sem quebrar ou bloquear a interface.
  - Cronômetro desacoplado de alta precisão atualizado a cada 1 segundo em tempo real a 60 FPS, com indicação clara de expiração.
- **Varredura 360° Fotográfica Coerente & Perspectiva 3D Orbital**:
  - Eliminação definitiva da troca indevida de veículos entre quadrantes angulares em `Vehicle360Viewer.jsx` e `ShowcaseVehicleDetails.jsx`.
  - Sistema de resolução dinâmica de fotos que prioriza fotos angulares dedicadas (`photos360`), galeria real (`gallery`) e a foto principal autêntica do próprio veículo (`car.image`), mantendo identidade visual estrita de cor, modelo e marca em todos os 8 ângulos.
  - Transformações de perspectiva 3D contínua calculadas via CSS hardware-accelerated (`perspective(1200px) rotateY(...)`) e iluminação direcional de estúdio em tempo real.
  - Otimização de GPU com remoção de classes `backdrop-blur-md` na bússola e status do visualizador orbital.
- **Code-Splitting Dinâmico e Lazy Loading de Modais**:
  - Conversão de modais pesados (`VehicleComparatorModal`, `PriceAlertModal`, `MultichannelSyncModal`, `PartnershipHubModal`) para `React.lazy()` sob demanda com `Suspense`.
  - Redução imediata de ~10.1 kB no chunk inicial de `ShowcaseVehicleDetails.jsx` e ~50.5 kB nas páginas de `Dashboard.jsx` e `ProfilePage.jsx`.
- **Resiliência de Rede & Proteção Fail-Fast**:
  - Implementação de `AbortSignal.timeout(1200)` nas consultas de veículos (`ShowcaseCatalog.jsx` e `FavoritesPage.jsx`) e `AbortSignal.timeout(1500)` nas integrações de laudo e DETRAN (`ShowcaseVehicleDetails.jsx`), prevenindo travamento do navegador diante de indisponibilidade de backend.
- **Pipeline de Imagens & Desoneração de GPU**:
  - Inclusão universal de `loading="lazy"` e `decoding="async"` em listagens (`ShowcaseCatalog.jsx`, `CarCard.jsx`, `FavoritesPage.jsx`, `Home.jsx`).
  - Remoção de filtros gaussianos contínuos (`backdrop-blur`) em elementos de renderização contínua e cabeçalhos fixos, restaurando 60 FPS lisos.

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
- **Scanner Pericial de Lataria Amassada & Testes de IA**:
  - Inclusão de fotos de alta fidelidade para testes periciais (`carro_lataria_amassada.jpg` e `carro_parachoque_danificado.jpg`) em `frontend/public/images/` e `backend/public_images/`.
  - Atualização do `AutomatchScan.jsx` com barra de cenários de teste rápido pericial (Lataria Amassada com deformidade severa na porta, Dano no para-choque e Carro 100% íntegro).
  - Atualização do `ShowcaseVehicleDetails.jsx` com seletor de amostras de lataria e integração direta com o recalculo do motor AutoPrice™.
- **Visor Orbital 360° com Quadrantes Fotográficos**:
  - `Vehicle360Viewer.jsx` aprimorado com galeria fotográfica multi-quadrantes (Frente, Diagonais, Laterais e Traseira).
  - Hotspots tridimensionais vinculados ao ângulo correspondente da carroceria com popover de detalhe e estimativa de reparo.
- **Bateria Global de Casos de Uso (End-to-End)**:
  - Criação de `backend/test_usecases_full_battery.py` cobrindo 100% dos 8 casos de uso do sistema (Scanner IA, Visor 360°, Termômetro FIPE, TCO, PDF com QR Code, Hub B2B, Chat e Gestão de Anúncios).
- **Validação e Confiabilidade**:
  - Nova Suíte 13 de testes automatizados adicionada em `backend/test_full_system_review.py`.
  - Frontend compilado com 100% de sucesso via Vite (`2.236 módulos transformados em 13.36s`).

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
