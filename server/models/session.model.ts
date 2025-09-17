import { pool } from "../config/db";

export const SessionModel = {
  async create({ id, userId, refreshToken, expiresAt }) {
    const result = await pool.query(
      `INSERT INTO sessions (session_id, user_id, refresh_token_hash, expires_at) VALUES ($1, $2, $3, $4) RETURNING *`,
      [id, userId, refreshToken, expiresAt],
    );
    return result.rows[0];
  },

  async findById(id) {
    const result = await pool.query(
      `SELECT * FROM sessions WHERE session_id = $1`,
      [id],
    );
    return result.rows[0];
  },

  async findByRefreshToken(refreshToken) {
    const result = await pool.query(
      `SELECT * FROM sessions WHERE refresh_token_hash = $1`,
      [refreshToken],
    );
    return result.rows[0];
  },

  async destroy(id) {
    await pool.query(`DELETE FROM sessions WHERE session_id = $1`, [id]);
  },
};
