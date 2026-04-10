# Guia de Deploy no Coolify

## Configuração Necessária

### 1. Variáveis de Ambiente

Configure as seguintes variáveis no painel do Coolify:

```
DATABASE_URL=postgres://postgres:pKwGcya385XfMg4cDax0S1qzVxWiu05CAI5rRJxHbSHTPbqii5Tvrjcg34tRvpVn@5.78.67.95:5372/postgres?sslmode=disable
PORT=3010
NODE_ENV=production
```

### 2. Health Check

Configure o Health Check no Traefik:
- **Path:** `/health`
- **Port:** `3010`
- **Interval:** `30s`
- **Timeout:** `5s`

### 3. Build Command

```bash
pnpm install && pnpm build
```

### 4. Start Command

```bash
pnpm start
```

## Porta Fixa

O servidor está configurado para rodar **SEMPRE na porta 3010**. Não tente mudar a porta no Coolify.

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
curl https://veiculos.chatwoot.space/health
```

Deve retornar:
```json
{"status":"ok"}
```

## Troubleshooting

Se o site não carregar:

1. Verifique se o Health Check está passando
2. Verifique os logs do Coolify
3. Confirme que DATABASE_URL está correto
4. Confirme que a porta 5372 está acessível

## Próximos Passos

1. Implementar painel administrativo para gerenciar veículos
2. Adicionar upload de imagens via painel
3. Implementar sistema de agendamento de test drive
4. Adicionar filtros avançados de busca
