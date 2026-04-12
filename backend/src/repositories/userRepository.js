class UserRepository {
  constructor(db) {
    this.db = db;
  }

  async findByEmail(email) {
    const { rows } = await this.db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );
    return rows[0] ?? null;
  }

  async create({ name, email, password }) {
    const { rows } = await this.db.query(
      `INSERT INTO users (name, email, password)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at, updated_at`,
      [name, email, password]
    );
    return rows[0];
  }

  async checkExistsByEmail(email) {
    const { rows } = await this.db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );
    return rows.length > 0;
  }

  async updateTimestamp(id) {
    await this.db.query("UPDATE users SET updated_at = NOW() WHERE id = $1", [
      id,
    ]);
  }
}

module.exports = UserRepository;
