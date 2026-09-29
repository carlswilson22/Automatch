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

// Cartões únicos do projeto organizados exatamente em suas respectivas colunas operacionais
const cards = [
  // 1. BACKLOG DO PROJETO (Roadmap e Histórias Priorizadas)
  { title: "Planilha Excel Backlog do Projeto", column: "Backlog", body: "Consolidação do backlog MoSCoW com Story Points, RICE e rastreabilidade CEUB." },
  { title: "Banco de Dados & Otimização de Pool", column: "Backlog", body: "PostgreSQL 15 com SessionLocal, pool de conexões assíncrono e migrations." },
  { title: "[ATM-AUTH-02] Recuperação de Senha com OTP", column: "Backlog", body: "Código numérico de 6 dígitos com expiração de 15 minutos e rate limiting defensivo de 3 req/hora." },
  { title: "[ATM-CAT-03] Paginação no Servidor e Otimização de Busca", column: "Backlog", body: "Envelope de paginação padronizado e busca textual ilike combinada em brand, model e description." },
  { title: "[ATM-FIN-04] Sincronizador Multicanal e Feed XML", column: "Backlog", body: "Sincronização automatizada para portais parceiros (AutoAvaliar, OLX Autos) com feed XML padronizado." },
  { title: "[ATM-FIN-05] Radar de Oportunidades & Alerta de Queda de Preço", column: "Backlog", body: "Notificações de redução de preço focadas via WhatsApp e E-mail com sanitização defensiva." },
  { title: "[ATM-AI-03] Consultor IA Automatch com Memória Multi-turn", column: "Backlog", body: "Chatbot consultor automotivo com memória multi-turn e árvore semântica anti-repetição." },

  // 2. A FAZER
  { title: "[ATM-AI-05] Fazer implementação de feedback do yolov8 após upload de laudos cautelares", column: "A Fazer", body: "Extrair fotos de peças anexadas no PDF cautelar via PyMuPDF e submeter ao YOLOv8 para confrontar o texto do laudo com as marcações visuais." },

  // 3. FAZENDO
  { title: "[ATM-B2B-01] Implementação de Conexão b2b com lojas parceiras", column: "Fazendo", body: "Conexão entre concessionárias para estoque compartilhado, reservas temporárias com hold lock de 30 minutos e propostas de repasse." },

  // 4. FINALIZADO
  { title: "Front-end", column: "Finalizado", body: "Interface SPA em React 18, Vite e TailwindCSS com 0 erros de build, Core Web Vitals e 60 FPS." },
  { title: "Back-end", column: "Finalizado", body: "API REST assíncrona FastAPI, SQLAlchemy ORM, Pydantic v2 e suíte completa de testes aprovada." },
  { title: "Protótipo", column: "Finalizado", body: "Fluxo completo de telas navegáveis (Vitrine, Detalhes, Dashboard, Comparador, Favoritos e Checkout)." },
  { title: "Modelagem de dados", column: "Finalizado", body: "Modelos relacionais SQLAlchemy (Car, User, Store, Watchlist) com integridade referencial." },
  { title: "Consertando Modelos dentro da Modelagem de Dados", column: "Finalizado", body: "Adicionados índices index=True em compartilhavel e status_reserva no modelo Car com testes aprovados." },
  { title: "Implementação da IA do gemini", column: "Finalizado", body: "Google Gemini 1.5 Flash Vision operacional para vistoria descritiva com compressão LANCZOS." },
  { title: "Melhoria de velocidade IA gemini", column: "Finalizado", body: "Tempo de resposta de inferência pericial reduzido de 8s para menos de 1.8s." },
  { title: "Implementação yolov8", column: "Finalizado", body: "Motor Ultralytics CV com detecção de avarias estruturais da lataria e caixas delimitadoras." },
  { title: "Fazer implementação de upload de laudos cautelares", column: "Finalizado", body: "Upload seguro com validação de magic bytes (%PDF-) rejeitando arquivos inválidos." },
  { title: "Implementação API Detran", column: "Finalizado", body: "Consulta cadastral de IPVA, multas e restrições judiciais RENAJUD para placas antigas e Mercosul." },
  { title: "Documentação arquitetura de software", column: "Finalizado", body: "Documento oficial de arquitetura com diagramas C4, sequência, componentes e decisões ADR-01 a ADR-06." },
  { title: "Documentação completa", column: "Finalizado", body: "Padrão acadêmico institucional CEUB cobrindo Sprints 00 a 07 e Entregas avaliativas 01 a 03." },
  { title: "Diagrama de Sequencia", column: "Finalizado", body: "Mapeamento dos fluxos transacionais de vistoria pericial, cotação FIPE e precificação." },
  { title: "Diagrama de Componentes", column: "Finalizado", body: "Arquitetura de microsserviços, gateway Nginx, cache Redis e persistência PostgreSQL." },
  { title: "Diagrama de Caso de Uso", column: "Finalizado", body: "33 Requisitos Funcionais e 8 Não-Funcionais especificados em docs/requisitos.md." },
  { title: "Implementação de Varredura 360 graus", column: "Finalizado", body: "Visualizador orbital fotográfico 360° em 8 ângulos contínuos com perspectiva 3D realista." },
  { title: "Implementação de Vídeo pericial de 15s", column: "Finalizado", body: "Player integrado de vídeo pericial de 15 segundos em 3 checkpoints com timeline interativa." },
  { title: "Implementação de TCO", column: "Finalizado", body: "Calculadora de Custo Total de Posse decomposta em 4 pilares: IPVA por estado, seguro, combustível e manutenção." },
  { title: "Implementação de Comparador Multidimensional", column: "Finalizado", body: "Confronto lado a lado de até 3 veículos em 5 dimensões técnicas com lazy loading e seletor in-slot." }
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

  console.log(`Iniciando criação de ${cards.length} cartões organizados por coluna...`);

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
