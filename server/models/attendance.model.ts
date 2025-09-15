import { pool } from "../config/db.js";

export const AttendanceModel = {
  async findAll() {
    const res = await pool.query("SELECT * FROM attendances ORDER BY date DESC");
    return res.rows;
  },

  async findById(id: string) {
    const res = await pool.query(
      "SELECT * FROM attendances WHERE attendance_id = $1",
      [id]
    );
    return res.rows[0];
  },

  async findByDate(employee_id: string, date: string) {
    const res = await pool.query(
      "SELECT * FROM attendances WHERE employee_id = $1 AND date = $2 LIMIT 1",
      [employee_id, date]
    );
    return res.rows[0];
  },

  async create(data) {
    const { employee_id, date, check_in, check_out, total_hours, status } = data;
    const res = await pool.query(
      `INSERT INTO attendances (employee_id, date, check_in, check_out, total_hours, status) 
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [employee_id, date, check_in, check_out, total_hours, status]
    );
    return res.rows[0];
  },

  async update(id: string, data) {
    const { employee_id, date, check_in, check_out, total_hours, status } = data;
    const res = await pool.query(
      `UPDATE attendances 
       SET employee_id=$1, date=$2, check_in=$3, check_out=$4, total_hours=$5, status=$6, updated_at=NOW()
       WHERE attendance_id=$7 RETURNING *`,
      [employee_id, date, check_in, check_out, total_hours, status, id]
    );
    return res.rows[0];
  },

  async remove(id: string) {
    const res = await pool.query(
      "DELETE FROM attendances WHERE attendance_id=$1 RETURNING *",
      [id]
    );
    return res.rows[0];
  },

  // 📌 NEW: danh sách join employees (hôm nay hoặc theo filter)
  async findAllWithEmployees({ date, dateFrom, dateTo, status, search }: { date?: string; dateFrom?: string; dateTo?: string; status?: string; search?: string }) {
    let query = `
      SELECT e.employee_id, e.full_name, e.email, e.position, e.role,
             a.attendance_id, a.date, a.check_in, a.check_out, a.total_hours::float AS total_hours, a.status
      FROM employees e
      INNER JOIN attendances a 
        ON e.employee_id = a.employee_id
    `;
    const params: any[] = [];
    const where: string[] = [];

    if (dateFrom && dateTo) {
      params.push(dateFrom);
      params.push(dateTo);
      where.push(`a.date BETWEEN $${params.length - 1} AND $${params.length}`);
    } else if (dateFrom) {
      params.push(dateFrom);
      where.push(`a.date >= $${params.length}`);
    } else if (dateTo) {
      params.push(dateTo);
      where.push(`a.date <= $${params.length}`);
    } else if (date) {
      params.push(date);
      where.push(`a.date = $${params.length}`);
    }
    if (status && status !== "all") {
      params.push(status);
      where.push(`a.status = $${params.length}`);
    }
    if (search) {
      params.push(`%${search}%`);
      where.push(`e.full_name ILIKE $${params.length}`);
    }

    if (where.length > 0) {
      query += " WHERE " + where.join(" AND ");
    }

    query += " ORDER BY e.full_name ASC";

    const res = await pool.query(query, params);
    return res.rows;
  },

  // 📌 NEW: stats dashboard
  async dashboardStats() {
    const today = new Date().toISOString().slice(0, 10);

    const checkedInToday = await pool.query(
      `SELECT COUNT(DISTINCT employee_id) AS count 
       FROM attendances WHERE date = $1 AND check_in IS NOT NULL`,
      [today]
    );

    const totalEmployees = await pool.query(`SELECT COUNT(*) AS count FROM employees`);
    const notCheckedInToday =
      Number(totalEmployees.rows[0].count) - Number(checkedInToday.rows[0].count);

    // Tính tổng giờ trong tuần
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Chủ nhật
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Thứ bảy

    const totalHoursThisWeek = await pool.query(
      `SELECT COALESCE(SUM(total_hours), 0) AS total
       FROM attendances 
       WHERE date BETWEEN $1 AND $2`,
      [
        startOfWeek.toISOString().slice(0, 10),
        endOfWeek.toISOString().slice(0, 10),
      ]
    );

    return {
      checkedInToday: Number(checkedInToday.rows[0].count),
      notCheckedInToday,
      totalHoursThisWeek: Number(totalHoursThisWeek.rows[0].total),
    };
  },
};
