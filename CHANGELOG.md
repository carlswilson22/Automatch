# Histórico de mudanças

Registre aqui as mudanças relevantes por sprint ou marco avaliativo.

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
