# Configuracao do Dominio www.studdo.com.br

## 1. Railway — Custom Domain

1. Abra o dashboard Railway: https://railway.com/project/b786bbcb-a443-4a00-9f34-157056bd9542
2. Selecione o servico → **Settings** → **Networking** → **Custom Domain**
3. Adicione `www.studdo.com.br`
4. Railway vai gerar um CNAME target (ex: `xxx.up.railway.app`)
5. Copie esse valor para usar no passo 2

## 2. Registro.br — DNS

1. Acesse https://registro.br e faca login
2. Va no dominio `studdo.com.br` → **DNS** → **Editar zona**
3. Adicione um registro CNAME:
   - **Nome:** `www`
   - **Tipo:** CNAME
   - **Dados:** `[CNAME target do Railway]`
   - **TTL:** 3600
4. Para redirecionar o dominio raiz (`studdo.com.br` → `www.studdo.com.br`):
   - Use o servico de redirecionamento do registro.br, ou
   - Configure Cloudflare como proxy (plano gratuito) para suportar naked domain

> **Nota:** Railway nao suporta naked domains nativamente. O `next.config.ts` ja tem redirect de `studdo.com.br` → `www.studdo.com.br`.

## 3. Supabase — Atualizar URLs

1. Acesse o Supabase Dashboard → **Authentication** → **URL Configuration**
2. Atualize **Site URL** para: `https://www.studdo.com.br`
3. Em **Redirect URLs**, adicione:
   - `https://www.studdo.com.br/**`
   - Mantenha as URLs existentes (Railway e localhost)

## 4. Railway — Variavel de Ambiente

1. No Railway, atualize/adicione a env var:
   - `NEXT_PUBLIC_SITE_URL` = `https://www.studdo.com.br`

## 5. Verificacao

Apos propagacao DNS (pode levar ate 48h, geralmente < 1h):

```bash
# Testar resolucao DNS
dig www.studdo.com.br CNAME

# Testar se o site responde
curl -sI https://www.studdo.com.br | head -5

# Testar redirect do dominio raiz
curl -sI http://studdo.com.br | grep -i location
```
