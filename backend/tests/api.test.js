const { describe, it, beforeEach, mock } = require("node:test");
const assert = require("node:assert/strict");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const AuthService = require("../src/services/authService"); // adjust path if needed

// ── Helpers ────────────────────────────────────────────────────────────────
const makeUser = (overrides = {}) => ({
  id: 1,
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$12$hashedpassword",
  created_at: new Date(),
  updated_at: new Date(),
  ...overrides,
});

const makeRepos = () => ({
  userRepo: {
    checkExistsByEmail: mock.fn(async () => false),
    create:             mock.fn(async (data) => ({ id: 1, ...data })),
    findByEmail:        mock.fn(async () => makeUser()),
    updateTimestamp:    mock.fn(async () => {}),
  },
  tokenRepo: {
    create: mock.fn(async () => {}),
    delete: mock.fn(async () => {}),
  },
});

// ══════════════════════════════════════════════════════════════════════════
describe("AuthService", () => {

  // ── register ─────────────────────────────────────────────────────────
  describe("register()", () => {
    let userRepo, tokenRepo, service;

    beforeEach(() => {
      ({ userRepo, tokenRepo } = makeRepos());
      service = new AuthService(userRepo, tokenRepo);
    });

    it("creates a user with a hashed password", async () => {
      const input = { name: "John", email: "john@example.com", password: "secret123" };

      const result = await service.register(input);

      // checkExistsByEmail called once with the right email
      assert.equal(userRepo.checkExistsByEmail.mock.calls.length, 1);
      assert.equal(userRepo.checkExistsByEmail.mock.calls[0].arguments[0], input.email);

      // userRepo.create called once
      assert.equal(userRepo.create.mock.calls.length, 1);

      const created = userRepo.create.mock.calls[0].arguments[0];

      // Plain password never stored
      assert.notEqual(created.password, input.password);

      // Stored password is a valid bcrypt hash
      const match = await bcrypt.compare(input.password, created.password);
      assert.ok(match, "Stored hash should match the original password");

      // Returns whatever userRepo.create returned
      assert.ok(result);
    });

    it("throws EMAIL_TAKEN when email already exists", async () => {
      userRepo.checkExistsByEmail = mock.fn(async () => true);

      await assert.rejects(
          () => service.register({ name: "X", email: "taken@example.com", password: "pass" }),
          { message: "EMAIL_TAKEN" }
      );

      // Should never reach userRepo.create
      assert.equal(userRepo.create.mock.calls.length, 0);
    });
  });

  // ── login ─────────────────────────────────────────────────────────────
  describe("login()", () => {
    let userRepo, tokenRepo, service;
    const RAW_PASSWORD = "secret123";

    beforeEach(async () => {
      ({ userRepo, tokenRepo } = makeRepos());

      // Give the mock user a real bcrypt hash so compare() works
      const hashed = await bcrypt.hash(RAW_PASSWORD, 12);
      userRepo.findByEmail = mock.fn(async () => makeUser({ password: hashed }));

      service = new AuthService(userRepo, tokenRepo);
    });

    it("returns user data and a plain-text token on success", async () => {
      const result = await service.login("john@example.com", RAW_PASSWORD);

      // Shape of the response
      assert.ok(result.user);
      assert.ok(result.token);
      assert.equal(typeof result.token, "string");

      // Token format: "<id>|<hex>"
      const [id, hex] = result.token.split("|");
      assert.equal(id, String(makeUser().id));
      assert.match(hex, /^[0-9a-f]{40}$/);

      // Sensitive fields not leaked
      assert.equal(result.user.password, undefined);

      // Correct user shape
      assert.deepEqual(Object.keys(result.user), [
        "id", "name", "email", "created_at", "updated_at",
      ]);
    });

    it("stores a SHA-256 hash of the token, not the plain-text token", async () => {
      const result = await service.login("john@example.com", RAW_PASSWORD);

      const storedHash = tokenRepo.create.mock.calls[0].arguments[1];
      const expectedHash = crypto
          .createHash("sha256")
          .update(result.token)
          .digest("hex");

      assert.equal(storedHash, expectedHash);
    });

    it("creates token with 7-day expiry", async () => {
      await service.login("john@example.com", RAW_PASSWORD);

      const expiry = tokenRepo.create.mock.calls[0].arguments[2];
      assert.equal(expiry, 7);
    });

    it("calls updateTimestamp after successful login", async () => {
      await service.login("john@example.com", RAW_PASSWORD);

      assert.equal(userRepo.updateTimestamp.mock.calls.length, 1);
      assert.equal(userRepo.updateTimestamp.mock.calls[0].arguments[0], makeUser().id);
    });

    it("throws INVALID_CREDENTIALS when user is not found", async () => {
      userRepo.findByEmail = mock.fn(async () => null);

      await assert.rejects(
          () => service.login("ghost@example.com", RAW_PASSWORD),
          { message: "INVALID_CREDENTIALS" }
      );

      // Token must never be created
      assert.equal(tokenRepo.create.mock.calls.length, 0);
    });

    it("throws INVALID_CREDENTIALS when password is wrong", async () => {
      await assert.rejects(
          () => service.login("john@example.com", "wrongpassword"),
          { message: "INVALID_CREDENTIALS" }
      );

      assert.equal(tokenRepo.create.mock.calls.length, 0);
    });
  });

  // ── logout ────────────────────────────────────────────────────────────
  describe("logout()", () => {
    let tokenRepo, service;

    beforeEach(() => {
      ({ tokenRepo } = makeRepos());
      service = new AuthService({}, tokenRepo);
    });

    it("deletes the token from the store", async () => {
      const hashedToken = "abc123hashedtoken";

      await service.logout(hashedToken);

      assert.equal(tokenRepo.delete.mock.calls.length, 1);
      assert.equal(tokenRepo.delete.mock.calls[0].arguments[0], hashedToken);
    });

    it("propagates errors from tokenRepo.delete", async () => {
      tokenRepo.delete = mock.fn(async () => {
        throw new Error("DB_ERROR");
      });

      await assert.rejects(
          () => service.logout("sometoken"),
          { message: "DB_ERROR" }
      );
    });
  });

});