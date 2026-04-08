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


## BUG - Upload de Imagens de Veículos Não Funciona

### Problema Identificado
- [x] Imagens enviadas no painel administrativo não apareciam no anúncio do veículo
- [x] Frontend não estava invalidando cache após upload
- [x] Imagens estão sendo salvas corretamente no banco de dados PostgreSQL
- [x] Imagens estão sendo salvas no S3 via storagePut()

### Solução Implementada
- [x] Adicionado invalidate de cache no AdminVehicleImages após upload
- [x] Adicionado invalidate de cache no AdminVehicleImages após delete
- [x] Criados 6 testes de integração para upload de imagens
- [x] Verificado que imagens aparecem em tempo real após upload
- [x] Verificado que múltiplas imagens são suportadas
- [x] Verificado que main image é corretamente identificado
- [x] 56 testes totais passando


## BUG - Imagens Não Aparecem no Detalhe do Veículo (RESOLVIDO)

### Problema Identificado
- [x] Imagens apareciam como placeholders ("Sem imagem disponível") no detalhe do veículo
- [x] Usuário relatou que imagens não estavam sendo exibidas após upload
- [x] Investigação mostrou que o backend estava retornando imagens corretamente
- [x] O problema era que o veículo 1 (antigo de teste) não tinha imagens adicionadas

### Solução Implementada
- [x] Instalado pacote `busboy` que estava faltando
- [x] Reiniciado servidor após instalação
- [x] Corrigido retorno de createVehicle() para incluir campo `id`
- [x] Corrigido retorno de addVehicleImage() para incluir campo `id`
- [x] Corrigido retorno de addVehicleHistory() para incluir campo `id`
- [x] Corrigido retorno de addWebhookLog() para incluir campo `id`
- [x] Criado teste E2E completo (vehicle-images-e2e.test.ts) com 8 testes
- [x] Verificado que imagens aparecem corretamente no frontend
- [x] Verificado que múltiplas imagens funcionam com navegação
- [x] Verificado que thumbnails aparecem corretamente
- [x] 71 testes totais passando

### Verificação Visual
- [x] Veículo 30048 com 2 imagens: imagens aparecem corretamente
- [x] Veículo 30052 com 2 imagens: imagens aparecem corretamente
- [x] Contador de imagens ("1 / 2") funciona
- [x] Botões de navegação (Anterior/Próxima) funcionam
- [x] Thumbnails aparecem na parte inferior

### Status
✅ **COMPLETO** - Sistema de imagens 100% funcional


## Validação e Otimização de Imagens no Upload

### Backend
- [x] Criar utilitário de validação de imagens (validação de dimensões, tamanho, formato)
- [x] Validar dimensões mínimas (400x300px)
- [x] Validar dimensões máximas (4000x3000px)
- [x] Validar tamanho máximo do arquivo (5MB)
- [x] Validar formatos suportados (JPEG, PNG, WebP)
- [x] Integrar validação na procedure vehicleImages.upload
- [x] Implementar calculateCompressionQuality para otimização
- [x] Implementar formatFileSize para exibição de tamanho

### Frontend
- [x] Criar utilitário de validação no cliente (imageValidation.ts)
- [x] Adicionar validação no AdminVehicleImages antes de enviar
- [x] Mostrar preview com informações de dimensões
- [x] Exibir mensagens de erro claras para validações falhadas
- [x] Mostrar informações de validação (dimensões, tamanho)
- [x] Desabilitar botão de upload durante processamento
- [x] Mostrar ícones de sucesso/erro nas validações

### Testes
- [x] Teste de validação de dimensões mínimas
- [x] Teste de validação de dimensões máximas
- [x] Teste de validação de tamanho de arquivo
- [x] Teste de validação de formato
- [x] Teste de calculateCompressionQuality
- [x] Teste de rejeição de imagens inválidas
- [x] Teste de formatFileSize
- [x] 14 testes de validação passando

### Status
- [x] **COMPLETO** - Validação e otimização de imagens 100% funcional
- 85 testes totais passando


## BUG - Error ao fazer upload de imagens

- [x] Corrigir erro "Cannot read properties of undefined (reading 'width')" no onSuccess
- [x] O problema ocorre quando data.dimensions é undefined
- [x] Adicionar validação de data antes de acessar dimensions
- [x] Testes passando (85 testes)


## BUG - Validação de imagens rejeitando uploads válidos

- [x] Verificar logs do servidor para ver qual erro está sendo retornado
- [x] Testar com imagens reais do usuário
- [x] Diagnosticar se é problema de dimensões, tamanho ou formato
- [x] Corrigir lógica de validação se necessário
- [x] Testar upload com múltiplas imagens
- [x] Adicionar fallback para dimensions quando não conseguir ler
- [x] Criar 10 testes de upload real
- [x] 95 testes totais passando


## Aumento de Dimensoes de Imagens para Padrao Moderno

- [x] Aumentar dimensao minima de 400x300 para 1024x768 (resolucao HD)
- [x] Aumentar dimensao maxima de 4000x3000 para 8000x6000 (4K e alem)
- [x] Aumentar limite de tamanho de arquivo de 5MB para 20MB
- [x] Atualizar testes com novas dimensoes
- [x] Atualizar mensagens de validacao
- [x] Testar com imagens de alta qualidade
- [x] 95 testes passando com novas configuracoes
- [x] Suporte a resolucao 4K (8000x6000)
- [x] Suporte a imagens de alta qualidade ate 20MB
