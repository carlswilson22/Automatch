# ADR-003: Motor Híbrido de Visão Computacional (Edge Local + Cloud Fallback)

## Título
Combinação de Visão Computacional local (OpenCV + YOLOv8) com Google Gemini Multimodal Vision.

## Status
Aprovado

## Data
08/09/2026

## Contexto
A perícia visual automatizada de lataria e carroceria é o diferencial tecnológico central do Automatch. Depender exclusivamente de APIs de nuvem proprietárias traz riscos de custo elevado por chamada, latência imprevisível em horários de pico e indisponibilidade se a chave de API falhar ou a conexão externa cair. Por outro lado, depender unicamente de modelos de visão locais restringe a riqueza semântica das justificativas textuais emitidas no laudo pericial.

## Decisão
Adotar uma arquitetura híbrida e resiliente para o endpoint `/api/analise-visual`:
1. **Pré-processamento e Validação**: Compressão e normalização automática via Pillow com algoritmo LANCZOS (resolução máxima de 1024x1024 px) e validação de Magic Bytes.
2. **Motor Primário de Visão Local**: OpenCV com detecção adaptativa de descontinuidades em 5 zonas anatômicas (Capô/Teto, Para-choque Frontal, Lateral Direita, Lateral Esquerda e Traseira) e inferência YOLOv8 para mapeamento de coordenadas (X, Y) e score de integridade.
3. **Enriquecimento em Nuvem**: Quando `GEMINI_API_KEY` estiver configurada, orquestrar chamada ao Google Gemini 1.5 Flash Vision para gerar parecer pericial descritivo contextualizado.
4. **Resiliência Total**: Se a API de nuvem falhar ou não estiver configurada, o motor local OpenCV assume automaticamente a emissão do laudo sem retornar erro 500 ao usuário.

## Alternativas Consideradas
- **Apenas Gemini Cloud**: Custo insustentável em alta volumetria e vulnerabilidade total a indisponibilidade de rede.
- **Apenas OpenCV puro**: Menor flexibilidade na interpretação de laudos textuais complexos em PDF e respostas consultivas no chat.

## Consequências
- **Positivas**: 100% de disponibilidade da perícia visual mesmo em modo offline ou ambiente isolado; emissão de laudo em menos de 350ms pelo motor local.
- **Negativas**: Necessidade de manter dependências de processamento de imagem compiladas no contêiner backend.

## Links Relacionados
- **Documento de Arquitetura**: [docs/arquitetura.md](../arquitetura.md)
- **Serviço de IA**: `backend/services/ai_service.py` e `backend/routers/ai_vision.py`
- **Relatório de Sprint 02**: [sprints/sprint-02.md](../../sprints/sprint-02.md)
