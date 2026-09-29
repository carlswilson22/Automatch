# Entrega 02 — Dossiê de Laudos com QR Code, Auditoria DETRAN/FIPE, TCO e Comparador

## Identificação
* **Título:** Entrega Parcial 2 — Dossiê Pericial Oficial, Serviços de Auditoria e Comparador Técnico
* **Data:** 25/09/2026
* **Instituição:** Centro Universitário de Brasília (CEUB)
* **Curso:** Análise e Desenvolvimento de Sistemas (ADS)
* **Disciplina:** Projeto Integrador 2 (PI 2)
* **Equipe:** Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio
* **Professor Orientador:** Prof. Flávio César

## Sprints relacionadas
* [Sprint 03 — Laudo Pericial em PDF A4 com QR Code](../sprints/sprint-03.md)
* [Sprint 04 — Resolução de Gargalos, Vídeo 15s e Comparador](../sprints/sprint-04.md)
* [Sprint 05 — Termômetro FIPE, TCO e Price Drop Tracker](../sprints/sprint-05.md)

## Escopo
Desenvolvimento e homologação do motor de geração de laudos cautelares em PDF vetorial A4 de alta resolução com ReportLab, acompanhado de QR Code escaneável para validação pública na rota `/validar/:protocolo`. Integração de consultas automotivas (DETRAN e FIPE com cache Redis), criação do comparador multidimensional de 2 a 3 veículos, calculadora de Custo Total de Posse (TCO) e rastreador de reduções de preço (Price Drop Tracker).

## Links principais
* **Repositório Primário:** [carlswilson22/Automatch](https://github.com/carlswilson22/Automatch)
* **Repositório Institucional:** [CAMPUSCEUB/ADS-AUTOMATCH](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH)
* **Backlog de Requisitos:** [BACKLOG.md](../BACKLOG.md)
* **Histórico de Mudanças:** [CHANGELOG.md](../CHANGELOG.md)

## Critérios atendidos
1. **Laudo Pericial Oficial em PDF**: Geração de documento de 2 a 4 páginas em ReportLab, incorporando checklist visual pericial, dados cadastrais, integridade mecânica e QR Code de 300 DPI.
2. **Página de Validação Pública**: Acesso desautenticado seguro em `/validar/{protocolo}` para conferência instantânea por compradores e lojistas.
3. **Auditoria de Débitos DETRAN**: Normalização de placas Mercosul e antigas, com extração de IPVA, multas e restrições judiciais (RENAJUD).
4. **Comparador Técnico Multidimensional**: Comparação lado a lado de até 3 veículos em 5 dimensões técnicas com acordeão responsivo.
5. **Calculadora TCO**: Projeção detalhada de custo diário e mensal dividida em 4 pilares: IPVA por estado, Seguro, Combustível e Manutenção preventiva.
6. **Price Drop Tracker**: Tags visuais de oportunidade e histórico expansível com evolução de preços do anúncio.

## Validação e Evidências
* **Bateria Global de Casos de Uso**: Aprovação de 100% dos testes em `backend/test_usecases_full_battery.py` cobrindo os 8 casos de uso de ponta a ponta.
* **Testes de Conexão e Carga**: Pool do SQLAlchemy calibrado (`pool_size=10`, `max_overflow=20`), reduzindo latência em acessos simultâneos.
* **Validação de Build**: Compilação Vite em 13.36s sem dependências órfãs.

## Limitações conhecidas na época
* Carga excessiva na GPU provocada por múltiplos filtros `backdrop-blur` no frontend.
* Visualizador 360° exibia fotos genéricas ao girar determinados veículos.

## Próximos passos
* Otimização global de Core Web Vitals, code-splitting com `React.lazy` e reconstrução do visualizador 360° orbital (Sprint 06).
* Refinamento visual da vitrine, alinhamento B2B e upload multifoto (Sprint 07).
