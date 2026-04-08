# 🚗 Vehicle Showcase Site - PostgreSQL Edition

Site de catálogo de veículos com painel administrativo, gerenciamento de imagens e integração OAuth.

**Agora com suporte a PostgreSQL para deploy em VPS!**

## 🎯 Características

- ✅ **Catálogo de Veículos**: Exiba seus veículos com múltiplas imagens de alta qualidade (até 4K)
- ✅ **Painel Administrativo**: Gerencie veículos, imagens e configurações da loja
- ✅ **OAuth Google**: Login seguro com Google via Manus
- ✅ **Validação de Imagens**: Suporte a PNG, JPEG, WebP com dimensões até 8000x6000px
- ✅ **S3 Storage**: Imagens armazenadas em CDN para carregamento rápido
- ✅ **PostgreSQL**: Banco de dados robusto para produção
- ✅ **Responsivo**: Design mobile-first com Tailwind CSS
- ✅ **TypeScript**: Código totalmente tipado para segurança

## 🛠️ Stack Tecnológico

### Frontend
- React 19
- Tailwind CSS 4
- TypeScript
- Wouter (roteamento leve)

### Backend
- Express.js
- tRPC (RPC type-safe)
- Drizzle ORM
- PostgreSQL
- Node.js 18+

### Deployment
- Docker (opcional)
- Nginx (reverse proxy)
- PM2 (process manager)
- Let's Encrypt (HTTPS)

## 📦 Instalação Local

### 1. Pré-requisitos

```bash
# Node.js 18+
node --version

# PostgreSQL 12+
psql --version

# pnpm (recomendado)
npm install -g pnpm
```

### 2. Clonar repositório

```bash
git clone https://github.com/seu-usuario/vehicle-showcase-site.git
cd vehicle-showcase-site
```

### 3. Instalar dependências

```bash
pnpm install
```

### 4. Configurar PostgreSQL

```bash
# Criar banco de dados
createdb vehicle_showcase

# Criar usuário
createuser vehicle_user
psql -c "ALTER USER vehicle_user WITH PASSWORD 'sua_senha';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE vehicle_showcase TO vehicle_user;"
```

### 5. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais
nano .env
```

**Variáveis essenciais:**
```env
DATABASE_URL=postgresql://vehicle_user:sua_senha@localhost:5432/vehicle_showcase
VITE_APP_ID=seu_app_id_manus
JWT_SECRET=gerar_com_openssl_rand_-base64_32
```

### 6. Executar migrations

```bash
# Aplicar schema ao banco de dados
pnpm drizzle-kit migrate
```

### 7. Iniciar desenvolvimento

```bash
pnpm dev
```

Acesse http://localhost:3000

## 🚀 Deploy em VPS

### Opção 1: Deploy Manual

Ver arquivo `DEPLOY.md` para instruções completas.

**Resumo rápido:**
```bash
# 1. SSH na VPS
ssh user@seu-vps.com

# 2. Clonar repositório
git clone https://github.com/seu-usuario/vehicle-showcase-site.git
cd vehicle-showcase-site

# 3. Instalar dependências
pnpm install

# 4. Configurar .env
nano .env

# 5. Executar migrations
pnpm drizzle-kit migrate

# 6. Build
pnpm build

# 7. Iniciar com PM2
pm2 start "pnpm start" --name "vehicle-showcase"
```

### Opção 2: Deploy com Docker

```bash
# Build imagem
docker build -t vehicle-showcase .

# Executar com docker-compose
docker-compose up -d
```

### Opção 3: Railway/Render

Ambas plataformas suportam PostgreSQL nativamente:

1. Conecte seu repositório GitHub
2. Configure variáveis de ambiente
3. Deploy automático em cada push

## 📊 Estrutura do Projeto

```
vehicle-showcase-site/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (Home, Admin, etc)
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários (tRPC, validação)
│   │   └── App.tsx        # Roteamento
│   └── public/            # Arquivos estáticos
├── server/                # Backend Express
│   ├── routers.ts         # tRPC procedures
│   ├── db.ts              # Query helpers
│   ├── imageValidation.ts # Validação de imagens
│   └── _core/             # Configuração (OAuth, auth, etc)
├── drizzle/               # Migrations e schema
│   ├── schema.ts          # Definição de tabelas
│   └── migrations/        # SQL migrations
├── storage/               # S3 helpers
├── shared/                # Tipos compartilhados
├── DEPLOY.md              # Guia de deploy
├── POSTGRES_MIGRATION.md  # Detalhes da migração
└── package.json
```

## 🔐 Segurança

- ✅ OAuth via Manus (sem armazenar senhas)
- ✅ JWT para sessões
- ✅ HTTPS obrigatório em produção
- ✅ Validação de entrada em frontend e backend
- ✅ CORS configurado
- ✅ Rate limiting (recomendado adicionar)

## 📝 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `DATABASE_URL` | Conexão PostgreSQL | `postgresql://user:pass@host/db` |
| `VITE_APP_ID` | ID da aplicação Manus | `abc123def456` |
| `JWT_SECRET` | Chave secreta JWT | `gerado_com_openssl` |
| `OWNER_NAME` | Nome do proprietário | `João Silva` |
| `OWNER_OPEN_ID` | ID Manus do proprietário | `xyz789` |
| `NODE_ENV` | Ambiente | `production` ou `development` |

Ver `.env.example` para lista completa.

## 🧪 Testes

```bash
# Rodar testes
pnpm test

# Modo watch
pnpm test:watch

# Coverage
pnpm test:coverage
```

## 🐛 Troubleshooting

### Erro: "Connection refused"
```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Se não, iniciar:
sudo systemctl start postgresql
```

### Erro: "DATABASE_URL is required"
```bash
# Verificar .env
cat .env | grep DATABASE_URL

# Se não existir, adicionar:
echo "DATABASE_URL=postgresql://..." >> .env
```

### Erro: "Port 3000 already in use"
```bash
# Encontrar processo
lsof -i :3000

# Matar processo
kill -9 <PID>
```

## 📚 Documentação Adicional

- [DEPLOY.md](./DEPLOY.md) - Guia completo de deploy
- [POSTGRES_MIGRATION.md](./POSTGRES_MIGRATION.md) - Detalhes da migração MySQL → PostgreSQL
- [Drizzle ORM](https://orm.drizzle.team/)
- [tRPC](https://trpc.io/)
- [Express.js](https://expressjs.com/)

## 🤝 Contribuindo

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob licença MIT.

## 💬 Suporte

Para dúvidas ou problemas:
1. Abra uma issue no GitHub
2. Verifique a documentação em DEPLOY.md
3. Consulte POSTGRES_MIGRATION.md para questões de banco de dados

## 🎉 Começar Agora

```bash
# 1. Clonar
git clone https://github.com/seu-usuario/vehicle-showcase-site.git

# 2. Instalar
cd vehicle-showcase-site && pnpm install

# 3. Configurar
cp .env.example .env && nano .env

# 4. Migrations
pnpm drizzle-kit migrate

# 5. Desenvolver
pnpm dev
```

Visite http://localhost:3000 e comece a gerenciar seus veículos! 🚗
