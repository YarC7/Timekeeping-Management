import { pool } from "../config/db";

export const FaceModel = {
  async getAll() {
    const res = await pool.query(
      "SELECT * FROM face_embeddings ORDER BY vector_id DESC",
    );
    return res.rows;
  },

  async register({
    employee_id,
    embedding,
    image_url,
  }: {
    employee_id: string;
    embedding?: unknown;
    image_url?: string | null;
  }) {
    const result = await pool.query(
      `INSERT INTO face_embeddings (employee_id, embedding, image_url)
       VALUES ($1, $2::jsonb, $3)
       RETURNING *`,
      [employee_id, JSON.stringify(embedding ?? []), image_url ?? null],
    );
    const face = result.rows[0];
    // Lấy tên employee
    const empRes = await pool.query(
      "SELECT full_name FROM employees WHERE employee_id = $1",
      [employee_id],
    );
    return {
      ...face,
      employee_name: empRes.rows[0]?.full_name ?? null,
    };
  },

  async findByEmployee(employee_id: string) {
    const result = await pool.query(
      `SELECT vector_id, employee_id, embedding, image_url, created_at, updated_at
       FROM face_embeddings
       WHERE employee_id = $1
       ORDER BY created_at DESC`,
      [employee_id],
    );
    return result.rows;
  },

  async update(
    vector_id: string,
    { image_url }: { image_url?: string | null },
  ) {
    const result = await pool.query(
      `UPDATE face_embeddings
       SET image_url = COALESCE($1, image_url),
           updated_at = NOW()
       WHERE vector_id = $2
       RETURNING *`,
      [image_url ?? null, vector_id],
    );
    return result.rows[0];
  },

  async remove(vector_id: string) {
    const result = await pool.query(
      `DELETE FROM face_embeddings WHERE vector_id = $1 RETURNING *`,
      [vector_id],
    );
    return result.rows[0];
  },
};
