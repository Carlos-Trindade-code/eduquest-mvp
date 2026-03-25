# Email Templates — Studdo

## Como aplicar no Supabase

1. Acesse: https://supabase.com/dashboard/project/gjckregnfklamhdfavyb/auth/templates
2. Para cada template abaixo, copie o HTML e cole no campo correspondente:

### Confirm signup (Confirmacao de email)
- Arquivo: `confirm-signup.html`
- Subject: `Confirme seu email — Studdo`
- Cole o HTML no campo "Body"

### Reset password (Redefinir senha)
- Arquivo: `reset-password.html`
- Subject: `Redefinir sua senha — Studdo`
- Cole o HTML no campo "Body"

### Magic link (Link magico)
- Arquivo: `magic-link.html`
- Subject: `Entrar no Studdo`
- Cole o HTML no campo "Body"

## Importante
- Os templates usam a variavel `{{ .ConfirmationURL }}` do Supabase
- O visual combina com o tema dark/roxo do app
- Todos sao responsivos (mobile-friendly)
