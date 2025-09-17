import { pool } from "../config/db";

export const UserModel = {
  async create({ name, email }) {
    const result = await pool.query(
      "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *",
      [name, email]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query("SELECT * FROM users");
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0];
  },

  async update(id, { name, email }) {
    const result = await pool.query(
      `UPDATE users 
       SET name = COALESCE($1, name), email = COALESCE($2, email) 
       WHERE id = $3 RETURNING *`,
      [name || null, email || null, id]
    );
    return result.rows[0];
  },

  async remove(id) {
    const result = await pool.query(
      "DELETE FROM users WHERE id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },
};
