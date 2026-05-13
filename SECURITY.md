# Security Rules

Obligatorio: cargar y seguir el skill `owasp-security` al escribir o revisar código de seguridad.

# INDEV Security Standards

Always:
- validate all inputs
- sanitize outputs
- use typed schemas
- never trust client input
- use rate limiting
- protect against SSRF
- prevent prompt injection
- use parameterized queries
- store secrets in env vars
- never expose API keys
- secure JWT handling
- implement RBAC when needed
- use secure cookies
- use async-safe database access
- implement request logging
- validate uploads
- limit payload size
- apply OWASP Top 10 practices
