/**
 * Script de Sincronização do Backlog para o GitHub Project v2
 * Automatch™ — CEUB PI 2
 *
 * Como executar:
 *   node scripts/sync_backlog_to_project.js <SEU_GITHUB_TOKEN_COM_ESCOPO_PROJECT> [PROJECT_NUMBER]
 *
 * Exemplo:
 *   node scripts/sync_backlog_to_project.js ghp_xxxxxxxxxxxx 1
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const token = process.argv[2] || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
const projectNumber = process.argv[3] ? parseInt(process.argv[3], 10) : 1;
const repoOwner = 'carlswilson22';
const repoName = 'Automatch';

if (!token) {
  console.error('\x1b[31m[ERRO]\x1b[0m Token do GitHub não fornecido!');
  console.log('\nUso:');
  console.log('  node scripts/sync_backlog_to_project.js <SEU_TOKEN_GITHUB_PAT> [NUMERO_DO_PROJECT]');
  console.log('\nComo gerar o token:');
  console.log('  1. Acesse: https://github.com/settings/tokens');
  console.log('  2. Crie um token clássico com as caixas "repo" e "project" marcadas.');
  console.log('  3. Execute o comando passando o token gerado.');
  process.exit(1);
}

function graphqlRequest(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: 'api.github.com',
      path: '/graphql',
      method: 'POST',
      headers: {
        'User-Agent': 'Automatch-Sync-Script',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (parsed.errors) {
            reject(new Error(JSON.stringify(parsed.errors, null, 2)));
          } else {
            resolve(parsed.data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Definição dos cartões extraídos de BACKLOG.md
const cards = [
  // 1. BACKLOG DO PROJETO
  { title: "Front-End", column: "Backlog", body: "Desenvolvimento da interface SPA em React 18, Vite e TailwindCSS." },
  { title: "Back-End", column: "Backlog", body: "API REST assíncrona FastAPI, SQLAlchemy e Pydantic v2." },
  { title: "Protótipo", column: "Backlog", body: "Telas de vitrine, detalhes, comparador, favoritos e dashboard." },
  { title: "Modelagem Dados", column: "Backlog", body: "Modelos relacionais SQLAlchemy (Car, User, Store, Watchlist)." },
  { title: "Diagrama Caso Uso", column: "Backlog", body: "28 Requisitos funcionais mapeados em docs/requisitos.md e docs/arquitetura.md." },
  { title: "Diagrama Sequenc.", column: "Backlog", body: "Fluxo transacional de vistoria pericial e cotação FIPE." },
  { title: "Diagrama Compon.", column: "Backlog", body: "Arquitetura C4 de microsserviços, cache e reverse proxy." },
  { title: "Doc. Completa", column: "Backlog", body: "README, CHANGELOG, Sprints e Entregas avaliativas do CEUB." },
  { title: "Doc. Arquit. SW", column: "Backlog", body: "Especificação detalhada de arquitetura e decisões técnicas (ADRs)." },
  { title: "Planilha Excel", column: "Backlog", body: "Consolidação do backlog MoSCoW com Story Points e RICE." },
  { title: "Impl. API Gemini", column: "Backlog", body: "Auditoria pericial de imagens com Google Gemini 1.5 Flash Vision." },
  { title: "Impl. API yolov8", column: "Backlog", body: "Detector de componentes estruturais e avarias com Ultralytics YOLOv8." },
  { title: "Impl. API Detran", column: "Backlog", body: "Consulta de multas, débitos de IPVA e restrições judiciais RENAJUD." },
  { title: "Banco de Dados", column: "Backlog", body: "PostgreSQL 15 conteinerizado com connection pooling e índices." },
  { title: "Feedback laudo IA", column: "Backlog", body: "Cruzamento visual e parecer entre OCR de PDF e fotos periciais." },
  { title: "Varredura 360°", column: "Backlog", body: "Visualizador orbital em 8 quadrantes com perspectiva 3D realista." },
  { title: "Vídeo pericial 15s", column: "Backlog", body: "Timeline pericial de vídeo de 15 segundos em 3 checkpoints." },
  { title: "Impl. de TCO", column: "Backlog", body: "Calculadora de Custo Total de Posse mensal e diário com IPVA por UF." },
  { title: "Comparador Multid.", column: "Backlog", body: "Confronto lado a lado de até 3 veículos em 5 dimensões técnicas." },
  { title: "Conexão B2B lojas", column: "Backlog", body: "Rede de repasse de estoque entre concessionárias com hold lock de 30min." },

  // 2. ITENS ESSENCIAIS
  { title: "Front-end (Essencial)", column: "Itens Essenciais", body: "Interface do catálogo, detalhes, busca reativa e filtros." },
  { title: "Back-End (Essencial)", column: "Itens Essenciais", body: "Rotas de autenticação JWT, CRUD de anúncios e laudos." },
  { title: "Protótipo (Essencial)", column: "Itens Essenciais", body: "Fluxo completo de navegação e demonstração funcional." },
  { title: "Modelagem Dados (Essencial)", column: "Itens Essenciais", body: "Estrutura do banco com integridade referencial." },
  { title: "Impl. IA Gemini (Essencial)", column: "Itens Essenciais", body: "Análise pericial descritiva e chat consultor assistido." },
  { title: "Doc. Completa (Essencial)", column: "Itens Essenciais", body: "Relatórios de sprints e entregas acadêmicas do CEUB." },
  { title: "Doc. Arquit. SW (Essencial)", column: "Itens Essenciais", body: "Documento de arquitetura de software e matriz de requisitos." },
  { title: "Impl. API Gemini (Essencial)", column: "Itens Essenciais", body: "Integração estável com Google Generative AI v1beta." },
  { title: "Impl. yolov8 (Essencial)", column: "Itens Essenciais", body: "Identificação automatizada de avarias e caixas delimitadoras." },
  { title: "Integ. Detran (Essencial)", column: "Itens Essenciais", body: "Consulta cadastral de débitos veiculares e placas." },

  // 3. A FAZER
  { title: "[ATM-AI-05] Fazer implementação de feedback do YOLOv8 após upload de laudos cautelares", column: "A Fazer", body: "Extrair fotos de peças anexadas no PDF cautelar via PyMuPDF e submeter ao YOLOv8 para conferir com o laudo textual." },

  // 4. FAZENDO
  { title: "[ATM-B2B-01] Implementação de Conexão b2b com lojas parceiras", column: "Fazendo", body: "Conexão entre concessionárias para estoque compartilhado, reservas temporárias e propostas de repasse." },

  // 5. FINALIZADO
  { title: "Front-end (Finalizado)", column: "Finalizado", body: "Build em produção com 0 erros, Core Web Vitals otimizado e 60 FPS." },
  { title: "Back-end (Finalizado)", column: "Finalizado", body: "Serviço FastAPI assíncrono rodando com 100% dos testes aprovados." },
  { title: "Modelagem de dados (Finalizado)", column: "Finalizado", body: "Esquemas SQLAlchemy com índices em compartilhavel e status_reserva." },
  { title: "Protótipo (Finalizado)", column: "Finalizado", body: "Aplicação SPA completa integrada ao backend e contêineres." },
  { title: "Impl. da IA do gemini (Finalizado)", column: "Finalizado", body: "Gemini 1.5 Flash Vision operacional com cache e compressão LANCZOS." },
  { title: "Impl. upload laudos (Finalizado)", column: "Finalizado", body: "Validação estrita de magic bytes (%PDF-) e extração de dados." },
  { title: "Implementação yolov8 (Finalizado)", column: "Finalizado", body: "Motor Ultralytics CV com detecção de lataria e peças estruturais." },
  { title: "Melhoria velocidade Gemini (Finalizado)", column: "Finalizado", body: "Tempo de resposta reduzido de 8s para < 1.8s." },
  { title: "Doc. arquitetura de sw (Finalizado)", column: "Finalizado", body: "Diagramas C4, sequência, componentes e matriz de riscos." },
  { title: "Documentação completa (Finalizado)", column: "Finalizado", body: "Documentação institucional CEUB (Sprint 00 a 07 e Entregas 01 a 03)." },
  { title: "Impl. API Detran (Finalizado)", column: "Finalizado", body: "Auditoria cadastral de placas com fallback em memória." },
  { title: "Diagrama de Sequencia (Finalizado)", column: "Finalizado", body: "Mapeamento dos fluxos transacionais do sistema." },
  { title: "Diagrama de Componentes (Finalizado)", column: "Finalizado", body: "Estrutura dos microsserviços sob o Gateway Nginx." },
  { title: "Impl. Varredura 360 graus (Finalizado)", column: "Finalizado", body: "Giro orbital fiel ao próprio veículo com perspectiva tridimensional." },
  { title: "Diagrama de Caso de Uso (Finalizado)", column: "Finalizado", body: "33 Requisitos Funcionais especificados e homologados." },
  { title: "Consertando Modelos Dados (Finalizado)", column: "Finalizado", body: "Refatoração e testes de integridade relacional." },
  { title: "Impl. Vídeo pericial 15s (Finalizado)", column: "Finalizado", body: "Player integrado de vídeo de 15 segundos em 3 checkpoints." },
  { title: "Implementação de TCO (Finalizado)", column: "Finalizado", body: "Calculadora de custo mensal e diário com IPVA estadual." },
  { title: "Comparador Multidimens. (Finalizado)", column: "Finalizado", body: "Comparador de até 3 carros simultâneos com lazy loading e seletor embutido." }
];

async function run() {
  console.log('\x1b[36m=== SINCRONIZADOR DE BACKLOG -> GITHUB PROJECT v2 ===\x1b[0m\n');
  console.log(`Buscando projetos do usuário '${repoOwner}' e repositório '${repoOwner}/${repoName}'...`);

  const findProjectsQuery = `
    query {
      user(login: "${repoOwner}") {
        projectsV2(first: 10) {
          nodes {
            id
            number
            title
            url
          }
        }
      }
      repository(owner: "${repoOwner}", name: "${repoName}") {
        projectsV2(first: 10) {
          nodes {
            id
            number
            title
            url
          }
        }
      }
    }
  `;

  let projectNode = null;
  try {
    const data = await graphqlRequest(findProjectsQuery);
    const userProjects = (data.user && data.user.projectsV2.nodes) || [];
    const repoProjects = (data.repository && data.repository.projectsV2.nodes) || [];
    const allProjects = [...userProjects, ...repoProjects];

    console.log(`Encontrados ${allProjects.length} projeto(s):`);
    allProjects.forEach(p => console.log(`  - [#${p.number}] "${p.title}" (${p.url})`));

    projectNode = allProjects.find(p => p.number === projectNumber) || allProjects[0];
  } catch (err) {
    console.error('\x1b[31mErro ao buscar projetos:\x1b[0m', err.message);
    process.exit(1);
  }

  if (!projectNode) {
    console.error(`\x1b[31mNenhum projeto encontrado com o número #${projectNumber}.\x1b[0m`);
    process.exit(1);
  }

  console.log(`\n\x1b[32mUsando Projeto:\x1b[0m [#${projectNode.number}] "${projectNode.title}" (ID: ${projectNode.id})\n`);

  console.log(`Iniciando criação de ${cards.length} cartões/draft issues...`);

  const addDraftMutation = `
    mutation ($projectId: ID!, $title: String!, $body: String!) {
      addProjectV2DraftIssue(input: {
        projectId: $projectId,
        title: $title,
        body: $body
      }) {
        projectItem {
          id
        }
      }
    }
  `;

  let successCount = 0;
  for (let i = 0; i < cards.length; i++) {
    const card = cards[i];
    const fullTitle = `[${card.column.toUpperCase()}] ${card.title}`;
    try {
      await graphqlRequest(addDraftMutation, {
        projectId: projectNode.id,
        title: fullTitle,
        body: `**Coluna:** ${card.column}\n\n${card.body}`
      });
      successCount++;
      process.stdout.write(`\rProgresso: [${successCount}/${cards.length}] cartões criados...`);
    } catch (e) {
      console.error(`\nErro ao criar cartão "${card.title}":`, e.message);
    }
  }

  console.log(`\n\n\x1b[32m[SUCESSO] ${successCount} cartões adicionados com sucesso ao projeto "${projectNode.title}"!\x1b[0m`);
  console.log(`Acesse o quadro: ${projectNode.url}`);
}

run();
