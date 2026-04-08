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
- [ ] Upload de múltiplas imagens com preview
- [x] Página de histórico de alterações com filtros
- [x] Confirmação de exclusão de veículos

## Integração & Webhooks
- [ ] Configurar endpoint webhook para criação de veículos via n8n
- [ ] Configurar endpoint webhook para remoção de veículos via n8n
- [ ] Validação de autorização (token/API key)
- [ ] Logging de requisições webhook
- [ ] Documentação de integração com n8n

## Testes & Qualidade
- [ ] Testes unitários para procedures tRPC
- [ ] Testes de validação de webhooks
- [ ] Testes de autenticação e autorização

## Deploy & Documentação
- [x] Documentação de configuração do projeto
- [x] Documentação de integração com n8n
- [x] Documentação de variáveis de ambiente
- [ ] Checkpoint final e deploy
