# Vehicle Showcase Site - Cyberpunk Neon Edition

Um site moderno e futurista para exposição de veículos com painel administrativo completo, integração com banco de dados MySQL/TiDB e webhooks para automação via n8n.

## 🎨 Características

### Frontend Público
- **Design Cyberpunk Neon**: Tema visual futurista com cores neon (rosa, ciano, roxo)
- **Homepage com Filtros**: Busca por marca, categoria e faixa de preço
- **Galeria de Veículos**: Exibição responsiva com cards neon
- **Página de Detalhes**: Informações completas de cada veículo com galeria de imagens
- **Responsividade**: Design mobile-first com suporte a todos os tamanhos de tela

### Painel Administrativo
- **Autenticação Segura**: Integrada com Manus OAuth
- **CRUD de Veículos**: Criar, editar e remover veículos
- **Formulário Completo**: Todos os campos de veículo (marca, modelo, ano, preço, etc.)
- **Histórico de Alterações**: Timeline visual de todas as mudanças
- **Logs de Webhooks**: Monitoramento de requisições automáticas

### Backend & Integração
- **API tRPC**: Procedures tipadas para segurança total
- **MySQL/TiDB**: Banco de dados robusto gerenciado pela Manus
- **S3 Storage**: Upload de imagens com CDN integrado
- **Webhooks n8n**: Automação de criação/remoção de veículos
- **Proteção de API Key**: Validação segura de requisições

## 🚀 Começando

### Pré-requisitos
- Node.js 22+
- pnpm (gerenciador de pacotes)
- Conexão com internet (para Manus OAuth)

### Instalação Local

```bash
# Instale as dependências
pnpm install

# Inicie o servidor de desenvolvimento
pnpm dev

# Em outro terminal, verifique a compilação TypeScript
pnpm check

# Execute os testes
pnpm test
```

O servidor estará disponível em `http://localhost:3000`

### Variáveis de Ambiente

A plataforma Manus injeta automaticamente a maioria das variáveis. Configure apenas:

```env
# IMPORTANTE: Configure isto para ativar webhooks
WEBHOOK_API_KEY=sua-chave-webhook-segura-aqui
```

As seguintes variáveis são gerenciadas automaticamente:

```env
# Banco de Dados (MySQL/TiDB)
DATABASE_URL=mysql://...

# Autenticação Manus OAuth
JWT_SECRET=auto-gerado
VITE_APP_ID=auto-gerado
OAUTH_SERVER_URL=https://api.manus.im
VITE_OAUTH_PORTAL_URL=https://manus.im
OWNER_OPEN_ID=seu-id-manus
OWNER_NAME=seu-nome

# S3 Storage (Manus built-in)
BUILT_IN_FORGE_API_URL=auto-gerado
BUILT_IN_FORGE_API_KEY=auto-gerado
VITE_FRONTEND_FORGE_API_URL=auto-gerado
VITE_FRONTEND_FORGE_API_KEY=auto-gerado

# Analytics (Manus built-in)
VITE_ANALYTICS_ENDPOINT=auto-gerado
VITE_ANALYTICS_WEBSITE_ID=auto-gerado
```

## 📱 Uso

### Acessar o Site

1. **Homepage**: `https://seu-dominio.manus.space/`
   - Visualize a galeria de veículos
   - Use os filtros para buscar
   - Clique em um veículo para ver detalhes

2. **Painel Administrativo**: `https://seu-dominio.manus.space/admin`
   - Faça login com sua conta Manus
   - Gerencie veículos (criar, editar, remover)
   - Visualize histórico de alterações
   - Monitore logs de webhooks

### Criar um Veículo

1. Acesse `/admin`
2. Clique em "ADD VEHICLE"
3. Preencha o formulário com os dados do veículo
4. Clique em "CREATE VEHICLE"

### Editar um Veículo

1. Acesse `/admin`
2. Clique em "EDIT" no veículo desejado
3. Modifique os dados
4. Clique em "UPDATE VEHICLE"

### Remover um Veículo

1. Acesse `/admin`
2. Clique no ícone de lixeira ao lado do veículo
3. Confirme a exclusão

## 🔗 Integração com n8n

Para automatizar a criação e remoção de veículos via WhatsApp ou outras plataformas:

1. Consulte o arquivo [N8N_INTEGRATION.md](./N8N_INTEGRATION.md)
2. Configure os webhooks no n8n
3. Use a API Key configurada em `WEBHOOK_API_KEY`

### Endpoints Webhook

- **Criar Veículo**: `POST /api/trpc/webhooks.createVehicle`
- **Remover Veículo**: `POST /api/trpc/webhooks.deleteVehicle`

Veja a documentação completa em [N8N_INTEGRATION.md](./N8N_INTEGRATION.md).

## 🎨 Design & Estilo

### Paleta de Cores
- **Fundo**: Preto profundo (`oklch(0.05 0 0)`)
- **Texto Principal**: Neon Rosa (`oklch(0.95 0.05 320)`)
- **Destaque**: Neon Ciano (`oklch(0.6 0.3 180)`)
- **Acento**: Neon Roxo (`oklch(0.6 0.3 270)`)

### Efeitos Visuais
- **Glow**: Brilho neon em títulos e botões
- **HUD Corners**: Colchetes de canto emoldurando seções
- **Scan Lines**: Linhas de varredura animadas
- **Pulse Glow**: Animação de pulso em cards

### Tipografia
- **Títulos**: Orbitron (geométrica, marcante)
- **Corpo**: Space Mono (monoespacial, futurista)

## 🧪 Testes

```bash
# Executar testes unitários
pnpm test

# Verificar tipos TypeScript
pnpm check

# Formatar código
pnpm format
```

## 📦 Build & Deploy

```bash
# Build para produção
pnpm build

# Iniciar servidor de produção
pnpm start
```

**Deploy**: Use o botão "Publish" no painel de gerenciamento da Manus. Crie um checkpoint antes de publicar.

## 📊 Estrutura do Projeto

```
vehicle-showcase-site/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── pages/         # Páginas (Home, Admin, etc.)
│   │   ├── components/    # Componentes reutilizáveis
│   │   ├── lib/           # Utilitários (tRPC client)
│   │   └── index.css      # Estilos globais (cyberpunk)
│   └── public/            # Assets estáticos
├── server/                # Backend Express + tRPC
│   ├── routers.ts        # Procedures tRPC
│   ├── db.ts             # Query helpers
│   └── webhooks.ts       # Lógica de webhooks
├── drizzle/              # Migrations & Schema
│   └── schema.ts         # Definição de tabelas
├── N8N_INTEGRATION.md    # Documentação n8n
└── README.md             # Este arquivo
```

## 🔐 Segurança

- **Autenticação**: Manus OAuth integrado (automático)
- **Autorização**: Role-based access control (admin/user)
- **API Key**: Validação de webhooks com chave segura
- **Dados Sensíveis**: Armazenados em variáveis de ambiente
- **HTTPS**: Automático em produção via Manus
- **Banco de Dados**: Gerenciado e protegido pela Manus

## 🐛 Troubleshooting

### Erro de Conexão com Banco de Dados
- Verifique se o servidor está rodando (`pnpm dev`)
- Verifique os logs no terminal
- Confirme que DATABASE_URL está configurado

### Webhooks não funcionando
- Verifique se `WEBHOOK_API_KEY` está configurado
- Confirme que o servidor está online
- Verifique os logs em `/admin` > Webhooks
- Teste com cURL antes de integrar com n8n

### Páginas não carregam
- Limpe o cache do navegador
- Verifique se o servidor está rodando
- Verifique os logs do navegador (F12)
- Confirme que está acessando a URL correta

## 📝 Changelog

### v1.0.0 (2026-04-08)
- ✅ Frontend público com design cyberpunk
- ✅ Painel administrativo completo
- ✅ Integração com MySQL/TiDB
- ✅ Webhooks para n8n
- ✅ Histórico de alterações
- ✅ Autenticação com Manus OAuth

## 📄 Licença

MIT License - veja LICENSE.md para detalhes

## 🤝 Suporte

Para dúvidas ou problemas:
1. Consulte a documentação
2. Verifique os logs do servidor
3. Acesse o painel administrativo para diagnosticar

## 🎯 Roadmap

- [ ] Upload de múltiplas imagens com preview
- [ ] Integração com WhatsApp Business API
- [ ] Dashboard com estatísticas
- [ ] Exportação de dados (CSV/PDF)
- [ ] Multi-idioma (PT/EN/ES)
- [ ] Temas customizáveis

---

**Desenvolvido com ❤️ usando React, Express, tRPC e Tailwind CSS**
