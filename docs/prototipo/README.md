# 🎨 Protótipo de Alta Fidelidade — Automatch™

Este documento formaliza o **Protótipo Interativo de Alta Fidelidade (UI/UX)** da plataforma **Automatch™**, desenvolvido no **Figma** para orientar a arquitetura visual, o design system e a experiência do usuário (UX) em todas as jornadas do sistema.

---

## 🔗 Links Oficiais do Protótipo

| Artefato | Descrição | Link de Acesso |
| :--- | :--- | :--- |
| **Projeto no Figma (Design)** | Arquivo de design com todos os frames, componentes, variantes e design system | [Abrir no Figma](https://www.figma.com/design/O0idlMRlPkxnmLzbPVQjY7/Pr%C3%B3tipo-Automatch?node-id=0-1&p=f&t=rFZQxPaViaihmlcm-0) |
| **Visualização Interativa (Prototype)** | Modo de apresentação interativo navegável (fluxos clicáveis) | [Executar Protótipo Interativo](https://www.figma.com/proto/O0idlMRlPkxnmLzbPVQjY7/Pr%C3%B3tipo-Automatch?node-id=0-1&scaling=scale-down&starting-point-node-id=0%3A1) |

---

## 🏛️ Identificação Institucional

- **Instituição:** Centro Universitário de Brasília (CEUB)
- **Curso:** Análise e Desenvolvimento de Sistemas (ADS)
- **Disciplina:** Projeto Integrador 2 (PI 2)
- **Repositório Oficial:** [CAMPUSCEUB/ADS-AUTOMATCH](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH.git) | [carlswilson22/Automatch](https://github.com/carlswilson22/Automatch.git)
- **Equipe de Desenvolvimento:** Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio

---

## 📱 Mapeamento de Telas e Fluxos Prototipados

O protótipo no Figma contempla todas as telas e macro-jornadas implementadas na aplicação:

### 1. Jornada do Comprador (B2C)
* **Página Inicial (Landing Page):** Apresentação da proposta de valor, busca rápida de veículos, selos de auditoria pericial e depoimentos.
* **Vitrine Digital (`/encontrar`):** Catálogo responsivo com filtros facetados (marca, modelo, carroceria Sedan/SUV/Hatch, ano e faixa de preço em BRL), ordenação e cards com indicadores visuais de oportunidade de mercado frente à Tabela FIPE.
* **Detalhes do Veículo (`/encontrar/:id`):** 
  * Galeria orbital fotográfica em 8 ângulos de 45° (`Vehicle360Viewer`);
  * Player com timeline pericial de vídeo de 20s com divisão de fases (frente, cintura e traseira);
  * Emissão instantânea de certidão e Dossiê Pericial Oficial em PDF com QR Code público;
  * Calculadora de Custo Total de Posse (TCO Mensal) detalhado por estado/UF;
  * Chatbot Consultor IA contextualizado exclusivamente nos dados e no laudo do carro.
* **Comparador Multidimensional de Veículos:** Confronto simultâneo de 2 a 3 veículos em 5 dimensões técnicas (Preço vs FIPE, KM/ano, integridade de laudo, pendências DETRAN e ficha técnica).

### 2. Jornada do Vendedor & Anunciante
* **Cadastro de Novo Anúncio (`/novo-anuncio`):** Formulário em etapas para inserção de dados do veículo, upload de fotos e filmagem pericial curta.
* **Scanner Pericial de Lataria por IA:** Análise automatizada de imagens para identificação de avarias com bounding boxes, cálculo de orçamento estimado de reparo e impacto na precificação.
* **Upload e Auditoria de Laudos Cautelares:** Módulo com análise multimodal via Gemini 1.5 Flash realizando conferência cadastral (Placa, Chassi, Ano, KM) e matriz de riscos estruturais/documentais (sinistro, leilão, remarcações).
* **Painel Meus Anúncios (`/meus-anuncios`):** Acompanhamento de status das publicações, controle de visibilidade e edição de anúncios.

### 3. Jornada do Lojista & Rede de Conexão B2B
* **Dashboard de Gestão de Ativos (`/dashboard`):** Visão consolidada multi-lojas com KPIs de pátio em tempo real, valor adensado e inventário configurável (piso de repasse e margem operacional).
* **Radar B2B com Simulador:** Painel de repasse com ajuste reativo de markup lojista e cálculo de preço final sugerido ao cliente.
* **Hub da Rede de Conexão B2B (`PartnershipHubModal`):**
  * **Aba 1 — Estoque Compartilhado:** Vitrine de veículos de concessionárias parceiras com piso mínimo protegido e simulador de margem;
  * **Sub-modal — Trava de Reserva Exclusiva (Hold Lock):** Formalização de reserva com trava temporária que congela o veículo durante a negociação;
  * **Aba 2 — Minhas Parcerias:** Conexão com novas lojas credenciadas, envio de propostas personalizadas e taxas de comissão;
  * **Aba 3 — Minhas Reservas:** Monitoramento em tempo real de veículos sob Hold Lock com contagem regressiva e solicitação de fechamento de venda;
  * **Aba 4 — Repasses Concluídos:** Histórico de negociações finalizadas com emissão de protocolo auditado e registro financeiro.

---

## 🎨 Design System & Padrões Visuais

O protótipo define as diretrizes estéticas implementadas no código-fonte através do **TailwindCSS** e **MicroKit UI**:

| Elemento | Especificação / Token | Aplicação no Sistema |
| :--- | :--- | :--- |
| **Cor Primária (Dark Navy)** | `#0A0F1D` / `#0F172A` | Cabeçalhos institucionais, backgrounds profundos e footers |
| **Cor de Ação (Brand Blue)** | `#2563EB` / `#1D4ED8` | Botões de ação primária, estados ativos e links |
| **Cor de Sucesso (Emerald)** | `#10B981` / `#059669` | Selos de laudo aprovado, status ativo e indicador de margem |
| **Cor de Alerta (Amber/Orange)**| `#F59E0B` / `#D97706` | Avisos de Hold Lock, atenção pericial e pendências |
| **Cor de Risco (Rose/Red)** | `#EF4444` / `#DC2626` | Restrições documentais, avarias estruturais e sinistro |
| **Tipografia** | Inter / Outfit Sans-Serif | Hierarquia visual com pesos 400 (Regular), 600 (Bold) e 800/900 (Black) |
| **Acessibilidade** | WCAG AAA | Contraste mínimo de 7:1 para textos, suporte a leitores de tela e navegação por teclado |

---

## 📐 Rastreabilidade com Requisitos do Sistema

| Requisito Funcional | Tela Prototipada | Status de Implementação |
| :--- | :--- | :---: |
| **RF-01** — Catálogo com Filtros | Vitrine Digital | ✅ Implementado |
| **RF-02** — Varredura 360° | Detalhes do Veículo (Vehicle360Viewer) | ✅ Implementado |
| **RF-03** — Scanner IA de Lataria | Novo Anúncio (AutomatchScan) | ✅ Implementado |
| **RF-04** — Dossiê em PDF com QR Code | Detalhes do Veículo (OfficialDossierModal) | ✅ Implementado |
| **RF-05** — Termômetro FIPE & TCO | Detalhes do Veículo (MarketPriceIndicator / TcoCalculatorCard) | ✅ Implementado |
| **RF-06** — Hub B2B & Hold Lock | Dashboard Lojista (PartnershipHubModal) | ✅ Implementado |
| **RF-07** — Comparador Multidimensional | Modal Comparador (VehicleComparatorModal) | ✅ Implementado |
| **RF-08** — Auditoria de Laudo por IA | Anúncio e Detalhes (LaudoFeedbackCard) | ✅ Implementado |
