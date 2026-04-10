# Guia de Deploy no Coolify - Porta 3010

## ⚠️ IMPORTANTE: Porta 3010 (NÃO 3000)

Este projeto usa **PORTA 3010** e não pode ser alterado. Se você tem outras aplicações na porta 3000, não há conflito.

## Configuração no Coolify

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no painel do Coolify:

```
DATABASE_URL=postgres://postgres:pKwGcya385XfMg4cDax0S1qzVxWiu05CAI5rRJxHbSHTPbqii5Tvrjcg34tRvpVn@5.78.67.95:5372/postgres?sslmode=disable
PORT=3010
NODE_ENV=production
```

### 2. Health Check (CRÍTICO)

**Configure EXATAMENTE assim:**
- **Path:** `/health`
- **Port:** `3010` (NÃO 3000)
- **Interval:** `30s`
- **Timeout:** `5s`
- **Retries:** `3`

### 3. Build & Start Commands

**Build Command:**
```bash
pnpm install && pnpm build
```

**Start Command:**
```bash
pnpm start
```

### 4. Dockerfile

O projeto inclui um `Dockerfile` otimizado. Se o Coolify usar Docker:

```bash
docker build -t vehicle-showcase .
docker run -p 3010:3010 \
  -e DATABASE_URL="postgres://..." \
  -e NODE_ENV=production \
  vehicle-showcase
```

## Banco de Dados PostgreSQL

- **Host:** 5.78.67.95
- **Port:** 5372 (NÃO 5384)
- **User:** postgres
- **Password:** pKwGcya385XfMg4cDax0S1qzVxWiu05CAI5rRJxHbSHTPbqii5Tvrjcg34tRvpVn
- **Database:** postgres
- **SSL:** Desabilitar (sslmode=disable)

## Dados de Teste

O banco já contém:
- 2 veículos de teste (Honda CR-V e Toyota Corolla)
- 1 usuário administrador (mercadinhonop@gmail.com)
- 4 imagens dos veículos
- Configurações da loja (Exchange Motors)

## Teste Após Deploy

```bash
# Health check
curl https://veiculos.chatwoot.space/health

# Deve retornar:
{"status":"ok"}

# Página inicial
curl https://veiculos.chatwoot.space/
```

## Troubleshooting

### Erro: "Port 3000 is already in use"
- **Solução:** O Coolify está tentando usar porta 3000. Configure Health Check para porta **3010**.

### Erro: "Connection refused on port 3010"
- **Solução:** Verifique se DATABASE_URL está correto e a porta 5372 está acessível.

### Erro: "Database connection failed"
- **Solução:** Confirme que `sslmode=disable` está na DATABASE_URL.

### Página em branco
- **Solução:** Verifique os logs do Coolify. Pode ser erro de build ou conexão ao banco.

## Arquivos de Configuração

- `coolify.json` - Configuração específica do Coolify
- `Dockerfile` - Build otimizado para produção
- `.dockerignore` - Arquivos ignorados no build Docker
- `COOLIFY_DEPLOYMENT.md` - Este arquivo

## Próximos Passos

1. Implementar painel administrativo para gerenciar veículos
2. Adicionar upload de imagens via painel
3. Implementar sistema de agendamento de test drive
4. Adicionar filtros avançados de busca
