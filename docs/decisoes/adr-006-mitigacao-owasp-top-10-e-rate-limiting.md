# ADR-006: Mitigação de Vulnerabilidades OWASP Top 10 e Rate Limiting no Consultor IA

## Título
Aplicação de controles de segurança defensiva em camadas (OWASP A01 a A05) e proteção anti-abuso.

## Status
Aprovado

## Data
10/10/2026

## Contexto
Durante a auditoria de segurança da plataforma, foram identificados pontos que exigiam hardening contra exploração:
1. Risco de Broken Access Control (OWASP A01) na exclusão atômica de anúncios e acesso a dados multilocatários entre concessionárias concorrentes.
2. Risco de negação de serviço e estouro de cota da API Gemini no chat do Consultor IA (OWASP A04).
3. Risco de bypass de tipos em uploads multipart através de arquivos com extensões forjadas.

## Decisão
Implementar um conjunto integrado de medidas de segurança defensiva:
1. **Controle de Acesso Multilocatário (OWASP A01)**:
   - Validação em nível de banco de dados (`Car.store_id == current_user.store_id` ou `current_user.is_admin`) em todas as operações de mutação e exclusão.
2. **Rate Limiting em Memória (OWASP A04)**:
   - Classe `RateLimiter` em `backend/security_guard.py` limitando requisições no chat do Consultor IA a 30 chamadas por minuto por endereço IP (`/api/chat` e `/api/chat/stream`), com bloqueio temporário de 60s em caso de abuso.
3. **Validação Estrita de Magic Bytes**:
   - Inspeção dos bytes iniciais do fluxo binário (`%PDF-` para laudos, `\xFF\xD8\xFF` para JPEG e `\x89PNG\r\n\x1a\n` para PNG) antes de gravar em disco ou repassar aos parsers.
4. **Cabeçalhos HTTP Defensivos no Nginx Gateway**:
   - `X-Frame-Options: SAMEORIGIN`
   - `X-Content-Type-Options: nosniff`
   - `X-XSS-Protection: 1; mode=block`
   - `Referrer-Policy: strict-origin-when-cross-origin`

## Alternativas Consideradas
- **Cloudflare WAF comercial**: Descartado neste estágio para assegurar a autonomia e execução local do projeto em ambiente acadêmico ou corporativo fechado.

## Consequências
- **Positivas**: Proteção comprovada contra ataques automatizados de força bruta e DoS; aprovação de 10/10 testes da auditoria de segurança (`test_security_audit.mjs`).
- **Negativas**: Usuários em redes corporativas com mesmo IP externo compartilham o limite de 30 req/min do Consultor IA.

## Links Relacionados
- **Guia de Segurança**: [SECURITY.md](../../SECURITY.md)
- **Bateria de Testes de Segurança**: `frontend/tests/test_security_audit.mjs`
- **Módulo de Proteção**: `backend/security_guard.py`

