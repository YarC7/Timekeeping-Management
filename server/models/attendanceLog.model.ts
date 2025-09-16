import { pool } from "../config/db.js";

export const AttendanceLogModel = {
  async findAll(limit = 50) {
    const res = await pool.query(
      "SELECT * FROM attendance_logs ORDER BY timestamp DESC LIMIT $1",
      [limit]
    );
    return res.rows;
  },

  async findById(id: number) {
    const res = await pool.query(
      "SELECT * FROM attendance_logs WHERE log_id = $1",
      [id]
    );
    return res.rows[0];
  },

  async findByEmployee(employee_id: string, from?: string, to?: string) {
    let query = "SELECT * FROM attendance_logs WHERE employee_id = $1";
    const params: any[] = [employee_id];

    if (from) {
      params.push(from);
      query += ` AND timestamp >= $${params.length}`;
    }
    if (to) {
      params.push(to);
      query += ` AND timestamp <= $${params.length}`;
    }

    query += " ORDER BY timestamp DESC";

    const res = await pool.query(query, params);
    return res.rows;
  },

  async create(data) {
    const { employee_id, check_type, timestamp, similarity, device_id } = data;
    const res = await pool.query(
      `INSERT INTO attendance_logs (employee_id, check_type, timestamp, similarity, device_id)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [employee_id, check_type, timestamp || new Date(), similarity, device_id]
    );
    return res.rows[0];
  },

  async remove(id: number) {
    const res = await pool.query(
      "DELETE FROM attendance_logs WHERE log_id=$1 RETURNING *",
      [id]
    );
    return res.rows[0];
  },
};
