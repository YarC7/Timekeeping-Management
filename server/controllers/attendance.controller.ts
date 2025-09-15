import { AttendanceModel } from "../models/attendance.model.js";

export const AttendanceController = {
  // Dashboard stats
  async dashboard(req, res) {
    const stats = await AttendanceModel.dashboardStats();
    res.json(stats);
  },

  // Danh sách attendances (join employees + filter)
  async list(req, res) {
    const { date, date_from, date_to, status, search } = req.query as any;
    const safeDate = typeof date === "string" && date?.trim() ? date : undefined;
    const safeDateFrom =
      typeof date_from === "string" && date_from?.trim() ? date_from : undefined;
    const safeDateTo =
      typeof date_to === "string" && date_to?.trim() ? date_to : undefined;
    const safeStatus =
      typeof status === "string" && status?.trim() ? status : undefined;
    const safeSearch = typeof search === "string" ? search : undefined;

    const data = await AttendanceModel.findAllWithEmployees({
      date: safeDate,
      dateFrom: safeDateFrom,
      dateTo: safeDateTo,
      status: safeStatus,
      search: safeSearch,
    });
    res.json(data);
  },

  // Get by ID
  async get(req, res) {
    const { id } = req.params;
    const attendance = await AttendanceModel.findById(id);
    if (!attendance) return res.status(404).json({ message: "Not found" });
    res.json(attendance);
  },

  // Create
  async create(req, res) {
    const attendance = await AttendanceModel.create(req.body);
    res.status(201).json(attendance);
  },

  // Update
  async update(req, res) {
    const { id } = req.params;
    const updated = await AttendanceModel.update(id, req.body);
    res.json(updated);
  },

  // Delete
  async remove(req, res) {
    const { id } = req.params;
    const deleted = await AttendanceModel.remove(id);
    if (!deleted) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted", data: deleted });
  },

  // Quick check-in
  async checkIn(req, res) {
    const { employee_id } = req.params;
    const today = new Date().toISOString().slice(0, 10);

    let attendance = await AttendanceModel.findByDate(employee_id, today);
    if (attendance) {
      return res.json({ message: "Already checked in", attendance });
    }

    attendance = await AttendanceModel.create({
      employee_id,
      date: today,
      check_in: new Date(),
      check_out: null,
      total_hours: null,
      status: "Present",
    });

    res.status(201).json(attendance);
  },

  // Quick check-out
  async checkOut(req, res) {
    const { employee_id } = req.params;
    const today = new Date().toISOString().slice(0, 10);

    const attendance = await AttendanceModel.findByDate(employee_id, today);
    if (!attendance) {
      return res.status(404).json({ message: "No check-in found" });
    }

    const checkOutTime = new Date();
    const totalHours =
      (checkOutTime.getTime() - new Date(attendance.check_in).getTime()) /
      (1000 * 60 * 60);

    const updated = await AttendanceModel.update(attendance.attendance_id, {
      ...attendance,
      check_out: checkOutTime,
      total_hours: totalHours,
      status: "Checked-out",
    });

    res.json(updated);
  },
};
