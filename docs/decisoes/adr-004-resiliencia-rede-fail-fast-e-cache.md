# ADR-004: Resiliência de Rede com Fail-Fast e Estratégia de Caching

## Título
Implementação de timeouts com `AbortSignal.timeout` e cache em memória com TTL no frontend e backend.

## Status
Aprovado

## Data
21/09/2026

## Contexto
Durante testes de estresse em conexões lentas ou com backend momentaneamente indisponível, as requisições HTTP do frontend permaneciam abertas indefinidamente (bloqueando a interface do usuário com spinners infinitos). Adicionalmente, consultas repetitivas da Tabela FIPE e débitos cadastrais DETRAN geravam sobrecarga desnecessária e atrasos de até 6 segundos.

## Decisão
1. **Proteção Fail-Fast no Frontend**:
   - `AbortSignal.timeout(1200ms)` em chamadas de catálogo de vitrine e favoritos.
   - `AbortSignal.timeout(1500ms)` em integrações de laudo cautelar e DETRAN.
   - Em caso de timeout ou erro de rede, o frontend ativa fallback instantâneo e transparente para o catálogo local em cache (`showcaseData.js` e `localStorage`), garantindo que o comprador nunca veja uma tela em branco.
2. **Estratégia de Cache no Backend**:
   - Cache em memória com TTL de 24 horas para cotações FIPE por código e ano.
   - Connection Pooling otimizado no SQLAlchemy (`pool_size=10`, `max_overflow=20`, `pool_recycle=1800`).

## Alternativas Consideradas
- **Timeouts longos padrão do navegador (30 a 60 segundos)**: Rejeitados por causarem percepção de congelamento da aplicação e abandono do usuário.
- **Service Worker com Cache Storage**: Considerado complementar, mas a proteção nativa via `AbortSignal` no cliente React mostrou-se mais leve e determinística.

## Consequências
- **Positivas**: Tempo de resposta percebido reduzido para menos de 10ms em consultas cacheadas; eliminação de congelamentos de interface na indisponibilidade do servidor.
- **Negativas**: Pequena latência na primeira consulta fria do dia para novas tabelas FIPE.

## Links Relacionados
- **Documento de Arquitetura**: [docs/arquitetura.md](../arquitetura.md)
- **Relatório de Sprint 04**: [sprints/sprint-04.md](../../sprints/sprint-04.md)

