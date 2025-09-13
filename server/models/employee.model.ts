import { pool } from "../config/db.js";

export const EmployeeModel = {
  async create({ full_name, email, phone, position, role }) {
    const result = await pool.query(
      `INSERT INTO employees (full_name, email, phone, position, role) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [full_name, email, phone, position, role || "employee"]
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query("SELECT * FROM employees ORDER BY employee_id ASC");
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query("SELECT * FROM employees WHERE employee_id = $1", [id]);
    return result.rows[0];
  },

  async update(id, { full_name, email, phone, position, face_encoding, role }) {
    const result = await pool.query(
      `UPDATE employees 
       SET full_name = COALESCE($1, full_name), 
           email = COALESCE($2, email), 
           phone = COALESCE($3, phone), 
           position = COALESCE($4, position), 
           face_encoding = COALESCE($5, face_encoding),
           role = COALESCE($6, role),
           updated_at = NOW()
       WHERE employee_id = $7 
       RETURNING *`,
      [full_name || null, email || null, phone || null, position || null, face_encoding || null, role || null, id]
    );
    return result.rows[0];
  },

  async remove(id) {
    const result = await pool.query(
      "DELETE FROM employees WHERE employee_id = $1 RETURNING *",
      [id]
    );
    return result.rows[0];
  },
};
