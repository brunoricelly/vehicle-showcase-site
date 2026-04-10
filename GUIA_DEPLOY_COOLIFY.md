# 🚀 Guia Passo a Passo - Deploy no Coolify

## Pré-requisitos
- ✅ Repositório GitHub sincronizado (já feito)
- ✅ Coolify com Traefik configurado
- ✅ Domínio apontado para Coolify (https://veiculos.chatwoot.space)

---

## PASSO 1: Acessar Coolify

1. Acesse **https://coolify.chatwoot.space**
2. Faça login com suas credenciais
3. Vá até o projeto **vehicle-showcase-site**

---

## PASSO 2: Configurar Variáveis de Ambiente

1. No painel do projeto, clique em **Settings** ou **Environment Variables**
2. Adicione as seguintes variáveis:

```
DATABASE_URL=postgres://postgres:pKwGcya385XfMg4cDax0S1qzVxWiu05CAI5rRJxHbSHTPbqii5Tvrjcg34tRvpVn@5.78.67.95:5372/postgres?sslmode=disable

PORT=3010

NODE_ENV=production
```

3. Clique em **Save** ou **Salvar**

---

## PASSO 3: Configurar Build Command

1. Procure por **Build Command** ou **Build Settings**
2. Configure como:

```bash
pnpm install && pnpm build
```

3. Salve

---

## PASSO 4: Configurar Start Command

1. Procure por **Start Command** ou **Run Command**
2. Configure como:

```bash
pnpm start
```

3. Salve

---

## PASSO 5: Configurar Health Check (CRÍTICO)

⚠️ **ESTE É O PASSO MAIS IMPORTANTE**

1. No painel do projeto, vá em **Settings** → **Health Check** (ou similar)
2. Configure EXATAMENTE assim:

| Campo | Valor |
|-------|-------|
| **Enabled** | ✅ Ativado |
| **Path** | `/health` |
| **Port** | `3010` |
| **Interval** | `30` segundos |
| **Timeout** | `5` segundos |
| **Retries** | `3` |
| **Protocol** | `HTTP` |

3. Clique em **Save**

---

## PASSO 6: Configurar Porta (IMPORTANTE)

1. Procure por **Port** ou **Exposed Port**
2. Configure como: `3010`
3. Salve

---

## PASSO 7: Fazer Deploy

### Opção A: Redeploy (Recomendado)

1. No painel do projeto, procure por **Redeploy** ou **Deploy**
2. Clique no botão
3. Aguarde o build terminar (pode levar 2-5 minutos)

### Opção B: Conectar GitHub (Se não estiver conectado)

1. Vá em **Settings** → **GitHub**
2. Clique em **Connect Repository**
3. Selecione o repositório `vehicle-showcase-site`
4. Clique em **Deploy**

---

## PASSO 8: Monitorar o Deploy

1. Procure por **Logs** ou **Build Logs**
2. Aguarde até ver:
   ```
   Server running on http://localhost:3010/
   [Database] Connected to PostgreSQL successfully
   ```

3. Quando aparecer ✅ **Deployment successful**, o deploy terminou

---

## PASSO 9: Testar o Site

Após o deploy, teste:

### 1. Health Check
```bash
curl https://veiculos.chatwoot.space/health
```

Deve retornar:
```json
{"status":"ok"}
```

### 2. Página Inicial
Acesse: **https://veiculos.chatwoot.space**

Você deve ver:
- ✅ Logo "exchange motors"
- ✅ 2 veículos (Honda CR-V e Toyota Corolla)
- ✅ Imagens dos veículos
- ✅ Preços e informações

### 3. Painel Admin
Acesse: **https://veiculos.chatwoot.space/admin**

Você deve ver:
- ✅ Botão "Entrar com Google"
- ✅ Ou "Acesso Negado" se não estiver autenticado

---

## Troubleshooting

### ❌ Erro: "Port 3000 is already in use"

**Solução:**
1. Vá em **Settings** → **Health Check**
2. Mude a porta de `3000` para `3010`
3. Clique em **Save**
4. Faça **Redeploy**

### ❌ Erro: "Connection refused"

**Solução:**
1. Verifique se `DATABASE_URL` está correto
2. Confirme que a porta é `5372` (não 5384)
3. Confirme que `sslmode=disable` está na URL
4. Faça **Redeploy**

### ❌ Erro: "Database connection failed"

**Solução:**
1. Teste a conexão manualmente:
   ```bash
   psql "postgresql://postgres@5.78.67.95:5372/postgres?sslmode=disable"
   ```
2. Se falhar, a porta ou host está errado
3. Se passar, o banco está ok

### ❌ Página em branco

**Solução:**
1. Abra o **Console do Navegador** (F12)
2. Procure por erros
3. Verifique os **Logs do Coolify**
4. Se houver erro de conexão ao banco, veja "Database connection failed" acima

### ❌ Imagens não carregam

**Solução:**
1. As imagens estão em URLs públicas (Unsplash)
2. Verifique se o navegador tem acesso à internet
3. Verifique se não há bloqueio de CORS

---

## Verificação Final

Após o deploy, confirme:

- ✅ Site acessível em https://veiculos.chatwoot.space
- ✅ Health check respondendo em /health
- ✅ Veículos carregando com imagens
- ✅ Banco de dados conectado
- ✅ Sem erros nos logs

---

## Próximos Passos

Após o deploy estar funcionando:

1. **Painel Administrativo** - Gerenciar veículos (adicionar, editar, deletar)
2. **Upload de Imagens** - Fazer upload via painel
3. **Sistema de Agendamento** - Test drive com WhatsApp
4. **Filtros Avançados** - Busca por transmissão, combustível, etc.

---

## Suporte

Se tiver problemas:

1. Verifique os **Logs do Coolify**
2. Confirme as **Variáveis de Ambiente**
3. Confirme o **Health Check** na porta `3010`
4. Teste a **Conexão ao PostgreSQL**

Qualquer dúvida, entre em contato! 🚀
