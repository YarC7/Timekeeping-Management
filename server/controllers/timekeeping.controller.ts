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

  async logTimekeeping(req, res) {
    try {
      const { employee_id, similarity, success_image } = req.body;

      if (!employee_id) {
        return res.status(400).json({ error: "employee_id is required" });
      }

      const log = await TimekeepingModel.create({
        employee_id,
        similarity,
        success_image,
      });

      res.status(201).json(log);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },
  // Xóa log
  async remove(req, res) {
    const record = await TimekeepingModel.remove(Number(req.params.id));
    if (!record) throw { status: 404, message: "Log not found" };
    res.json({ message: "Deleted successfully" });
  },

  async logTimekeepingWithType(req, res) {
    try {
      const { employee_id, check_type, similarity, success_image } = req.body;

      // Validate input
      if (!employee_id) {
        return res.status(400).json({ error: "employee_id is required" });
      }
      if (!check_type || !["checkin", "checkout"].includes(check_type)) {
        return res
          .status(400)
          .json({ error: "check_type must be 'checkin' or 'checkout'" });
      }

      const log = await TimekeepingModel.createWithType({
        employee_id,
        check_type,
        similarity,
        success_image,
      });

      res.status(201).json(log);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  },

  // Dashboard stats
  async dashboard(req, res) {
    const stats = await TimekeepingModel.dashboardStats();
    res.json(stats);
  },
};
