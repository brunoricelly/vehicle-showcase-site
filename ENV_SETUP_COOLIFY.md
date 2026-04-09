# Configuração de Variáveis de Ambiente no Coolify

Este guia explica como configurar as variáveis de ambiente necessárias no painel do Coolify para que sua aplicação funcione corretamente.

## 🔧 Variáveis Obrigatórias

### 1. **DATABASE_URL** (PostgreSQL)
**Descrição:** URL de conexão com seu banco de dados PostgreSQL  
**Valor:** `postgres://usuario:senha@host:porta/banco`

**Exemplo com seu banco:**
```
postgres://postgres:eHWDQ6LFz9MSrSqlDMHT2qViCQ2IvbyGi0QDrjhn9Uxk1MnaWET7G55ernVuLiQa@5.78.67.95:5384/postgres
```

**Como verificar se está funcionando:**
```bash
# Na sua VPS, teste a conexão
psql -U postgres -h 5.78.67.95 -p 5384 -d postgres
```

---

### 2. **PORT** (Porta do Servidor)
**Descrição:** Porta em que o servidor Node.js vai rodar  
**Valor:** `3000` (ou outra porta disponível)

**⚠️ IMPORTANTE:** O servidor agora usa **estritamente** a porta definida aqui. Se a porta estiver ocupada, o servidor vai parar com erro.

---

### 3. **OAUTH_SERVER_URL** (Autenticação Manus)
**Descrição:** URL do servidor OAuth do Manus  
**Valor:** `https://api.manus.im`

**Como verificar se está funcionando:**
```bash
curl https://api.manus.im/health
```

---

### 4. **VITE_APP_ID** (ID da Aplicação)
**Descrição:** ID único da sua aplicação no Manus  
**Valor:** Fornecido pelo Manus (procure em seu painel)

---

### 5. **VITE_OAUTH_PORTAL_URL** (Portal de Login)
**Descrição:** URL do portal de login do Manus  
**Valor:** `https://oauth.manus.im`

---

### 6. **JWT_SECRET** (Segredo de Sessão)
**Descrição:** Chave secreta para assinar cookies de sessão  
**Valor:** Gere uma string aleatória forte (mínimo 32 caracteres)

**Como gerar:**
```bash
openssl rand -base64 32
```

---

### 7. **OWNER_NAME** (Seu Nome)
**Descrição:** Seu nome como proprietário da loja  
**Valor:** `Bruno` (ou seu nome)

---

### 8. **OWNER_OPEN_ID** (Seu ID Manus)
**Descrição:** Seu ID único no Manus (usado para identificar admin)  
**Valor:** Fornecido pelo Manus

---

## 🔧 Variáveis Opcionais (Já Configuradas pelo Manus)

Estas variáveis são injetadas automaticamente pelo Manus e não precisam ser configuradas:

- `BUILT_IN_FORGE_API_URL` - URL da API interna do Manus
- `BUILT_IN_FORGE_API_KEY` - Chave de API interna
- `VITE_FRONTEND_FORGE_API_URL` - URL da API para frontend
- `VITE_FRONTEND_FORGE_API_KEY` - Chave de API para frontend
- `VITE_ANALYTICS_ENDPOINT` - Endpoint de analytics
- `VITE_ANALYTICS_WEBSITE_ID` - ID do website para analytics
- `WEBHOOK_API_KEY` - Chave para webhooks do n8n

---

## 📋 Checklist de Configuração

- [ ] DATABASE_URL está correto e conecta ao PostgreSQL
- [ ] PORT está definido (ex: 3000)
- [ ] OAUTH_SERVER_URL = https://api.manus.im
- [ ] VITE_APP_ID está preenchido
- [ ] VITE_OAUTH_PORTAL_URL = https://oauth.manus.im
- [ ] JWT_SECRET é uma string aleatória forte
- [ ] OWNER_NAME está preenchido
- [ ] OWNER_OPEN_ID está preenchido
- [ ] NODE_ENV = production (em produção)

---

## 🚀 Como Configurar no Coolify

1. Acesse o painel do Coolify
2. Vá até seu projeto "vehicle-showcase-site"
3. Clique em **"Settings"** ou **"Environment"**
4. Adicione cada variável acima
5. Clique em **"Redeploy"** para aplicar as mudanças

---

## ✅ Verificação Pós-Deploy

Após fazer o deploy, teste:

```bash
# Health check
curl https://veiculos.chatwoot.space/health

# Deve retornar:
{"status":"ok"}
```

Se receber erro, verifique:
1. Se DATABASE_URL está correto
2. Se OAUTH_SERVER_URL está configurado
3. Se a porta está disponível
4. Veja os logs do Coolify para mais detalhes

---

## 🐛 Troubleshooting

### Erro: "Port 3000 is already in use"
**Solução:** Mude a variável PORT para outra porta (ex: 3001, 3002)

### Erro: "OAUTH_SERVER_URL is not configured"
**Solução:** Verifique se OAUTH_SERVER_URL está definido como `https://api.manus.im`

### Erro: "Failed to connect to PostgreSQL"
**Solução:** Verifique se DATABASE_URL está correto e se o banco está acessível

### Erro: "User not found" ao fazer login
**Solução:** Verifique se OWNER_OPEN_ID está correto e se você já fez login uma vez

---

## 📞 Suporte

Se tiver dúvidas, consulte:
- DEPLOY.md - Guia completo de deployment
- README_POSTGRES.md - Guia de setup PostgreSQL
- Logs do Coolify - Verifique os logs para erros específicos
