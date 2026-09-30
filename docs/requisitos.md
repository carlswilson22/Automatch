# Especificação de Requisitos — Automatch™

Este documento consolida os requisitos funcionais, requisitos não funcionais, público-alvo e critérios de aceitação da plataforma **Automatch**.

---

## 1. Visão do Produto

O **Automatch** é uma plataforma web para compra, venda e avaliação de veículos que estabelece um novo padrão de segurança e transparência no mercado automotivo. O sistema audita anúncios de veículos através de **Visão Computacional**, **Diagnóstico Acústico de Motor**, **Scanner de Pneus**, **Histórico DETRAN** e **Preço FIPE**, viabilizando simulações comerciais inovadoras como a **Troca com Troco** e sincronização multicanal para lojistas.

---

## 2. Público-Alvo

- **Compradores de Seminovos e Usados**: Buscam transparência na conservação real do veículo, sem riscos de vícios ocultos mecânicos ou pendências no DETRAN.
- **Vendedores Particulares**: Desejam anunciar seus veículos de forma rápida e com laudo pericial que valorize o bem.
- **Lojistas e Concessionárias**: Necessitam gerenciar estoques com ferramentas profissionais de exportação multicanal (Webmotors, OLX, iCarros, ML) e CRM.
- **Avaliadores e Peritos**: Utilizam a plataforma para registro e emissão de laudos de conformidade estrutural.

---

## 3. Problema e Objetivos

### Problema
A desconfiança generalizada gerada por fotos de baixa qualidade, históricos de leilão omitidos, multas não declaradas e a impossibilidade do comprador leigo avaliar a integridade do motor e pneus à distância.

### Objetivos do Projeto
1. Automatizar a vistoria e auditoria visual da lataria de veículos com precisão milimétrica.
2. Fornecer avaliação acústica remota da marcha lenta do motor.
3. Permitir a conferência instantânea da regularidade cadastral (DETRAN) e de mercado (FIPE).
4. Oferecer simulações financeiras completas com modelo inovador de "Troca com Troco".

---

## 4. Requisitos Funcionais (RF)

| ID | Nome | Descrição |
| :--- | :--- | :--- |
| **RF-01** | **Scanner Pericial de Carroceria** | O sistema deve processar imagens do veículo e identificar avarias na lataria com coordenadas (X, Y), classificação de gravidade e custo estimado de reparo. |
| **RF-02** | **Varredura 360° Interativa** | O sistema deve permitir a inspeção da carroceria em rotação contínua 360° por arraste e modo automático, com hotspots por quadrante angular. |
| **RF-03** | **Diagnóstico Acústico do Motor** | O sistema deve analisar a assinatura sonora do motor (~820 RPM), exibindo waveform espectral e avaliando tuchos, correias, marcha lenta e admissão/escape. |
| **RF-04** | **Scanner de Desgaste de Pneus** | O sistema deve aferir a profundidade dos sulcos em mm nas 4 rodas do chassi e validar a conformidade com a Resolução 558/80 do CONTRAN (mínimo 1.6mm). |
| **RF-05** | **Catálogo Multifacetado** | O sistema deve disponibilizar busca e filtros por marca, modelo, ano, faixa de preço, quilometragem, transmissão e combustível. |
| **RF-06** | **Referência de Preço FIPE** | O sistema deve exibir a cotação oficial da Tabela FIPE comparada ao preço anunciado, destacando o percentual e valor de economia. |
| **RF-07** | **Dossiê de Transparência** | O sistema deve apresentar a linha do tempo do veículo, histórico de sinistros, leilão e parecer técnico independente. |
| **RF-08** | **Auditoria DETRAN** | O sistema deve consultar e exibir situação cadastral, débitos de IPVA, licenciamento, multas e restrições judiciais (RENAJUD). |
| **RF-09** | **Simulador Troca com Troco** | O sistema deve avaliar o veículo de entrada do cliente e calcular se há saldo a pagar ou troco a receber em dinheiro via Pix. |
| **RF-10** | **Comparador Multi-Bancos** | O sistema deve simular parcelas de financiamento comparando taxas entre Itaú Auto, Santander Auto e BV Financeira. |
| **RF-11** | **Radar de Oportunidades** | O sistema deve permitir o cadastro de alertas de queda de preço com notificações via WhatsApp, E-mail e WebPush. |
| **RF-12** | **Assistente IA Especialista (RAG)** | O sistema deve disponibilizar chatbot consultivo com respostas contextualizadas no veículo em visualização. |
| **RF-13** | **Chat com o Vendedor** | O sistema deve permitir o envio de mensagens em tempo real e redirecionamento de contato para o WhatsApp. |
| **RF-14** | **Sincronizador Multicanal B2B** | O sistema deve permitir a exportação simultânea de anúncios para os 3 canais homologados: Webmotors, OLX Autos e AutoCerto DMS. |
| **RF-15** | **Feed XML Automotivo** | O sistema deve fornecer endpoint com feed de estoque padronizado no formato AutoXML / Webmotors. |
| **RF-16** | **Publicação de Anúncios com IA** | O sistema deve guiar o anunciante em etapas com compressão de imagens e pré-análise pericial automática. |
| **RF-17** | **Exclusão Atômica de Anúncios** | O sistema deve permitir a exclusão segura de anúncios (`DELETE /api/cars/{id}`) com confirmação no frontend. |
| **RF-18** | **Identificação Multi-Lojas** | O sistema deve segmentar veículos por revenda e concessionária parceira com dados de contato e endereço. |
| **RF-19** | **Autenticação Unificada** | O sistema deve fornecer modal único para login e cadastro com hash PBKDF2 e tokens JWT. |
| **RF-20** | **Planos de Assinatura & Checkout** | O sistema deve gerenciar planos de anúncio (*Gratuito, Pro, Revenda, Concessionária*) com checkout seguro e negociação direta com vendedores via chat/WhatsApp sem taxa de reserva online. |
| **RF-21** | **Dossiê em PDF Vetorial com QR Code** | O sistema deve gerar e exportar laudo pericial oficial em PDF vetorial A4 (ReportLab) com métricas de conformidade e QR Code de autenticidade escaneável (300 DPI). |
| **RF-22** | **Validação Pública de Laudos** | O sistema deve disponibilizar página pública (`/validar/:protocolo`) para conferência imediata da autenticidade e validade dos laudos periciais emitidos. |
| **RF-23** | **Recuperação de Senha com OTP** | O sistema deve disponibilizar recuperação de senha via código OTP de 6 dígitos com expiração em 15 minutos, rate limiting defensivo de 3 req/hora e modal com popup em modo desenvolvimento. |
| **RF-24** | **Paginação do Catálogo no Servidor** | O sistema deve paginar a busca de veículos nativamente no banco de dados (`limit=20`, `offset`), com envelope padronizado e navegação numérica no frontend. |
| **RF-25** | **Central de Favoritos** | O sistema deve permitir que usuários salvem veículos favoritos com sincronização em tempo real e visualização dedicada em `/favoritos`. |
| **RF-26** | **Auditoria de Laudos em PDF por IA** | O sistema deve receber laudos periciais em PDF anexados pelo anunciante, validar integridade via magic bytes (`%PDF-`) e executar auditoria pericial automatizada com Gemini AI e motor heurístico local. |
| **RF-27** | **Vídeo Pericial de 15 Segundos** | O sistema deve exibir player de vídeo pericial de 15s integrado aos anúncios com timeline interativa, checkpoints periciais (frente, lateral/pneus e traseira/motor) e endpoint para upload de mídias de vistoria. |
| **RF-28** | **Comparador Multidimensional Lado a Lado** | O sistema deve permitir a comparação simultânea de até 3 veículos lado a lado analisando preço vs FIPE, quilometragem anual estimada, integridade pericial de laudo, pendências DETRAN e ficha técnica sem utilização de trustscore. |

---

## 5. Requisitos Não Funcionais (RNF)

| ID | Categoria | Descrição |
| :--- | :--- | :--- |
| **RNF-01** | **Desempenho** | O tempo de resposta das consultas de catálogo deve ser inferior a 200ms em média sob carga normal. |
| **RNF-02** | **Segurança** | As senhas devem ser armazenadas com hash PBKDF2-HMAC-SHA256 e salts aleatórios de 16 bytes. Sessões devem usar tokens JWT com tempo de expiração. |
| **RNF-03** | **Disponibilidade** | A arquitetura deve operar com microsserviços conteinerizados sob Nginx com tolerância a falhas e healthchecks. |
| **RNF-04** | **Confiabilidade** | O sistema deve manter suíte de testes de integração cobrindo 100% dos fluxos periciais e de dados críticos. |
| **RNF-05** | **Usabilidade** | A interface deve ser responsiva (mobile-first), adotando design moderno com TailwindCSS e animações fluidas. |
| **RNF-06** | **Escalabilidade** | A camada de cache em Redis deve absorver consultas repetitivas de placas e tabela FIPE para preservar recursos do banco. |
| **RNF-07** | **Compatibilidade** | O frontend deve rodar nos principais navegadores modernos (Chrome, Firefox, Safari, Edge) sem necessidade de plugins proprietários. |
| **RNF-08** | **Privacidade (LGPD)** | Dados sensíveis de compradores e placas de veículos devem ser protegidos contra exposição indevida. |

---

## 6. Critérios de Aceitação & Definition of Done (DoD)

Para que uma funcionalidade seja considerada concluída:
1. Deve possuir validação de tipos com Pydantic v2 e componentes tipados no frontend.
2. Deve retornar status HTTP semânticos corretos (200, 201, 400, 404, 422).
3. Deve ser coberta por testes automatizados na suíte de testes do projeto.
4. O código deve compilar em modo de produção (`npm run build`) sem erros de lint ou dependência.
5. Deve estar documentada no README e integrada ao Docker Compose.
