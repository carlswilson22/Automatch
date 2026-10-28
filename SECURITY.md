# Segurança e Proteção de Dados — Automatch™

A integridade do código, a conformidade com a LGPD e a proteção de credenciais são prioridades absolutas na arquitetura do Automatch.

---

## 1. Diretrizes de Proteção

- **Variáveis de Ambiente**: NUNCA envie arquivos `.env` para o Git. Utilize sempre `.env.example` com placeholders.
- **Segredos e Chaves**: Chaves de API (ex: `GEMINI_API_KEY`), senhas de banco (`POSTGRES_PASSWORD`) e segredos de token (`JWT_SECRET`) devem ser configuradas exclusivamente via variáveis de ambiente protegidas.
- **Senhas e Criptografia**: Senhas de usuários devem ser salvas utilizando PBKDF2-HMAC-SHA256 com salts aleatórios de alta entropia.
- **Proteção OWASP**:
  - Validação estrita de Magic Bytes (`%PDF-`, `\xFF\xD8\xFF`, `\x89PNG`) em uploads.
  - Rate limiting ativo em endpoints públicos e de inteligência artificial.
  - Controle rigoroso de acesso e isolamento multilocatário por loja.

---

## 2. Reporte de Vulnerabilidades e Incidentes

Caso identifique qualquer brecha de segurança ou exposição acidental de credencial:
1. Notifique imediatamente os mantenedores do projeto.
2. Não abra issues públicas com detalhes de exploits ou senhas expostas.
3. Proceda com a rotação imediata de credenciais e tokens afetados.

