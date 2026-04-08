# 🔄 Migração de MySQL para PostgreSQL

Este documento explica as mudanças feitas para migrar de MySQL para PostgreSQL.

## ✅ Mudanças Realizadas

### 1. Dependências Atualizadas

```bash
# Removido
- mysql2

# Adicionado
+ pg (driver PostgreSQL)
+ @types/pg (tipos TypeScript)
```

### 2. Configuração Drizzle ORM

**Antes (MySQL):**
```typescript
dialect: "mysql",
```

**Depois (PostgreSQL):**
```typescript
dialect: "postgresql",
```

### 3. Schema Atualizado

#### Imports
```typescript
// Antes
import { mysqlTable, mysqlEnum, int } from "drizzle-orm/mysql-core";

// Depois
import { pgTable, pgEnum, integer } from "drizzle-orm/pg-core";
```

#### Tipos de Dados
| MySQL | PostgreSQL |
|-------|------------|
| `mysqlTable` | `pgTable` |
| `mysqlEnum` | `pgEnum` |
| `int` | `integer` |
| `.autoincrement()` | `.generatedAlwaysAsIdentity()` |
| `.onUpdateNow()` | removido (não existe em PG) |

#### Exemplo de Tabela

**Antes (MySQL):**
```typescript
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});
```

**Depois (PostgreSQL):**
```typescript
export const roleEnum = pgEnum("role", ["user", "admin"]);

export const users = pgTable("users", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  role: roleEnum("role").default("user").notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});
```

### 4. Migrations Geradas

Nova migration criada em `drizzle/0000_fair_guardsmen.sql`:
- Cria 3 tipos ENUM (role, action, status)
- Cria 8 tabelas PostgreSQL
- Usa `GENERATED ALWAYS AS IDENTITY` para auto-increment

## 📋 Próximos Passos

### 1. Preparar PostgreSQL

```bash
# Criar banco de dados
createdb vehicle_showcase

# Criar usuário
createuser vehicle_user
psql -c "ALTER USER vehicle_user WITH PASSWORD 'sua_senha';"
psql -c "GRANT ALL PRIVILEGES ON DATABASE vehicle_showcase TO vehicle_user;"
```

### 2. Configurar Variáveis de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais PostgreSQL
DATABASE_URL=postgresql://vehicle_user:sua_senha@localhost:5432/vehicle_showcase
```

### 3. Executar Migrations

```bash
# Aplicar schema ao banco de dados
pnpm drizzle-kit migrate

# Ou manualmente com psql
psql -U vehicle_user -d vehicle_showcase -f drizzle/0000_fair_guardsmen.sql
```

### 4. Testar Conexão

```bash
# Verificar se as tabelas foram criadas
pnpm drizzle-kit studio
```

## 🔍 Compatibilidade

### O que mudou no código?

**Nada!** O código da aplicação (routers.ts, db.ts) continua igual porque:
- Drizzle ORM abstrai as diferenças entre bancos
- As queries SQL geradas automaticamente
- Os tipos TypeScript são os mesmos

### O que precisa de atenção?

1. **Tipos de dados numéricos**: PostgreSQL usa `numeric` em vez de `decimal`
2. **Timestamps**: PostgreSQL não tem `onUpdateNow()` automático
3. **Enums**: PostgreSQL requer definição explícita de tipos ENUM

## 🚀 Deploy

Ver arquivo `DEPLOY.md` para instruções completas de deploy em VPS.

## 📚 Referências

- [Drizzle ORM PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Drizzle Kit Generate](https://orm.drizzle.team/kit-docs/overview)
