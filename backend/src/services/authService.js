const bcrypt = require("bcryptjs");
const crypto = require("crypto");

class AuthService {
  constructor(userRepo, tokenRepo) {
    this.userRepo = userRepo;
    this.tokenRepo = tokenRepo;
  }

  async register({ name, email, password }) {
    const exists = await this.userRepo.checkExistsByEmail(email);
    if (exists) {
      throw new Error("EMAIL_TAKEN");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await this.userRepo.create({
      name,
      email,
      password: hashedPassword,
    });
    return user;
  }

  async login(email, password) {
    const user = await this.userRepo.findByEmail(email);
    if (!user) throw new Error("INVALID_CREDENTIALS");

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("INVALID_CREDENTIALS");

    // Generate token: "<id>|<random_hex>"
    const rawToken = crypto.randomBytes(20).toString("hex");
    const plainTextToken = `${user.id}|${rawToken}`;
    const hashedToken = crypto
      .createHash("sha256")
      .update(plainTextToken)
      .digest("hex");

    // Optional: Delete old tokens if we want single-device login
    // await this.tokenRepo.deleteAllForUser(user.id);

    await this.tokenRepo.create(user.id, hashedToken, 7); // 7 days expiry
    await this.userRepo.updateTimestamp(user.id);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        created_at: user.created_at,
        updated_at: user.updated_at,
      },
      token: plainTextToken,
    };
  }

  async logout(hashedToken) {
    await this.tokenRepo.delete(hashedToken);
  }
}

module.exports = AuthService;
