import { pool } from "../config/db.js";

export const FaceModel = {
  async register({ employee_id, embedding, source }) {
    const result = await pool.query(
      `INSERT INTO face_embeddings (employee_id, embedding, source) 
       VALUES ($1, $2::jsonb, $3) RETURNING *`,
      [employee_id, JSON.stringify(embedding), source || "registration"]
    );
    return result.rows[0];
  },

  async findByEmployee(employee_id) {
    const result = await pool.query(
      "SELECT * FROM face_embeddings WHERE employee_id = $1",
      [employee_id]
    );
    return result.rows;
  },
};
