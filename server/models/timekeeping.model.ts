import { pool } from "../config/db";

export const TimekeepingModel = {
  async findAll() {
    const res = await pool.query(
      "SELECT * FROM timekeeping ORDER BY timestamp DESC",
    );
    return res.rows;
  },

  async findById(id: number) {
    const res = await pool.query(
      "SELECT * FROM timekeeping WHERE log_id = $1",
      [id],
    );
    return res.rows[0];
  },

  async findOne(where: { employee_id: string; work_date?: string }) {
    const { employee_id, work_date } = where;
    let query = `SELECT * FROM timekeeping WHERE employee_id = $1`;
    const params: any[] = [employee_id];

    if (work_date) {
      params.push(work_date);
      query += ` AND work_date = $2`;
    }

    query += ` ORDER BY timestamp DESC LIMIT 1`;

    const res = await pool.query(query, params);
    return res.rows[0];
  },

  async findByDate(employee_id: string, work_date: string) {
    const res = await pool.query(
      "SELECT * FROM timekeeping WHERE employee_id = $1 AND work_date = $2 ORDER BY timestamp ASC",
      [employee_id, work_date],
    );
    return res.rows;
  },

  // 👉 Auto decide checkin / checkout
  async create(data: {
    employee_id: string;
    similarity?: number;
    success_image?: string;
  }) {
    const { employee_id, similarity, success_image } = data;

    // Tìm log gần nhất trong ngày
    const todayLogs = await pool.query(
      `
      SELECT * FROM timekeeping
      WHERE employee_id = $1 AND work_date = CURRENT_DATE
      ORDER BY timestamp ASC
      `,
      [employee_id],
    );

    let check_type: "checkin" | "checkout" = "checkin";

    if (todayLogs.rows.length > 0) {
      const last = todayLogs.rows[todayLogs.rows.length - 1];

      if (last.check_type === "checkin") {
        // Nếu đã có checkin -> cho checkout
        check_type = "checkout";
      } else if (last.check_type === "checkout") {
        // Nếu đã có checkout -> không cho thêm nữa
        throw new Error("Employee has already checked out today");
      }
    }

    const res = await pool.query(
      `INSERT INTO timekeeping (employee_id, work_date, check_type, timestamp, similarity, success_image)
       VALUES ($1, CURRENT_DATE, $2, NOW(), $3, $4) RETURNING *`,
      [employee_id, check_type, similarity, success_image],
    );

    return res.rows[0];
  },

  async createWithType(data: {
    employee_id: string;
    check_type: "checkin" | "checkout";
    similarity?: number;
    success_image?: string;
  }) {
    const { employee_id, check_type, similarity, success_image } = data;

    // Lấy log hôm nay của employee
    const todayLogs = await pool.query(
      `
    SELECT * FROM timekeeping
    WHERE employee_id = $1 AND work_date = CURRENT_DATE
    ORDER BY timestamp ASC
    `,
      [employee_id],
    );

    if (check_type === "checkin") {
      // Nếu đã có checkin thì không cho thêm nữa
      const hasCheckin = todayLogs.rows.some(
        (row) => row.check_type === "checkin",
      );
      if (hasCheckin) {
        throw new Error("Employee already checked in today");
      }
    }

    if (check_type === "checkout") {
      // Chỉ cho checkout nếu có checkin trước đó
      const hasCheckin = todayLogs.rows.some(
        (row) => row.check_type === "checkin",
      );
      if (!hasCheckin) {
        throw new Error("Employee cannot checkout without checkin first");
      }

      // Nếu đã checkout rồi thì cấm thêm lần nữa
      const hasCheckout = todayLogs.rows.some(
        (row) => row.check_type === "checkout",
      );
      if (hasCheckout) {
        throw new Error("Employee has already checked out today");
      }
    }

    // Insert log
    const res = await pool.query(
      `
    INSERT INTO timekeeping 
      (employee_id, work_date, check_type, timestamp, similarity, success_image)
    VALUES ($1, CURRENT_DATE, $2, NOW(), $3, $4)
    RETURNING *
    `,
      [employee_id, check_type, similarity, success_image],
    );

    return res.rows[0];
  },

  async remove(id: number) {
    const res = await pool.query(
      "DELETE FROM timekeeping WHERE log_id = $1 RETURNING *",
      [id],
    );
    return res.rows[0];
  },

  // 📊 Join employees + optional filters
  async findAllWithEmployees({
    dateFrom,
    dateTo,
    employee_id,
    search,
  }: {
    dateFrom?: string;
    dateTo?: string;
    employee_id?: string;
    search?: string;
  }) {
    let query = `
      SELECT e.employee_id, e.full_name, e.email, e.position, e.role,
             t.log_id, t.work_date, t.check_type, t.timestamp, t.similarity, t.success_image
      FROM employees e
      INNER JOIN timekeeping t ON e.employee_id = t.employee_id
    `;
    const params: any[] = [];
    const where: string[] = [];

    if (dateFrom && dateTo) {
      params.push(dateFrom, dateTo);
      where.push(
        `t.work_date BETWEEN $${params.length - 1} AND $${params.length}`,
      );
    } else if (dateFrom) {
      params.push(dateFrom);
      where.push(`t.work_date >= $${params.length}`);
    } else if (dateTo) {
      params.push(dateTo);
      where.push(`t.work_date <= $${params.length}`);
    }

    if (employee_id) {
      params.push(employee_id);
      where.push(`t.employee_id = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      where.push(`e.full_name ILIKE $${params.length}`);
    }

    if (where.length > 0) {
      query += " WHERE " + where.join(" AND ");
    }

    query += " ORDER BY t.timestamp DESC";

    const res = await pool.query(query, params);
    return res.rows;
  },

  // 📊 Dashboard stats (tính từ log)
  async dashboardStats() {
    const today = new Date().toISOString().slice(0, 10);

    const checkinsToday = await pool.query(
      `SELECT COUNT(DISTINCT employee_id) AS count
       FROM timekeeping
       WHERE work_date = $1 AND check_type = 'checkin'`,
      [today],
    );

    const checkoutsToday = await pool.query(
      `SELECT COUNT(DISTINCT employee_id) AS count
       FROM timekeeping
       WHERE work_date = $1 AND check_type = 'checkout'`,
      [today],
    );

    const totalEmployees = await pool.query(
      `SELECT COUNT(*) AS count FROM employees`,
    );

    const notCheckedInToday =
      Number(totalEmployees.rows[0].count) -
      Number(checkinsToday.rows[0].count);

    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    const totalHoursThisWeek = await pool.query(
      `
      SELECT COALESCE(SUM(hours), 0) AS total FROM (
        SELECT 
          EXTRACT(EPOCH FROM (MAX(CASE WHEN check_type='checkout' THEN timestamp END) -
                                 MIN(CASE WHEN check_type='checkin' THEN timestamp END))) / 3600 AS hours
        FROM timekeeping
        WHERE work_date BETWEEN $1 AND $2
        GROUP BY employee_id, work_date
      ) t
      `,
      [
        startOfWeek.toISOString().slice(0, 10),
        endOfWeek.toISOString().slice(0, 10),
      ],
    );

    return {
      checkedInToday: Number(checkinsToday.rows[0]?.count || 0),
      checkedOutToday: Number(checkoutsToday.rows[0]?.count || 0),
      notCheckedInToday,
      totalHoursThisWeek: Number(totalHoursThisWeek.rows[0]?.total || 0),
    };
  },
};
