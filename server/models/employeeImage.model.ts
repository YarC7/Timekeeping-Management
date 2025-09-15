// models/employeeImage.model.js
import { pool } from "../config/db.js";

export const EmployeeImageModel = {
  async create(employee_id, url) {
    const result = await pool.query(
      `INSERT INTO employee_images (employee_id, url) 
       VALUES ($1, $2) RETURNING *`,
      [employee_id, url]
    );
    return result.rows[0];
  },

  async findByEmployee(employee_id) {
    const result = await pool.query(
      "SELECT * FROM employee_images WHERE employee_id = $1 ORDER BY created_at DESC",
      [employee_id]
    );
    return result.rows;
  },

  async remove(image_id) {
    const result = await pool.query(
      "DELETE FROM employee_images WHERE image_id = $1 RETURNING *",
      [image_id]
    );
    return result.rows[0];
  },
};
