import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const connectionString = process.env.DATABASE_URL || 'postgres://postgres:eHWDQ6LFz9MSrSqlDMHT2qViCQ2IvbyGi0QDrjhn9Uxk1MnaWET7G55ernVuLiQa@5.78.67.95:5384/postgres';

console.log('🔌 Testando conexão com PostgreSQL...');
console.log('URL:', connectionString.split('@')[1] || 'local');

try {
  const sql = postgres(connectionString);
  const db = drizzle(sql);
  
  // Testar conexão
  const result = await sql`SELECT version()`;
  console.log('✅ Conexão bem-sucedida!');
  console.log('📊 PostgreSQL:', result[0].version.split(',')[0]);
  
  // Listar tabelas
  const tables = await sql`
    SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;
  `;
  console.log('\n📋 Tabelas criadas:');
  tables.forEach(t => console.log('  ✓', t.tablename));
  
  // Contar registros
  console.log('\n📈 Registros por tabela:');
  for (const table of tables) {
    const count = await sql`SELECT COUNT(*) as cnt FROM ${sql(table.tablename)}`;
    console.log(`  ${table.tablename}: ${count[0].cnt} registros`);
  }
  
  await sql.end();
  process.exit(0);
} catch (error) {
  console.error('❌ Erro na conexão:', error.message);
  process.exit(1);
}
