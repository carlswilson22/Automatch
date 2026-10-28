# Entrega 02 — Perícia por Inteligência Artificial, Dossiê com QR Code e Comparador

## Identificação
- **Projeto**: Automatch™ — Marketplace Automotivo com Perícia por Inteligência Artificial
- **Instituição**: Centro Universitário de Brasília (CEUB)
- **Curso**: Análise e Desenvolvimento de Sistemas (ADS)
- **Equipe**: Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio
- **Data da Entrega**: 25/09/2026

## Sprint Relacionada
Consolidação das **Sprints 03, 04 e 05** (Milestones `v2.1.0`, `v2.2.0` e `v2.3.0`).

## Escopo
1. **Dossiê Vetorial em PDF com QR Code**: Emissão de laudo cautelar oficial A4 em ReportLab com autenticação por QR Code de 300 DPI redirecionando para validação pública (`/validar/{protocolo}`).
2. **Scanner Pericial IA (Visão + Acústica + Pneus)**:
   - Motor híbrido com OpenCV adaptativo em 5 zonas anatômicas e fallback com Google Gemini Vision.
   - Diagnóstico acústico de rotação (~820 RPM) avaliando tuchos e marcha lenta.
   - Aferição de profundidade dos sulcos de pneu em conformidade com o CONTRAN (Resolução 558/80).
3. **Vídeo Pericial de 15 Segundos**: Player interativo com timeline de inspeção e checkpoints (Frente, Linha de Cintura/Pneus e Traseira/Motor).
4. **Comparador Multidimensional**: Confronto de até 3 veículos analisando preço vs FIPE, histórico pericial, KM anual estimada e situação DETRAN sem uso de métricas proprietárias.
5. **Termômetro de Mercado & Calculadora TCO**: Medição de dispersão frente à FIPE e custo mensal projetado (IPVA, seguro, combustível e manutenção).

## Links Principais
- **Repositório**: `CAMPUSCEUB/ADS-AUTOMATCH`
- **Validação Pública de Laudos**: Rota `/validar/:protocolo`
- **Relatórios de Sprint**: [sprint-03](../sprints/sprint-03.md), [sprint-04](../sprints/sprint-04.md) e [sprint-05](../sprints/sprint-05.md)
- **ADRs Associados**: [ADR-003](../docs/decisoes/adr-003-motor-hibrido-visao-computacional.md), [ADR-004](../docs/decisoes/adr-004-resiliencia-rede-fail-fast-e-cache.md) e [ADR-007](../docs/decisoes/adr-007-refatoracao-e-novas-funcionalidades.md)

## Critérios Atendidos
- [x] Emissão de laudos periciais vetoriais de alta resolução com hash de validação pública.
- [x] Motor de visão computacional detectando avarias estruturais com coordenadas relativas e cálculo de custo de reparo.
- [x] Segurança de autenticação com fluxo de recuperação por código OTP de 6 dígitos.
- [x] Suíte de testes automatizados com cobertura end-to-end (`test_usecases_full_battery.py`).

## Validação
- **Bateria Global de Casos de Uso**: 100% de aprovação nos 8 fluxos principais do sistema.
- **Validação do QR Code**: Escaneamento por dispositivos móveis redirecionando para a tela pública de laudo com autenticidade confirmada.
- **Responsáveis pela Verificação**: Carlos Wilson e Equipe Fullstack Automatch.

## Limitações
- Queda de taxa de quadros (FPS) observada em dispositivos móveis devido a múltiplos filtros gaussianos contínuos (`backdrop-blur`).
- Troca incorreta de modelo de veículo observada em determinados ângulos da varredura orbital 360°.

## Pendências Conhecidas
- Desoneração de GPU no visualizador 360° e code-splitting dos modais pesados de comparação e alertas.
- Isolamento multilocatário estrito de dados de estoque no painel B2B.

## Próximos Passos
- Refatorar a renderização do visualizador 360° para perspectiva 3D contínua acelerada por hardware na Entrega 03.
- Aplicar code-splitting dinâmico com `React.lazy()` e realizar auditoria completa de segurança OWASP Top 10.
