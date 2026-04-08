# Vehicle Showcase Site - TODO

## Banco de Dados & Schema
- [x] Criar tabelas: vehicles, vehicle_images, vehicle_history, users
- [x] Implementar migrations com Drizzle Kit
- [x] Configurar relacionamentos entre tabelas

## Backend API
- [x] Implementar CRUD de veículos (create, read, update, delete)
- [x] Implementar upload de imagens para S3
- [x] Implementar endpoints de histórico de alterações
- [x] Implementar autenticação e autorização (admin only)
- [x] Implementar webhooks para n8n (criar/remover veículos via POST)
- [x] Implementar validação de requests nos webhooks
- [x] Testes unitários para routers e procedures

## Frontend - Vitrine Pública
- [x] Design cyberpunk neon com Tailwind CSS 4
- [x] Homepage com apresentação de veículos
- [x] Galeria de veículos com filtros (categoria, marca, preço)
- [x] Página de detalhes individual de veículo
- [x] Responsividade mobile-first

## Frontend - Painel Administrativo
- [x] Layout dashboard com sidebar navigation
- [x] Autenticação e proteção de rotas (admin only)
- [x] Página de listagem de veículos com CRUD
- [x] Formulário de adição/edição de veículos
- [x] Upload de múltiplas imagens com preview
- [x] Página de histórico de alterações com filtros
- [x] Confirmação de exclusão de veículos

## Integração & Webhooks
- [x] Configurar endpoint webhook para criação de veículos via n8n
- [x] Configurar endpoint webhook para remoção de veículos via n8n
- [x] Validação de autorização (token/API key)
- [x] Logging de requisições webhook
- [x] Documentação de integração com n8n

## Testes & Qualidade
- [x] Testes unitários para procedures tRPC
- [x] Testes de validação de webhooks
- [x] Testes de autenticação e autorização

## Deploy & Documentação
- [x] Documentação de configuração do projeto
- [x] Documentação de integração com n8n
- [x] Documentação de variáveis de ambiente
- [x] Checkpoint final e deploy

## Redesign - Inspirado em Exchange Motors
- [x] Atualizar paleta de cores (preto, branco, verde neon)
- [x] Redesenhar homepage com layout similar ao Exchange Motors
- [x] Atualizar cards de veículos com informações corretas
- [x] Traduzir todo conteúdo para português BR
- [x] Adicionar informações de contato e localização
- [x] Atualizar painel administrativo com novo design
- [x] Adicionar bordas verdes tracejadas (estilo Exchange)
- [x] Implementar botão WhatsApp flutuante
- [x] Adicionar seção de "Sobre" com descrição da empresa
- [x] Testes finais e responsividade

## Redesign v2 - Layout Premium Exchange Motors (Grid 3 Colunas)
- [x] Atualizar paleta de cores para navy/dark blue e cinza escuro
- [x] Redesenhar homepage com grid 3 colunas
- [x] Cards grandes com imagens em destaque
- [x] Header limpo com logo, menu, telefone, busca
- [x] Remover efeitos neon excessivos
- [x] Design minimalista e premium
- [x] Informações de carro: Marca, Modelo, Ano/Ano, KM, Preço
- [x] Testes de responsividade

## Melhorias Luxury & Premium v3
- [x] Atualizar tipografia com fontes Sans Serif sofisticadas
- [x] Espaçamento generoso e hierarquia visual refinada
- [x] Paleta luxury com contrastes cinza/branco elegantes
- [x] Micro-interações com Framer Motion
- [x] Efeitos parallax no scroll
- [x] Transições suaves entre seções
- [x] Estrutura otimizada para imagens lifestyle de alta resolução
- [x] Hover effects elegantes nos cards
- [x] Animações de entrada ao carregar página

## Sugestões de Acompanhamento - Implementação
- [x] Integrar imagens reais do banco de dados/S3 nos cards
- [x] Adicionar loading states e fallbacks para imagens
- [x] Desenvolver página de detalhes do veículo
- [x] Galeria interativa com lightbox
- [x] Especificações técnicas na página de detalhes
- [x] Histórico de preço
- [x] Animações parallax ao scroll
- [x] Testes finais e checkpoint

## Sistema de Comparação de Veículos
- [x] Criar contexto global para armazenar veículos selecionados
- [x] Adicionar botão de comparação nos cards
- [x] Adicionar botão de comparação na página de detalhes
- [x] Desenvolver página de comparação com layout lado a lado
- [x] Galeria de imagens para cada veículo na comparação
- [x] Funcionalidade de remover veículos da comparação
- [x] Botão para limpar toda a comparação
- [x] Navegador flutuante mostrando quantidade de veículos selecionados
- [x] Responsividade mobile para comparação
- [x] Testes e checkpoint final


## Sistema Administrativo Completo (Nova Implementação)

### Banco de Dados
- [x] Criar tabela `store_settings` para configurações globais da loja
- [x] Criar tabela `store_contacts` para dados de contato e redes sociais
- [x] Adicionar campos para dados dinâmicos no schema

### Backend (tRPC Procedures)
- [x] Implementar procedures para CRUD de store_settings
- [x] Implementar procedures para CRUD de store_contacts
- [x] Adicionar validação de admin em todas as operações
- [ ] Implementar procedures de upload e otimização de imagens

### Frontend - Navbar & Autenticação
- [x] Adicionar menu dropdown "Administrador" na Navbar
- [x] Implementar lógica de exibição condicional (admin only)
- [x] Adicionar botão de Logout
- [x] Estilizar menu dropdown com design consistente

### Painel Administrativo
- [x] Criar página /admin/dashboard
- [x] Implementar módulo de Configurações (store_settings)
- [x] Implementar módulo de Estoque (CRUD de veículos)
- [x] Adicionar filtros e busca no módulo de estoque
- [x] Implementar formulários com validação

### Dados Dinâmicos
- [ ] Remover valores hardcoded da Navbar (telefone, endereço)
- [ ] Remover valores hardcoded do Footer
- [ ] Remover valores hardcoded da Homepage
- [ ] Integrar dados da API em todos os componentes

### Upload de Imagens
- [ ] Implementar redimensionamento de imagens (Sharp ou similar)
- [ ] Otimizar tamanho de arquivo antes do upload
- [ ] Adicionar preview de imagem no formulário
- [ ] Implementar validação de tipo de arquivo

### Segurança & Performance
- [ ] Validar token admin em todas as rotas protegidas
- [ ] Implementar rate limiting para uploads
- [ ] Otimizar queries do banco de dados
- [ ] Adicionar cache para dados de configuração

### Testes
- [ ] Testes de autenticação e autorização
- [ ] Testes de CRUD de configurações
- [ ] Testes de CRUD de veículos
- [ ] Testes de upload de imagens
- [ ] Checkpoint final


## Sistema de Login Administrativo com Google OAuth

### Banco de Dados
- [x] Criar tabela `authorized_admins` com emails autorizados
- [x] Adicionar campos: email, createdAt, updatedAt, authorizedBy

### Backend (tRPC Procedures)
- [x] Implementar procedure para listar emails autorizados
- [x] Implementar procedure para adicionar email autorizado (admin only)
- [x] Implementar procedure para remover email autorizado (admin only)
- [x] Implementar webhook para n8n adicionar/remover emails via WhatsApp

### Frontend - Página de Login
- [x] Criar página /admin/login com formulário
- [x] Implementar botão "Login com Google"
- [x] Validar email contra lista de autorizados
- [x] Redirecionar para painel se autorizado
- [x] Mostrar mensagem de erro se email não autorizado

### Integração n8n
- [x] Documentar endpoint webhook para adicionar emails
- [x] Documentar endpoint webhook para remover emails
- [ ] Testar integração com n8n + WhatsApp

### Testes
- [x] Testes de validação de emails autorizados
- [x] Testes de webhook do n8n
- [x] Testes de fluxo de login (validação no AdminPanel e integração)

### Enforcement de Autorização
- [x] Adicionar validação de authorized_admins no AdminPanel
- [x] Bloquear acesso se email não está autorizado

## Melhorias Solicitadas - Login Admin

### Frontend
- [x] Adicionar botão de login na página Home
- [x] Adicionar email mercadinhonop@gmail.com como autorizado para testes
- [x] Testar fluxo de login completo

## BUG - Configurações da Loja Não Sincronizam

### Solução Implementada
- [x] Criar hook useStoreSettings para carregar configurações dinamiçamente
- [x] Adicionar invalidate no AdminPanel para recarregar cache após salvar
- [x] Atualizar Home.tsx para usar configurações dinâmicas
- [x] Atualizar VehicleDetailNew.tsx para usar configurações dinâmicas
- [x] Atualizar ComparisonPage.tsx para usar configurações dinâmicas
- [x] Testar sincronização em tempo real
- [x] Criar testes de integração para sincronização (5 testes passando)
