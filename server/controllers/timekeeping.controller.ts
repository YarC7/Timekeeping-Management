import { TimekeepingModel } from "../models/timekeeping.model";

export const TimekeepingController = {
  // Lấy danh sách log (có filter query)
  async list(req, res) {
    const records = await TimekeepingModel.findAllWithEmployees(req.query);
    res.json(records);
  },

  // Lấy log theo ID
  async get(req, res) {
    const record = await TimekeepingModel.findById(Number(req.params.id));
    if (!record) throw { status: 404, message: "Timekeeping log not found" };
    res.json(record);
  },

  // Check-in
  async checkIn(req, res) {
    const log = await TimekeepingModel.create({
      employee_id: req.params.employee_id,
      check_type: "checkin",
      similarity: req.body.similarity,
      success_image: req.body.success_image,
    });
    res.json(log);
  },

  // Check-out
  async checkOut(req, res) {
    const log = await TimekeepingModel.create({
      employee_id: req.params.employee_id,
      check_type: "checkout",
      similarity: req.body.similarity,
      success_image: req.body.success_image,
    });
    res.json(log);
  },

  // Xóa log
  async remove(req, res) {
    const record = await TimekeepingModel.remove(Number(req.params.id));
    if (!record) throw { status: 404, message: "Log not found" };
    res.json({ message: "Deleted successfully" });
  },

  // Dashboard stats
  async dashboard(req, res) {
    const stats = await TimekeepingModel.dashboardStats();
    res.json(stats);
  },
};
