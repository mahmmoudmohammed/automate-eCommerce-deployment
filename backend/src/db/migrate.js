async function runMigrations(db) {
  try {
    await db.query(`CREATE TABLE IF NOT EXISTS fib_values (number INT)`);
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        name       VARCHAR(255) NOT NULL,
        email      VARCHAR(255) UNIQUE NOT NULL,
        password   VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      )`);
    await db.query(`
      CREATE TABLE IF NOT EXISTS personal_access_tokens (
        id         SERIAL PRIMARY KEY,
        user_id    INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token      VARCHAR(255) UNIQUE NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )`);
    console.log("Database migrations successfully executed.");
  } catch (error) {
    console.error("Migrations failed:", error);
    process.exit(1);
  }
}

module.exports = runMigrations;
