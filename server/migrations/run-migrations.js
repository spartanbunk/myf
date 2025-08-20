const { Pool } = require('pg');
const fs = require('fs').promises;
const path = require('path');

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'postgres',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'markyourfish',
  user: process.env.DB_USER || 'myf_user',
  password: process.env.DB_PASSWORD || 'myf_password'
});

async function runMigrations() {
  console.log('Starting database migrations...');
  
  try {
    // Create migrations tracking table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) NOT NULL UNIQUE,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ Migrations table ready');

    // Get list of migration files
    const migrationsDir = path.join(__dirname);
    const files = await fs.readdir(migrationsDir);
    const sqlFiles = files.filter(f => f.endsWith('.sql')).sort();
    
    console.log(`Found ${sqlFiles.length} migration files`);

    // Check which migrations have already been run
    const executedResult = await pool.query('SELECT filename FROM migrations');
    const executed = new Set(executedResult.rows.map(r => r.filename));

    // Run pending migrations
    for (const file of sqlFiles) {
      if (executed.has(file)) {
        console.log(`⊘ Skipping ${file} (already executed)`);
        continue;
      }

      console.log(`→ Running ${file}...`);
      const sql = await fs.readFile(path.join(migrationsDir, file), 'utf8');
      
      try {
        await pool.query('BEGIN');
        await pool.query(sql);
        await pool.query('INSERT INTO migrations (filename) VALUES ($1)', [file]);
        await pool.query('COMMIT');
        console.log(`✓ ${file} completed successfully`);
      } catch (error) {
        await pool.query('ROLLBACK');
        console.error(`✗ ${file} failed:`, error.message);
        throw error;
      }
    }

    // Show final table count
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log('\n📊 Database tables:');
    tablesResult.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Show sample data count
    const catchesCount = await pool.query('SELECT COUNT(*) FROM catches');
    const speciesCount = await pool.query('SELECT COUNT(*) FROM species');
    const luresCount = await pool.query('SELECT COUNT(*) FROM lures');
    
    console.log('\n📈 Data summary:');
    console.log(`   - Catches: ${catchesCount.rows[0].count}`);
    console.log(`   - Species: ${speciesCount.rows[0].count}`);
    console.log(`   - Lures: ${luresCount.rows[0].count}`);

    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// Run migrations
runMigrations();