import { pool } from "../config/db";

export const UserModel = {
  async create({ email, password_hash, role }) {
    const result = await pool.query(
      "INSERT INTO users (email, password_hash, role) VALUES ($1, $2, $3) RETURNING *",
      [email, password_hash, role || "admin"],
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query("SELECT * FROM users");
    return result.rows;
  },

  async findById(user_id) {
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      user_id,
    ]);
    return result.rows[0];
  },

  async findByEmail(email) {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    return result.rows[0];
  },

  async update(user_id, { email, password_hash, role }) {
    const result = await pool.query(
      `UPDATE users 
       SET email = COALESCE($1, email), password_hash = COALESCE($2, password_hash), role = COALESCE($3, role)
       WHERE user_id = $4 RETURNING *`,
      [email || null, password_hash || null, role || null, user_id],
    );
    return result.rows[0];
  },

  async remove(user_id) {
    const result = await pool.query(
      "DELETE FROM users WHERE user_id = $1 RETURNING *",
      [user_id],
    );
    return result.rows[0];
  },
};
