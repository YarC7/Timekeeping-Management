import { AttendanceLogModel } from "../models/attendanceLog.model.js";

export const AttendanceLogController = {
  async list(req, res) {
    const limit = Number(req.query.limit) || 50;
    const logs = await AttendanceLogModel.findAll(limit);
    res.json(logs);
  },

  async get(req, res) {
    const log = await AttendanceLogModel.findById(Number(req.params.id));
    if (!log) throw { status: 404, message: "Log not found" };
    res.json(log);
  },

  async getByEmployee(req, res) {
    const { employee_id } = req.params;
    const { from, to } = req.query;
    const logs = await AttendanceLogModel.findByEmployee(
      employee_id,
      from as string,
      to as string
    );
    res.json(logs);
  },

  async create(req, res) {
    const log = await AttendanceLogModel.create(req.body);
    res.json(log);
  },

  async remove(req, res) {
    const log = await AttendanceLogModel.remove(Number(req.params.id));
    if (!log) throw { status: 404, message: "Log not found" };
    res.json({ message: "Deleted successfully" });
  },
};
