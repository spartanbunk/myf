const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'markyourfish',
  user: process.env.DB_USER || 'myf_user',
  password: process.env.DB_PASSWORD || 'myf_password'
});

// Create migrations table if it doesn't exist
async function createMigrationsTable() {
  const query = `
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE NOT NULL,
      applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  
  try {
    await pool.query(query);
    console.log('✅ Migrations table ready');
  } catch (error) {
    console.error('❌ Error creating migrations table:', error);
    throw error;
  }
}

// Get list of applied migrations
async function getAppliedMigrations() {
  try {
    const result = await pool.query('SELECT filename FROM migrations ORDER BY id');
    return result.rows.map(row => row.filename);
  } catch (error) {
    console.error('❌ Error getting applied migrations:', error);
    throw error;
  }
}

// Get list of migration files
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
    console.log('📁 Created migrations directory');
    return [];
  }
  
  return fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
}

// Run a single migration
async function runMigration(filename) {
  const filePath = path.join(__dirname, 'migrations', filename);
  const sql = fs.readFileSync(filePath, 'utf8');
  
  console.log(`🔄 Running migration: ${filename}`);
  
  try {
    // Run the migration SQL
    await pool.query(sql);
    
    // Record that migration was applied
    await pool.query(
      'INSERT INTO migrations (filename) VALUES ($1)',
      [filename]
    );
    
    console.log(`✅ Migration completed: ${filename}`);
  } catch (error) {
    console.error(`❌ Migration failed: ${filename}`);
    console.error('Error:', error.message);
    throw error;
  }
}

// Run all pending migrations
async function runMigrations() {
  try {
    console.log('🚀 Starting database migrations...');
    
    // Ensure migrations table exists
    await createMigrationsTable();
    
    // Get current state
    const appliedMigrations = await getAppliedMigrations();
    const migrationFiles = getMigrationFiles();
    
    console.log(`📋 Found ${migrationFiles.length} migration files`);
    console.log(`📋 ${appliedMigrations.length} migrations already applied`);
    
    // Find pending migrations
    const pendingMigrations = migrationFiles.filter(
      file => !appliedMigrations.includes(file)
    );
    
    if (pendingMigrations.length === 0) {
      console.log('✨ All migrations are up to date');
      return;
    }
    
    console.log(`🔄 Running ${pendingMigrations.length} pending migrations...`);
    
    // Run each pending migration
    for (const migration of pendingMigrations) {
      await runMigration(migration);
    }
    
    console.log('🎉 All migrations completed successfully!');
    
  } catch (error) {
    console.error('💥 Migration process failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Show migration status
async function showStatus() {
  try {
    await createMigrationsTable();
    
    const appliedMigrations = await getAppliedMigrations();
    const migrationFiles = getMigrationFiles();
    
    console.log('\n📊 Migration Status:');
    console.log('===================');
    
    if (migrationFiles.length === 0) {
      console.log('No migration files found.');
      return;
    }
    
    migrationFiles.forEach(file => {
      const status = appliedMigrations.includes(file) ? '✅ Applied' : '⏳ Pending';
      console.log(`${status} - ${file}`);
    });
    
    const pendingCount = migrationFiles.length - appliedMigrations.length;
    console.log(`\n📈 Total: ${migrationFiles.length} migrations, ${pendingCount} pending\n`);
    
  } catch (error) {
    console.error('❌ Error showing status:', error);
  } finally {
    await pool.end();
  }
}

// Main CLI interface
async function main() {
  const command = process.argv[2];
  
  switch (command) {
    case 'up':
      await runMigrations();
      break;
    case 'status':
      await showStatus();
      break;
    default:
      console.log('Usage:');
      console.log('  node migrate.js up      - Run pending migrations');
      console.log('  node migrate.js status  - Show migration status');
      process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = {
  runMigrations,
  showStatus,
  createMigrationsTable,
  getAppliedMigrations,
  getMigrationFiles,
  runMigration
};