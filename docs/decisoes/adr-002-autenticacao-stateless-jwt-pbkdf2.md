# ADR-002: Autenticação Stateless com JWT e Criptografia PBKDF2

## Título
Gerenciamento de sessões autenticadas sem estado com tokens JWT e hash de senhas PBKDF2-HMAC-SHA256.

## Status
Aprovado

## Data
25/08/2026

## Contexto
O Automatch atende múltiplos perfis de usuários (compradores, vendedores particulares, peritos e lojistas B2B). O uso de sessões tradicionais mantidas em memória no servidor (*stateful sessions*) gerava problemas de escalabilidade horizontal, necessidade de replicação de sessões e vulnerabilidades a ataques CSRF quando integradas a clientes mobile ou SPAs desvinculadas.

## Decisão
Implementar autenticação totalmente sem estado (*stateless*):
1. **Tokens de Acesso JWT (RFC 7519)**: Assinados com algoritmo HMAC-SHA256 (`HS256`) contendo claims mínimas (`sub`, `role`, `store_id`, `exp`), com expiração de 24 horas.
2. **Armazenamento Seguro de Senhas**: Utilizar algoritmo PBKDF2-HMAC-SHA256 com 100.000 iterações e salt aleatório de 16 bytes gerado criptograficamente por usuário.
3. **Controle de Acesso Baseado em Funções (RBAC)**: Dependências injetáveis no FastAPI (`get_current_user`, `require_admin`, `require_store_owner`) protegendo rotas críticas.

## Alternativas Consideradas
- **Sessões baseadas em Cookies e Redis Session Store**: Descartada devido à complexidade de compartilhamento de domínio entre gateways e APIs REST externas.
- **OAuth2 com Provedores Externos exclusivamente (Google/Facebook)**: Descartada como via única para permitir operação autônoma da plataforma em redes corporativas de concessionárias.

## Consequências
- **Positivas**: A API torna-se totalmente escalável horizontalmente sem afinidade de sessão (*sticky session*); autenticação rápida e verificada via chave secreta sem consulta obrigatória ao banco a cada requisição.
- **Negativas**: A revogação imediata de tokens antes da expiração exige uma blacklist em memória (implementada via cache TTL).

## Links Relacionados
- **Documento de Arquitetura**: [docs/arquitetura.md](../arquitetura.md)
- **Módulo de Segurança**: `backend/routers/auth.py` e `backend/security_guard.py`
- **Relatório de Sprint 01**: [sprints/sprint-01.md](../../sprints/sprint-01.md)
