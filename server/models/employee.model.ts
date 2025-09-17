import { pool } from "../config/db";

export const EmployeeModel = {
  async create({ employee_id, full_name, email, phone, position, role }) {
    const result = await pool.query(
      `INSERT INTO employees (employee_id, full_name, email, phone, position, role) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [employee_id, full_name, email, phone, position, role || "employee"],
    );
    return result.rows[0];
  },

  async findAll() {
    const result = await pool.query(
      "SELECT * FROM employees ORDER BY employee_id ASC",
    );
    return result.rows;
  },

  async findById(id) {
    const result = await pool.query(
      "SELECT * FROM employees WHERE employee_id = $1",
      [id],
    );
    return result.rows[0];
  },

  async update(id, { employee_id, full_name, email, phone, position, role }) {
    const result = await pool.query(
      `UPDATE employees 
       SET employee_id = COALESCE($1, employee_id),
           full_name = COALESCE($2, full_name), 
           email = COALESCE($3, email), 
           phone = COALESCE($4, phone), 
           position = COALESCE($5, position), 
           role = COALESCE($6, role),
           updated_at = NOW()
       WHERE employee_id = $7 
       RETURNING *`,
      [
        employee_id || null,
        full_name || null,
        email || null,
        phone || null,
        position || null,
        role || null,
        id,
      ],
    );
    return result.rows[0];
  },

async toggle(id) {
  const result = await pool.query(
    `UPDATE employees
     SET is_active = NOT is_active
     WHERE employee_id = $1
     RETURNING *`,
    [id] // đừng quên truyền giá trị vào
  );
  return result.rows[0];
},

  async remove(id) {
    const result = await pool.query(
      "DELETE FROM employees WHERE employee_id = $1 RETURNING *",
      [id],
    );
    return result.rows[0];
  },
};
