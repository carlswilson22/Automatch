# Automatch — marketplace automotivo e análise assistida de veículos

**Correções de 17/11/2026:** os cinco problemas da [revisão da demonstração](docs/revisao-pendencias-demo-2026-11-17.md)
foram corrigidos com regressões permanentes: dados do anúncio/PDF, quilometragem,
favoritos separados por conta e cadastro local sem falso sucesso. Sem deploy ou
reformulação do banco; conferência visual e de acessibilidade permanece manual.

**Limpeza de 18/11/2026:** retirados 15 módulos sem uso e quatro dependências.
Auditoria de imports sem órfãos, lint sem avisos e testes dos fluxos mantidos
aprovados. Ver [o que foi removido e preservado](docs/limpeza-arquivos-2026-11-18.md).

Documentação revisada em **18/11/2026**, com melhorias demonstrativas sobre a base `444bc09`.
Projeto Integrador de Análise e Desenvolvimento de Sistemas do CEUB.
Equipe registrada: Carlos Wilson, Matheus Porto, Paulo Arthur e Vinicius Aurelio.

## Repositórios e publicação

- **Principal:** [carlswilson22/Automatch](https://github.com/carlswilson22/Automatch).
- **Secundário institucional:** [CAMPUSCEUB/ADS-AUTOMATCH](https://github.com/CAMPUSCEUB/ADS-AUTOMATCH).
- Toda atualização publicada na `main` do principal deve ser levada à `main`
  do secundário. **Não alterar as outras branches do secundário.**
- Procedimento: [sincronização dos repositórios](docs/sincronizacao-repositorios.md).

O GitHub Pages do principal apresenta o frontend estático em modo demonstrativo.
Ele não executa FastAPI, banco, uploads ou IA no servidor. A aplicação completa
exige backend e banco próprios. A documentação distingue operação com API,
amostras locais, integrações simuladas e recursos fora do escopo ativo.

A etapa atual é apenas demonstrativa: **sem deploy e sem reformulação do banco**.
A reformulação para a futura execução local aguarda autorização específica.
O workflow de Pages é manual; enviar commits às duas `main` não publica o site.
Para experimentar as amostras, use o modo demo descrito em
[configuração e execução](docs/configuracao-e-execucao.md).

## Funcionalidades e limites

| Área | Situação atual |
| --- | --- |
| Catálogo e anúncios | Busca/filtros, paginação da API, cadastro, edição e exclusão autorizada; galeria e detalhes |
| Contas | Cadastro/login, perfil, JWT, recuperação OTP; produção exige SMTP para entregar o código |
| Favoritos | Área autenticada com persistência no navegador; sem sincronização de favoritos em banco |
| Visualização 360° | Sequência fotográfica por veículo; depende das imagens disponíveis, não é reconstrução 3D |
| Scanner de lataria | Análise de imagem por serviços de visão/IA e alternativas locais; sem precisão pericial certificada |
| Laudos enviados | PDF/imagem, validação de conteúdo e análise assistida; resultado requer conferência humana |
| PDF e validação pública | Documento Automatch com protocolo/snapshot registrado; não é laudo oficial de órgão público |
| Comparação, financiamento e TCO | Comparação de dados e estimativas ilustrativas; sem aprovação bancária ou cotação vinculante |
| Rede B2B | Lojas/parcerias, estoque compartilhado, reservas temporárias, mensagens por consultas periódicas e fechamento via API |
| DETRAN e placa | Bases de demonstração; não há consulta oficial de débitos/restrições contratada |
| FIPE | Parte dos fluxos consulta BrasilAPI e usa cache por código/ano; falhas sem preço substituto; conferir fonte e competência |
| Multicanal e XML | Prévia e histórico de simulação; XML do catálogo atual na API ou do anúncio em demo; nenhum envio externo |
| Alertas de preço | Interesse na API ou navegador em demo e prévia de queda de preço no site; sem envio externo |
| Checkout | Simulação em desenvolvimento; produção retorna indisponibilidade sem provedor de pagamento |
| Pneus e diagnóstico acústico | Não fazem parte da interface ativa; arquivos e endpoints legados não representam funcionalidade entregue |

Consulte o [estado atual](docs/estado-atual.md), os [requisitos](docs/requisitos.md)
e o [backlog](BACKLOG.md). Não há certificação WCAG AAA, garantia de acurácia da
IA, disponibilidade contratada ou cobertura integral de testes comprovadas.

## Stack e arquitetura

React 18, React Router 7, Vite 8 e TailwindCSS 3 no frontend; Python 3.11,
FastAPI, SQLAlchemy e Alembic no backend; PostgreSQL 15 no Compose e SQLite
para desenvolvimento/testes. Visão usa OpenCV/Ultralytics e integração opcional
Gemini; PDFs usam ReportLab. Os manifests são a referência de versões.
A API é um backend modular; o Compose atual tem quatro serviços e não inclui Redis.

## Executar com Docker

Na raiz, com Docker e Compose disponíveis:

```sh
git clone https://github.com/carlswilson22/Automatch.git
cd Automatch
cp .env.example .env
docker compose up -d --build
```

No PowerShell, usar `Copy-Item .env.example .env` em lugar de `cp`.
Preencher a configuração local sem versionar segredos. O exemplo serve ao
ambiente de desenvolvimento. Veja [configuração e execução](docs/configuracao-e-execucao.md)
para instalação sem Docker, produção e explicação dos arquivos de ambiente.

| Serviço em desenvolvimento | Endereço |
| --- | --- |
| Gateway | `http://localhost` ou `http://localhost:3000` |
| Frontend Vite | `http://localhost:5173` |
| Swagger da API | `http://localhost:8000/docs` |
| OpenAPI | `http://localhost:8000/openapi.json` |
| PostgreSQL exposto no host | `127.0.0.1:5433` |

## Acesso público da demonstração — GitHub Pages

| Campo | Valor |
| --- | --- |
| E-mail | `admin@automatch.com` |
| Senha | `admin123` |

Esses acessos são públicos e destinados à apresentação no modo de demonstração
do GitHub Pages. Sua manutenção na documentação foi autorizada pelo responsável
pelo projeto em 17/11/2026. Não são credenciais privadas de uma instalação real.
Na instalação do cliente, configurar acesso administrativo próprio por
`ADMIN_SEED_PASSWORD`, com segredo JWT e demais credenciais privados.

## Verificar alterações

No diretório `frontend`:

```sh
npm ci
npm run lint
npm test
npm run build
```

No diretório `backend`, com dependências instaladas:

```sh
python run_tests.py
```

O executor do backend usa bancos/arquivos temporários e não carrega o `.env`
local. Não substituir esse comando por roteiros antigos contra um banco real.
Os totais e resultados históricos ficam em [testes e evidências](docs/testes-e-evidencias.md);
não são resultados novos a cada leitura deste README. A conferência visual é manual.

## Documentação

O [índice completo](docs/README.md) organiza requisitos, arquitetura, banco,
catálogo de arquivos, decisões, sprints, entregas e relatórios históricos.

- [Contribuição](CONTRIBUTING.md) e [sincronização](docs/sincronizacao-repositorios.md).
- [Segurança](SECURITY.md) e [código de conduta](CODE_OF_CONDUCT.md).
- [Changelog](CHANGELOG.md), [licença MIT](LICENSE) e [atribuições de terceiros](NOTICE).
