# Configuração e execução

Atualizado em **17/11/2026**, referência `1b7d094`. Não incluir valores secretos
em commits, relatórios, capturas ou documentação. Os comandos abaixo são guias;
a revisão documental não os executou contra o banco do usuário.

Os acessos públicos do GitHub Pages estão no [README](../README.md), com uso
explicitamente autorizado para demonstração. São distintos dos segredos de
ambiente e das contas de uma instalação real.

## Arquivos de ambiente

Na cópia examinada existem `.env` local, `.env.example` e
`.env.production.example` na raiz. Não foram encontrados `backend/.env` ou
`frontend/.env`. A quantidade pode variar em outros computadores; não existe
uma exigência de manter quatro arquivos `.env`.

| Arquivo | Uso |
| --- | --- |
| `.env` | Configuração privada local; não versionada; Compose usa para interpolação |
| `.env.example` | Modelo versionado para desenvolvimento; copiar e preencher localmente |
| `.env.production.example` | Modelo versionado para produção; não é um ambiente já configurado |
| Arquivos `.env*` adicionais | Opcionais conforme serviço/ferramenta; conferir quem os carrega antes de criar duplicatas |

O backend chama `load_dotenv()` e lê variáveis do processo. O Vite possui seu
próprio ambiente de build; valores `VITE_*` podem ser expostos ao navegador e
não devem conter segredos. No Compose, existir uma variável no arquivo local
não significa que ela foi encaminhada ao container: conferir `environment`.

## Variáveis relevantes

| Grupo | Variáveis | Observação |
| --- | --- | --- |
| Banco | `DATABASE_URL`, `DATABASE_MODE`, `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD` | `db` funciona na rede Docker; host usa porta 5433 no desenvolvimento |
| Ambiente | `ENVIRONMENT`, `ALLOW_DEMO_TOKENS` | Produção rejeita tokens demo e SQLite |
| Sessão | `JWT_SECRET`, `ACCESS_TOKEN_EXPIRE_MINUTES` | Segredo exclusivo em produção; o código implementa assinatura HMAC-SHA256 |
| Administração | `ADMIN_SEED_PASSWORD` | Obrigatória no Compose de produção; não reutilizar senha demonstrativa |
| Origem/mídia | `ALLOWED_ORIGINS`, `UPLOADS_DIR`, `ALLOWED_IMAGE_HOSTS` | Conferir encaminhamento ao processo/container e permissões |
| Gemini | `GEMINI_API_KEY` | Opcional; manter no servidor e homologar modelos/limites |
| Recuperação | `SMTP_HOST`, `SMTP_PORT`, `SMTP_FROM`, `SMTP_USERNAME`, `SMTP_PASSWORD` | Serviço usa STARTTLS; produção sem configuração fica indisponível |
| Frontend demonstrativo | `VITE_DEMO_MODE`, `VITE_ENABLE_DEMO_DATA` | Flags explícitas de amostras locais; não substituem API |
| Frontend/URLs | `VITE_BASE_PATH`, `VITE_BACKEND_URL`, `GITHUB_REPOSITORY` | Base de build e proxy Vite; várias chamadas da aplicação usam `/api` |

`JWT_ALGORITHM` aparece no Compose, mas não deve ser interpretado como suporte
a algoritmos arbitrários: conferir `backend/security.py`. Não prometer um
endpoint alternativo funcionando apenas ao definir `VITE_API_URL`; conferir o
cliente e o proxy da instalação.

## Desenvolvimento com Docker

Na raiz, copiar `.env.example` para `.env`, preencher valores locais e executar:

```sh
docker compose up -d --build
docker compose logs -f
```

Gateway: `http://localhost` ou `http://localhost:3000`; Vite:
`http://localhost:5173`; API/Swagger: `http://localhost:8000/docs`.
PostgreSQL no host: `127.0.0.1:5433`. Não publicar essas credenciais de dev.

## Desenvolvimento sem Docker

Referência: Python 3.11 e Node.js 22, conforme CI. Em PowerShell, no backend:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
$env:ENVIRONMENT = 'development'
$env:DATABASE_MODE = 'sqlite'
$env:DATABASE_URL = 'sqlite:///./automatch_dev.db'
python migrate.py
uvicorn main:app --host 127.0.0.1 --port 8000 --reload
```

Usar um banco de desenvolvimento próprio. Em outro terminal, na raiz:

```powershell
cd frontend
npm ci
npm run dev
```

Vite encaminha `/api` para `127.0.0.1:8000` por padrão. Para PostgreSQL local,
configurar a URL do banco de desenvolvimento e conferir as migrações antes de
iniciar. Criar ambiente virtual não instala o Python no computador.

## Preparação de produção

Preencher um arquivo privado de produção a partir do exemplo, com PostgreSQL,
segredo JWT e senha administrativa próprios, origens e SMTP conforme o uso.
Com o arquivo preparado, o Compose específico é selecionado explicitamente:

```sh
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

Esse exemplo não certifica implantação pronta. Conferir migrações em ambiente
controlado, backup/restauração, mídia persistente, permissões, monitoramento e
segredos. `migrate.py` aplica migrações sem seed/reset; bancos legados exigem
análise da revisão, conforme [banco](../DOCUMENTACAO_BANCO_DE_DADOS.md).

A configuração atual de Nginx de produção escuta HTTP em 80; publicação da
porta 443 não instala certificado nem configura TLS. Definir HTTPS na
infraestrutura. Um worker é usado porque scheduler e limitadores são locais.

## GitHub Pages e verificações

Pages do principal compila somente frontend com base do repositório e modo
demo explícito. Sem API hospedada, não usar esse ambiente como prova de login,
IA, laudo persistido, pagamento ou reserva operacional em servidor.

Executar [testes e verificações](testes-e-evidencias.md) conforme o impacto.
Não usar scripts antigos contra dados reais. Não executar `down -v`, resets
ou limpeza de arquivos como parte de uma atualização documental.
