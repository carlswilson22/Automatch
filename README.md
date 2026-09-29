# 🚗 Automatch™ — Marketplace Automotivo, Rede B2B & Perícia por IA

[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white)](https://redis.io/)
[![OpenCV](https://img.shields.io/badge/OpenCV-Computer%20Vision-5C3EE8?logo=opencv&logoColor=white)](https://opencv.org/)

Plataforma automotiva Fullstack de alta fidelidade que une **marketplace de compra e venda de veículos**, **perícia veicular por IA (OpenCV + YOLOv8 + Google Gemini)**, **varredura orbital 360° fotográfica com perspectiva 3D**, **auditoria cadastral DETRAN/FIPE**, **emissão de laudos cautelares em PDF vetorial A4 com QR Code público**, **rede de conexão B2B entre concessionárias parceiras** com estoque compartilhado e reservas com hold lock, e **motor algorítmico AutoPrice™** com calculadora de TCO.

---

## 📋 Informações do Projeto

* **Instituição:** Centro Universitário de Brasília (CEUB)
* **Curso:** Análise e Desenvolvimento de Sistemas (ADS)
* **Disciplina:** Projeto Integrador 2 (PI 2)
* **Equipe de Engenharia:** Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio
* **Professor Orientador:** Prof. Flávio César
* **Identificador Acadêmico:** `ADS-AUTOMATCH-2026`
* **Repositório Primário:** [carlswilson22/Automatch](https://github.com/carlswilson22/Automatch)
* **Repositório Secundário (Institucional):** [CAMPUSCEUB/ADS-AUTOMATCH](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH)
* **Quadro de Gestão Ágil (GitHub Projects):** [Desenvolvimento PI 2](https://github.com/users/carlswilson22/projects) (Estruturado em 4 colunas: *Backlog do Projeto*, *A Fazer*, *Fazendo* e *Finalizado*)

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologias Principais |
| :--- | :--- |
| **Frontend** | React 18, Vite 5, TailwindCSS 3.4, Framer Motion, Lucide Icons, Canvas API |
| **Backend** | Python 3.11, FastAPI assíncrono, SQLAlchemy ORM, Pydantic v2, APScheduler |
| **Inteligência Artificial** | OpenCV (5 zonas anatômicas), Ultralytics YOLOv8, Google Gemini 1.5 Flash Vision |
| **Documentos & Mídia** | ReportLab (Laudo A4 vetorial), QRCode 300 DPI, Pillow (LANCZOS) |
| **Infraestrutura** | Docker Compose, PostgreSQL 15, Redis 7, Nginx Gateway (Alpine) |
| **Segurança & Boas Práticas** | JWT (RFC 7519), PBKDF2-HMAC-SHA256, Magic Bytes, OWASP A01 Access Control |

---

## 🌟 Principais Funcionalidades

1. **Varredura 360° Fotográfica & Perspectiva 3D Orbital:**
   - Visualizador orbital fotográfico 360° em 8 ângulos contínuos com perspectiva tridimensional real e iluminação dinâmica de estúdio, garantindo fidelidade estrita do próprio veículo em exibição (sem substituição por fotos genéricas).
   - Motor de Visão Computacional com análise adaptativa em 5 zonas anatômicas medindo descontinuidades e custos estimados de reparo.

2. **Dossiê & Laudo Pericial Oficial com QR Code:**
   - Geração de laudo cautelar em PDF vetorial A4 de alta resolução via ReportLab.
   - QR Code de 300 DPI direcionando para a página pública de validação digital desautenticada (`/validar/{protocolo}`).

3. **Rede de Conexão B2B & Repasse de Estoque entre Concessionárias:**
   - Painel exclusivo para lojistas visualizarem estoque compartilhado em tempo real com paginação server-side.
   - Sistema de reserva temporária de veículos com hold lock de 30 minutos e cronômetro desacoplado de alta precisão a 60 FPS.
   - Gestão de convites de parceria com persistência e contingência offline resiliente.

4. **Catálogo Inteligente com Filtros em Cascata & Busca Reativa:**
   - Barra de pesquisa integrada no topo central da vitrine digital com debounce de alto desempenho.
   - Filtros dependentes em cascata (Marcas ➔ Modelos relacionados), ano, câmbio, combustível e faixa de preço min/max.
   - Interface despoluída sem ícones decorativos inoperantes e com destaque para oportunidade "Preço Baixou".

5. **Cadastro de Anúncios com Galeria Multifoto & Vídeo Pericial 15s:**
   - Uploader drag-and-drop multifoto com preview em grade, controle de imagem de capa e remoção individual.
   - Campo para inserção de vídeo de vistoria pericial de 15 segundos acompanhado de preview dinâmico com player integrado.
   - Restrição da opção de compartilhamento na Rede B2B para contas autenticadas com perfil de revenda/lojista.

6. **Comparador Técnico Multidimensional:**
   - Confronto simultâneo de até 3 veículos em 5 dimensões técnicas (FIPE vs Preço, KM/ano, Integridade de Laudo, Débitos DETRAN e Ficha Técnica), com carregamento sob demanda por acordeão e seletor embutido no slot vazio.

7. **Calculadora TCO & Termômetro de Mercado:**
   - Custo Total de Posse mensal e diário detalhado (IPVA proporcional por UF, seguro, combustível e manutenção preventiva).
   - Indicador visual de dispersão de preço frente à Tabela FIPE e rastreador de reajustes de preço (*Price Drop Tracker*).

8. **Performance, Core Web Vitals & Desoneração de GPU:**
   - Code-splitting dinâmico com `React.lazy()` para todos os modais pesados, reduzindo o bundle inicial em até 40%.
   - Pipeline universal de imagens com `loading="lazy"` e `decoding="async"`.
   - Remoção de filtros gaussianos contínuos (`backdrop-blur`), assegurando 60 FPS lisos.
   - Resiliência de rede com proteção fail-fast via `AbortSignal.timeout(1200ms)`.

---

## 🚀 Como Executar

### Pré-requisitos
* [Docker](https://docs.docker.com/get-docker/) e [Docker Compose](https://docs.docker.com/compose/) instalados.

### 1. Clonar o repositório
```bash
git clone https://github.com/carlswilson22/Automatch.git
cd Automatch
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
```

### 3. Iniciar em Modo de Desenvolvimento
```bash
docker compose up -d --build
```

### 4. Iniciar em Modo de Produção (Bundle Otimizado Nginx)
```bash
docker compose -f docker-compose.prod.yml up -d --build
```

### 5. Acompanhar os logs
```bash
docker compose logs -f
```

---

## 🌐 Portas & Acesso Local

| Serviço | Endereço | Descrição |
| :--- | :--- | :--- |
| **Aplicação Web (SPA)** | `http://localhost` ou `http://localhost:5173` | Interface principal do Automatch |
| **API Docs (Swagger UI)** | `http://localhost:8000/docs` | Documentação interativa dos endpoints FastAPI |
| **OpenAPI Schema** | `http://localhost:8000/openapi.json` | Contrato OpenAPI da aplicação |
| **PostgreSQL** | `localhost:5432` (`db: automatch`) | Banco de dados relacional |
| **Cache Redis** | `localhost:6379` | Cache de sessões e consultas FIPE |

---

## 🔑 Credenciais Padrão (Ambiente de Demonstração)

* **Administrador / Lojista:** `admin@automatch.com` | Senha: `admin123`
* **Usuário Comprador:** `comprador@automatch.com` | Senha: `user123`

---

## 🧪 Testes Automatizados

Para executar a suíte completa de testes de integração e casos de uso no contêiner:
```bash
# Teste de visão computacional, exclusão e laudos
docker compose exec backend python test_vision_and_delete.py

# Teste de rede B2B, DETRAN e placas
docker compose exec backend python test_b2b_and_plate.py

# Teste da bateria completa de casos de uso (E2E)
docker compose exec backend python test_usecases_full_battery.py
```
*Status esperado:* **100% de aprovação em todas as suítes**.

---

## 📚 Governança & Documentação Completa

* 📊 [**BACKLOG.md**](BACKLOG.md) — Quadro Kanban oficial de desenvolvimento, rastreabilidade e histórias de usuário.
* 📝 [**CHANGELOG.md**](CHANGELOG.md) — Histórico detalhado de mudanças por versão e sprint.
* 🏃 [**Sprints (00 a 07)**](sprints/README.md) — Relatórios quinzenais de planejamento, execução e retrospectiva.
* 📦 [**Entregas Avaliativas (01 a 03)**](entregas/README.md) — Registros das entregas parciais e final da disciplina PI 2.
* 📐 [**docs/arquitetura.md**](docs/arquitetura.md) — Arquitetura de microsserviços, diagramas C4 e modelos de dados.
* 📋 [**docs/requisitos.md**](docs/requisitos.md) — Matriz completa de Requisitos Funcionais (RF) e Não-Funcionais (RNF).

---

## 📄 Licença

Projeto desenvolvido para fins acadêmicos e de inovação tecnológica no **CEUB (Centro Universitário de Brasília)**. Todos os direitos reservados à equipe **Automatch**.
