# Histórico de mudanças

Registre aqui as mudanças relevantes por sprint ou marco avaliativo.

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
