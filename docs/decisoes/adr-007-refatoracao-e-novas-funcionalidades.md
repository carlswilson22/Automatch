# ADR-007: Refatoração e Implementação de Novas Funcionalidades

## Título

Última reunião: Refatoração e implementação de novas funcionalidades

## Status

Feito

## Data

2026-09-08 (8/09/2026)

## Contexto

Consertar as funcionalidades que não estão agindo da forma devida e adicionar novas funcionalidades ao sistema:
- Identificou-se a necessidade de sanar atritos de usabilidade, como descidas de scroll indevidas na transição de telas e excesso de elementos visuais dispersos na página de detalhes do veículo.
- A cobrança de taxa de reserva online (sinal financeiro antecipado de R$ 1.500) gerava receio nos compradores e insegurança contra golpes.
- Havia demanda dos usuários por uma forma direta e ágil de salvar e monitorar veículos favoritados.
- Foi necessária a implementação de auditoria inteligente de laudos cautelares em PDF com inteligência artificial para certificar a procedência física e estrutural dos carros anunciados.

## Decisão

1. **Refatoração e Limpeza de Interface**:
   - Ajustar a paleta e a cor de fundo nos cards e detalhes de anúncios, priorizando a **Perícia Visual IA** e a **Varredura 360° Interativa**.
   - Implementar o componente global `ScrollToTop` para garantir que toda troca de rota inicie com a visualização no topo.
2. **Nova Aba de Veículos Curtidos**:
   - Desenvolver a página de favoritos (`/favoritos`) sincronizada em tempo real com os botões de curtida dos anúncios e acessível a partir do cabeçalho.
3. **Substituição da Reserva Online por Negociação Direta**:
   - Remover a taxa de reserva de sinal de R$ 1.500 e promover o botão primário "Falar com Vendedor", conectando diretamente o comprador ao lojista/vendedor particular via chat interno e WhatsApp.
4. **Auditoria de Laudos Cautelares com IA**:
   - Implementar pipeline pericial em [`uploads.py`](../../backend/routers/uploads.py) e [`ai_service.py`](../../backend/services/ai_service.py) com Google Gemini 1.5 Flash Document AI, validação física de Magic Bytes (`%PDF-`) e exibição no `LaudoFeedbackCard`.
5. **Divisão Operacional da Equipe**:
   - Carlos Wilson lidera o desenvolvimento de código, APIs e estabilidade técnica; Vinicius Aurelio, Paulo Artur e Matheus (Teteu) assumem a governança, especificações e documentação técnica institucional.

## Alternativas consideradas

- **Manter a função de reserva online com sinal financeiro**: Descartada por **não ser totalmente seguro para o usuário**, gerar atrito na jornada de compra, afastar clientes com receio de fraudes e demandar complexa gestão de custódia financeira.
- **Auditoria exclusivamente manual de laudos**: Descartada por ser lenta e inviabilizar o crescimento da base de anúncios.
- **Manter abas de diagnóstico na página de detalhes**: Descartada devido à poluição visual e lentidão no carregamento inicial.

## Consequências

- **Melhor eficácia do sistema**: Navegação mais rápida, objetiva e sem quebras de layout.
- **Maior segurança e transparência**: Eliminação do risco de fraudes financeiras de sinal online, promovendo a negociação direta com visita presencial para test-drive.
- **Alta precisão na procedência veicular**: Laudos em PDF passam por triagem automatizada com score pericial de 0 a 100 e validação de pilares estruturais.
- **Aderência aos critérios institucionais e de produção**: Arquitetura pronta para homologação acadêmica e operação real.

## Links relacionados

### Pull Requests
- [Pull Request #1 — Limpeza de Anúncios, Favoritos e Homologação B2B AutoCerto](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH/pull/1)
- [Pull Request #2 — Negociação Direta ("Falar com Vendedor") e Auditoria de Laudos em PDF com IA](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH/pull/2)
- [Pull Request #3 — Dossiê em PDF Vetorial A4 com QR Code, Segurança OTP e Catálogo Paginado](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH/pull/3)
- [Pull Request #4 — Auditoria Global de QA, Performance Backend e UI/UX com Skeletons e Acessibilidade](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH/pull/4)

### Issues
- [Issue #12 — Central de Veículos Favoritos e Sincronização de Curtidas](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH/issues/12)
- [Issue #14 — Eliminação de Scroll Indesejado na Alternância de Rotas (ScrollToTop)](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH/issues/14)
- [Issue #18 — Remoção da Taxa de Reserva de Sinal e Implementação do Botão Falar com Vendedor](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH/issues/18)
- [Issue #19 — Auditoria Automatizada de Laudos em PDF via IA Multimodal e Magic Bytes](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH/issues/19)
- [Issue #20 — Checklist Pericial dos 4 Pilares Estruturais no Laudo Cautelar](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH/issues/20)
- [Issue #22 — Geração de Laudo Pericial em PDF Vetorial A4 com QR Code Autêntico](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH/issues/22)
- [Issue #24 — Recuperação de Senha Segura com Código OTP de 6 Dígitos e Rate Limiting](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH/issues/24)
- [Issue #25 — Paginação do Catálogo no Servidor com Envelope Padronizado e Navegação Numérica](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH/issues/25)
- [Issue #26 — Auditoria Global de QA, Performance e UI/UX](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH/issues/26)
