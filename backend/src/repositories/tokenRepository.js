class TokenRepository {
  constructor(db) {
    this.db = db;
  }

  async findValidToken(hashedToken, userId) {
    const { rows } = await this.db.query(
      `SELECT pat.token, pat.expires_at,
              u.id, u.name, u.email, u.created_at, u.updated_at
       FROM personal_access_tokens pat
       JOIN users u ON u.id = pat.user_id
       WHERE pat.token = $1
         AND pat.user_id = $2
         AND pat.expires_at > NOW()`,
      [hashedToken, userId]
    );
    return rows[0] ?? null;
  }

  async create(userId, hashedToken, expiresInDays = 7) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    await this.db.query(
      "INSERT INTO personal_access_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, hashedToken, expiresAt]
    );
  }

  async delete(hashedToken) {
    await this.db.query(
      "DELETE FROM personal_access_tokens WHERE token = $1",
      [hashedToken]
    );
  }

  async deleteAllForUser(userId) {
    await this.db.query(
      "DELETE FROM personal_access_tokens WHERE user_id = $1",
      [userId]
    );
  }
}

module.exports = TokenRepository;
