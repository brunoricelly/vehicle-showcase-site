# Integração com n8n - Vehicle Showcase Site

## Visão Geral

Este documento descreve como integrar o Vehicle Showcase Site com o n8n para automatizar a criação e remoção de veículos através de webhooks, incluindo suporte para WhatsApp autorizado.

## Endpoints Disponíveis

### 1. Criar Veículo via Webhook

**URL**: `POST /api/trpc/webhooks.createVehicle`

**Autenticação**: API Key via header `Authorization: Bearer {WEBHOOK_API_KEY}`

**Payload**:
```json
{
  "apiKey": "sua-chave-api-webhook",
  "title": "Tesla Model 3",
  "brand": "Tesla",
  "model": "Model 3",
  "year": 2024,
  "category": "sedan",
  "price": "45000.00",
  "description": "Veículo elétrico de alta performance",
  "color": "Black",
  "transmission": "automatic",
  "fuelType": "electric",
  "mileage": 1000
}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "vehicleId": 1,
  "message": "Vehicle created successfully"
}
```

**Resposta de Erro** (401):
```json
{
  "code": "UNAUTHORIZED",
  "message": "Invalid API key"
}
```

### 2. Remover Veículo via Webhook

**URL**: `POST /api/trpc/webhooks.deleteVehicle`

**Autenticação**: API Key via header `Authorization: Bearer {WEBHOOK_API_KEY}`

**Payload**:
```json
{
  "apiKey": "sua-chave-api-webhook",
  "vehicleId": 1
}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "vehicleId": 1,
  "message": "Vehicle deleted successfully"
}
```

## Configuração do n8n

### Passo 1: Configurar Variáveis de Ambiente

Adicione a chave de webhook ao seu arquivo `.env`:

```env
WEBHOOK_API_KEY=seu-webhook-api-key-seguro
```

### Passo 2: Criar Webhook no n8n para Receber Mensagens do WhatsApp

1. No n8n, crie um novo workflow
2. Adicione um nó **Webhook** como trigger
3. Configure para receber requisições POST
4. Copie a URL do webhook

### Passo 3: Configurar Integração com WhatsApp

Use um serviço como **Twilio** ou **WhatsApp Business API** para:

1. Receber mensagens de WhatsApp
2. Processar o conteúdo da mensagem
3. Chamar o webhook do n8n

### Passo 4: Processar Mensagem e Criar Veículo

No n8n, após receber a mensagem do WhatsApp:

1. **Parse da Mensagem**: Extraia os dados do veículo da mensagem
2. **HTTP Request**: Faça uma requisição POST para criar o veículo

**Exemplo de nó HTTP Request**:

```
Method: POST
URL: https://seu-dominio.manus.space/api/trpc/webhooks.createVehicle
Headers:
  - Content-Type: application/json
  - Authorization: Bearer ${WEBHOOK_API_KEY}

Body (JSON):
{
  "apiKey": "${WEBHOOK_API_KEY}",
  "title": "{{ $json.vehicleName }}",
  "brand": "{{ $json.brand }}",
  "model": "{{ $json.model }}",
  "year": {{ $json.year }},
  "category": "{{ $json.category }}",
  "price": "{{ $json.price }}",
  "description": "{{ $json.description }}",
  "color": "{{ $json.color }}",
  "transmission": "{{ $json.transmission }}",
  "fuelType": "{{ $json.fuelType }}"
}
```

### Passo 5: Remover Veículo via WhatsApp

Crie um workflow similar para remover veículos:

```
Method: POST
URL: https://seu-dominio.manus.space/api/trpc/webhooks.deleteVehicle
Headers:
  - Content-Type: application/json
  - Authorization: Bearer ${WEBHOOK_API_KEY}

Body (JSON):
{
  "apiKey": "${WEBHOOK_API_KEY}",
  "vehicleId": {{ $json.vehicleId }}
}
```

## Exemplo Completo de Workflow n8n

### Criar Veículo a partir de Mensagem WhatsApp

```
1. Webhook (Recebe mensagem do WhatsApp)
   ↓
2. Parse JSON (Extrai dados da mensagem)
   ↓
3. IF (Verifica se é comando "criar")
   ├─ SIM: HTTP Request (POST /webhooks.createVehicle)
   │       ↓
   │       Response Handler (Sucesso/Erro)
   │       ↓
   │       WhatsApp Send (Confirma criação)
   │
   └─ NÃO: IF (Verifica se é comando "remover")
           ├─ SIM: HTTP Request (POST /webhooks.deleteVehicle)
           │       ↓
           │       Response Handler (Sucesso/Erro)
           │       ↓
           │       WhatsApp Send (Confirma remoção)
           │
           └─ NÃO: WhatsApp Send (Comando não reconhecido)
```

## Segurança

### Proteção da API Key

1. **Nunca exponha a chave** em logs ou mensagens de erro
2. **Use variáveis de ambiente** para armazenar a chave
3. **Rotacione a chave regularmente**
4. **Implemente rate limiting** no n8n para evitar abuso

### Validação de Requisições

Todas as requisições para os webhooks são validadas:
- API Key deve ser válida
- Campos obrigatórios devem estar presentes
- Valores numéricos devem estar no formato correto

## Monitoramento

### Logs de Webhook

Acesse o painel administrativo em `/admin` para visualizar:

1. **Histórico de Alterações**: Todas as mudanças em veículos (criação, edição, exclusão)
2. **Logs de Webhook**: Requisições recebidas, status e respostas

### Tratamento de Erros

Se uma requisição falhar:

1. Verifique a API Key
2. Valide o formato do JSON
3. Verifique os logs no painel administrativo
4. Confirme que o servidor está online

## Exemplos de Integração

### Exemplo 1: Criar Veículo com cURL

```bash
curl -X POST https://seu-dominio.manus.space/api/trpc/webhooks.createVehicle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-webhook-api-key" \
  -d '{
    "apiKey": "seu-webhook-api-key",
    "title": "BMW M3",
    "brand": "BMW",
    "model": "M3",
    "year": 2024,
    "category": "sports",
    "price": "80000.00",
    "description": "Performance car",
    "color": "Blue",
    "transmission": "automatic",
    "fuelType": "gasoline"
  }'
```

### Exemplo 2: Remover Veículo com cURL

```bash
curl -X POST https://seu-dominio.manus.space/api/trpc/webhooks.deleteVehicle \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer seu-webhook-api-key" \
  -d '{
    "apiKey": "seu-webhook-api-key",
    "vehicleId": 1
  }'
```

## Suporte

Para dúvidas ou problemas:

1. Verifique os logs no painel administrativo
2. Consulte a documentação do n8n
3. Valide o formato das requisições
4. Teste com cURL antes de integrar com n8n

## Changelog

- **v1.0.0** (2026-04-08): Versão inicial com suporte a criar/remover veículos via webhook

### 3. Adicionar Email Autorizado para Admin via Webhook

**URL**: `POST /api/trpc/adminWebhooks.addAuthorizedEmail`

**Autenticação**: API Key no payload

**Payload**:
```json
{
  "apiKey": "sua-chave-api-webhook",
  "email": "admin@example.com"
}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true,
  "id": 1
}
```

**Resposta de Erro** (401):
```json
{
  "code": "UNAUTHORIZED",
  "message": "Invalid API key"
}
```

### 4. Remover Email Autorizado para Admin via Webhook

**URL**: `POST /api/trpc/adminWebhooks.removeAuthorizedEmail`

**Autenticação**: API Key no payload

**Payload**:
```json
{
  "apiKey": "sua-chave-api-webhook",
  "email": "admin@example.com"
}
```

**Resposta de Sucesso** (200):
```json
{
  "success": true
}
```

**Resposta de Erro** (401):
```json
{
  "code": "UNAUTHORIZED",
  "message": "Invalid API key"
}
```

## Integração com WhatsApp para Gerenciar Admins

### Fluxo de Autorização de Admin via WhatsApp

```
1. Webhook WhatsApp (Recebe mensagem com email)
   ↓
2. Parse JSON (Extrai email da mensagem)
   ↓
3. IF (Verifica se é comando "autorizar admin")
   ├─ SIM: HTTP Request (POST /adminWebhooks.addAuthorizedEmail)
   │       ↓
   │       Response Handler (Sucesso/Erro)
   │       ↓
   │       WhatsApp Send (Confirma autorização)
   │
   └─ NÃO: IF (Verifica se é comando "remover admin")
           ├─ SIM: HTTP Request (POST /adminWebhooks.removeAuthorizedEmail)
           │       ↓
           │       Response Handler (Sucesso/Erro)
           │       ↓
           │       WhatsApp Send (Confirma remoção)
           │
           └─ NÃO: WhatsApp Send (Comando não reconhecido)
```

### Exemplo de Integração com n8n para Autorizar Admin

**HTTP Request Node**:

```
Method: POST
URL: https://seu-dominio.manus.space/api/trpc/adminWebhooks.addAuthorizedEmail
Headers:
  - Content-Type: application/json

Body (JSON):
{
  "apiKey": "${WEBHOOK_API_KEY}",
  "email": "{{ $json.email }}"
}
```

### Exemplo com cURL - Adicionar Email Autorizado

```bash
curl -X POST https://seu-dominio.manus.space/api/trpc/adminWebhooks.addAuthorizedEmail \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "seu-webhook-api-key",
    "email": "novo-admin@example.com"
  }'
```

### Exemplo com cURL - Remover Email Autorizado

```bash
curl -X POST https://seu-dominio.manus.space/api/trpc/adminWebhooks.removeAuthorizedEmail \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "seu-webhook-api-key",
    "email": "admin-remover@example.com"
  }'
```

## Fluxo Completo de Login Administrativo

### 1. Autorizar novo administrador via WhatsApp

```
Usuário: "autorizar admin: novo-admin@example.com"
   ↓
n8n recebe mensagem
   ↓
n8n faz POST para /adminWebhooks.addAuthorizedEmail
   ↓
Email é adicionado à tabela authorized_admins
   ↓
n8n confirma ao usuário: "Admin autorizado com sucesso!"
```

### 2. Admin faz login no painel

```
Admin acessa https://seu-dominio.manus.space/admin/login
   ↓
Clica em "Entrar com Google"
   ↓
Sistema verifica se email está na tabela authorized_admins
   ↓
Se autorizado: Redireciona para /admin (painel administrativo)
Se não autorizado: Mostra erro "Email não autorizado"
```

### 3. Remover acesso de administrador

```
Usuário: "remover admin: ex-admin@example.com"
   ↓
n8n recebe mensagem
   ↓
n8n faz POST para /adminWebhooks.removeAuthorizedEmail
   ↓
Email é removido da tabela authorized_admins
   ↓
Ex-admin não consegue mais fazer login
```

## Changelog

- **v1.0.0** (2026-04-08): Versão inicial com suporte a criar/remover veículos via webhook
- **v1.1.0** (2026-04-08): Adicionado suporte para gerenciar emails autorizados de admin via webhook
