# Project TODO

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
- [x] Testar integração com n8n + WhatsApp

### Testes
- [x] Testes de validação de emails autorizados
- [x] Testes de webhook do n8n
- [x] Testes de fluxo de login (validação no AdminPanel e integração)

### Enforcement de Autorização
- [x] Adicionar validação de authorized_admins no AdminPanel
- [x] Bloquear acesso se email não está autorizado

## Melhorias no Painel Administrativo - WhatsApp e Logo

### WhatsApp
- [x] Adicionar campo para editar número do WhatsApp
- [x] Validar formato do número (apenas dígitos)
- [x] Garantir que wa.me funcione corretamente com o número
- [x] Atualizar todos os botões WhatsApp do site com o novo número

### Logo
- [x] Adicionar campo de upload de logo
- [x] Validar tamanho máximo (2MB)
- [x] Validar formato (PNG, JPG, SVG)
- [x] Exibir descrição com especificações
- [x] Integrar logo no header do site
- [x] Sincronizar logo entre admin e site
- [x] Criar endpoint /api/upload para receber arquivos

## BUG - Footer e Componentes Não Sincronizam com Admin

### Problema
- [x] Footer mostra dados hardcoded mesmo após alterações no painel admin
- [x] Endereço, telefone, horário não atualizam no site
- [x] Necessário criar componente Footer dinâmico

### Solução
- [x] Criar componente Footer.tsx que usa useStoreSettings
- [x] Remover dados hardcoded do footer
- [x] Testar sincronização em tempo real
- [x] Verificar outros componentes com dados hardcoded
- [x] Adicionar campos whatsappNumber, saturdayHours, sundayHours ao schema
- [x] Executar migration SQL

## BUG - Adicionar/Editar Veículos Não Funciona

### Problema Identificado
- [x] Função createVehicle() retornava insertId incorretamente
- [x] Drizzle retorna array com ResultSetHeader em [0], não em .insertId direto
- [x] Mesmo problema em addVehicleImage(), addVehicleHistory(), addWebhookLog()

### Solução Implementada
- [x] Corrigido createVehicle() para acessar result[0].insertId
- [x] Corrigido addVehicleImage() para acessar result[0].insertId
- [x] Corrigido addVehicleHistory() para acessar result[0].insertId
- [x] Corrigido addWebhookLog() para acessar result[0].insertId
- [x] Todos os 45 testes passando
- [x] Veículos agora são criados/editados corretamente
