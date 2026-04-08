# 🚀 Guia de Deploy - Vehicle Showcase Site

Este guia explica como fazer deploy do seu site em uma VPS ou servidor próprio usando PostgreSQL.

## 📋 Pré-requisitos

- Node.js 18+ instalado
- PostgreSQL 12+ instalado e rodando
- Git instalado
- npm ou pnpm instalado

## 🔧 Configuração do PostgreSQL

### 1. Criar banco de dados

```bash
# Conectar ao PostgreSQL como admin
psql -U postgres

# Criar novo banco de dados
CREATE DATABASE vehicle_showcase;

# Criar novo usuário (recomendado não usar postgres)
CREATE USER vehicle_user WITH PASSWORD 'sua_senha_segura_aqui';

# Dar permissões ao usuário
ALTER ROLE vehicle_user SET client_encoding TO 'utf8';
ALTER ROLE vehicle_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE vehicle_user SET default_transaction_deferrable TO on;
ALTER ROLE vehicle_user SET default_transaction_read_only TO off;
GRANT ALL PRIVILEGES ON DATABASE vehicle_showcase TO vehicle_user;

# Conectar ao novo banco e dar permissões no schema
\c vehicle_showcase
GRANT ALL ON SCHEMA public TO vehicle_user;

# Sair
\q
```

### 2. Verificar conexão

```bash
psql -U vehicle_user -d vehicle_showcase -h localhost
# Digite a senha quando solicitado
```

## 📦 Deploy em VPS

### 1. Clonar repositório

```bash
cd /var/www
git clone https://github.com/seu-usuario/vehicle-showcase-site.git
cd vehicle-showcase-site
```

### 2. Instalar dependências

```bash
pnpm install
# ou
npm install
```

### 3. Configurar variáveis de ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar arquivo .env com suas configurações
nano .env
```

**Variáveis importantes para PostgreSQL:**

```env
# Conexão PostgreSQL
DATABASE_URL=postgresql://vehicle_user:sua_senha@localhost:5432/vehicle_showcase

# OAuth (obter do Manus)
VITE_APP_ID=seu_app_id
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://portal.manus.im

# JWT Secret (gerar com: openssl rand -base64 32)
JWT_SECRET=seu_jwt_secret_gerado_aqui

# Outros (configurar conforme necessário)
OWNER_NAME=Seu Nome
OWNER_OPEN_ID=seu_open_id
```

### 4. Executar migrations

```bash
# Gerar SQL (já feito, mas pode regenerar se necessário)
pnpm drizzle-kit generate

# Aplicar migrations ao banco de dados
pnpm drizzle-kit migrate
```

### 5. Build da aplicação

```bash
# Build do frontend
pnpm build

# Ou build completo (se houver script)
pnpm build:all
```

### 6. Iniciar servidor

```bash
# Desenvolvimento
pnpm dev

# Produção
NODE_ENV=production pnpm start
```

## 🐳 Deploy com Docker (Opcional)

### 1. Criar Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Instalar pnpm
RUN npm install -g pnpm

# Copiar arquivos
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

# Build
RUN pnpm build

# Expor porta
EXPOSE 3000

# Iniciar servidor
CMD ["pnpm", "start"]
```

### 2. Criar docker-compose.yml

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: vehicle_showcase
      POSTGRES_USER: vehicle_user
      POSTGRES_PASSWORD: sua_senha_segura
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    environment:
      DATABASE_URL: postgresql://vehicle_user:sua_senha_segura@postgres:5432/vehicle_showcase
      NODE_ENV: production
      VITE_APP_ID: ${VITE_APP_ID}
      # ... outras variáveis
    ports:
      - "3000:3000"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### 3. Executar com Docker

```bash
docker-compose up -d
```

## 🔒 Configurar HTTPS com Nginx

### 1. Instalar Nginx

```bash
sudo apt-get install nginx
```

### 2. Configurar proxy reverso

```nginx
server {
    listen 80;
    server_name seu-dominio.com;

    # Redirecionar HTTP para HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name seu-dominio.com;

    # Certificados SSL (usar Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/seu-dominio.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com/privkey.pem;

    # Proxy para aplicação
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. Ativar HTTPS com Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot certonly --nginx -d seu-dominio.com
```

## 📊 Monitoramento

### 1. Usar PM2 para gerenciar processo

```bash
# Instalar PM2
npm install -g pm2

# Iniciar aplicação
pm2 start "pnpm start" --name "vehicle-showcase"

# Salvar configuração
pm2 save

# Iniciar no boot
pm2 startup
```

### 2. Verificar logs

```bash
pm2 logs vehicle-showcase
```

## 🔄 Atualizar aplicação

```bash
# Parar aplicação
pm2 stop vehicle-showcase

# Atualizar código
git pull origin main

# Instalar dependências
pnpm install

# Build
pnpm build

# Iniciar novamente
pm2 start vehicle-showcase
```

## 📝 Troubleshooting

### Erro: "DATABASE_URL is required"

```bash
# Verificar se .env existe e tem DATABASE_URL
cat .env | grep DATABASE_URL

# Se não existir, criar:
echo "DATABASE_URL=postgresql://vehicle_user:senha@localhost:5432/vehicle_showcase" >> .env
```

### Erro: "Connection refused"

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Se não estiver, iniciar:
sudo systemctl start postgresql
```

### Erro: "Port 3000 already in use"

```bash
# Encontrar processo usando porta 3000
lsof -i :3000

# Matar processo
kill -9 <PID>
```

## 🎉 Sucesso!

Sua aplicação deve estar rodando em `https://seu-dominio.com`

Para suporte, abra uma issue no repositório GitHub.
