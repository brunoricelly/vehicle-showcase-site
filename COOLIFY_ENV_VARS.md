# Variáveis de Ambiente para Coolify

## 📋 Copie e Cole no Painel do Coolify

Acesse: **Seu Projeto → Settings → Environment Variables**

### Variáveis Obrigatórias

```
DATABASE_URL=postgres://postgres:eHWDQ6LFz9MSrSqlDMHT2qViCQ2IvbyGi0QDrjhn9Uxk1MnaWET7G55ernVuLiQa@5.78.67.95:5384/postgres
PORT=3000
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://oauth.manus.im
VITE_APP_ID=<seu-app-id>
JWT_SECRET=<gere-com-openssl-rand-base64-32>
OWNER_NAME=Bruno
OWNER_OPEN_ID=<seu-open-id-manus>
NODE_ENV=production
```

## 🔍 Como Obter Cada Valor

### DATABASE_URL
Já fornecido: `postgres://postgres:eHWDQ6LFz9MSrSqlDMHT2qViCQ2IvbyGi0QDrjhn9Uxk1MnaWET7G55ernVuLiQa@5.78.67.95:5384/postgres`

### VITE_APP_ID
Procure no seu painel Manus ou na documentação da sua aplicação

### JWT_SECRET
Gere uma string aleatória forte:
```bash
openssl rand -base64 32
```

Exemplo: `K7mPqR9xLnZ2vB5cD8eF1gH4jK6mN0pQ2sT3uV5wX7yZ9aB1cD3eF5gH7jK9lM=`

### OWNER_OPEN_ID
Seu ID único no Manus (fornecido durante o setup)

## ✅ Checklist

- [ ] DATABASE_URL configurado
- [ ] PORT = 3000 (ou porta disponível)
- [ ] OAUTH_SERVER_URL = https://api.manus.im
- [ ] VITE_OAUTH_PORTAL_URL = https://oauth.manus.im
- [ ] VITE_APP_ID preenchido
- [ ] JWT_SECRET preenchido com valor aleatório
- [ ] OWNER_NAME = Bruno
- [ ] OWNER_OPEN_ID preenchido
- [ ] NODE_ENV = production

## 🚀 Após Configurar

1. Clique em **"Redeploy"** no painel do Coolify
2. Aguarde o build e deploy
3. Teste: `curl https://veiculos.chatwoot.space/health`
4. Deve retornar: `{"status":"ok"}`

## 🐛 Se Não Funcionar

Verifique os logs do Coolify para erros específicos:
- "Failed to connect to PostgreSQL" → DATABASE_URL incorreto
- "OAUTH_SERVER_URL is not configured" → OAUTH_SERVER_URL vazio
- "Port 3000 is already in use" → Mude PORT para 3001, 3002, etc.

## 📞 Suporte

Consulte:
- ENV_SETUP_COOLIFY.md - Guia detalhado
- DEPLOY.md - Deployment completo
- Logs do Coolify - Erros específicos
