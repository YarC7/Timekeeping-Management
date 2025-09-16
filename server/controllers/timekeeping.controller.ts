import { TimekeepingModel } from "../models/timekeeping.model.js";

export const TimekeepingController = {
  async list(req, res) {
    const records = await TimekeepingModel.findAllWithEmployees(req.query);
    res.json(records);
  },

  async get(req, res) {
    const record = await TimekeepingModel.findById(req.params.id);
    if (!record) throw { status: 404, message: "Timekeeping record not found" };
    res.json(record);
  },

  async create(req, res) {
    const record = await TimekeepingModel.create(req.body);
    res.json(record);
  },

  async update(req, res) {
    const record = await TimekeepingModel.update(req.params.id, req.body);
    if (!record) throw { status: 404, message: "Timekeeping record not found" };
    res.json(record);
  },

  async remove(req, res) {
    const record = await TimekeepingModel.remove(req.params.id);
    if (!record) throw { status: 404, message: "Timekeeping record not found" };
    res.json({ message: "Deleted successfully" });
  },

  // 📊 Dashboard
  async dashboard(req, res) {
    const stats = await TimekeepingModel.dashboardStats();
    res.json(stats);
  },

  // Check-in
  async checkIn(req, res) {
    const { employee_id } = req.params;
    const today = new Date().toISOString().slice(0, 10);

    let record = await TimekeepingModel.findByDate(employee_id, today);
    if (record?.check_in) {
      throw { status: 400, message: "Already checked in" };
    }

    record = await TimekeepingModel.create({
      employee_id,
      work_date: today,
      check_in: new Date(),
      check_out: null,
      total_hours: null,
      status: "Present",
    });

    res.json(record);
  },

  // Check-out
  async checkOut(req, res) {
    const { employee_id } = req.params;
    const today = new Date().toISOString().slice(0, 10);

    let record = await TimekeepingModel.findByDate(employee_id, today);
    if (!record || !record.check_in) {
      throw { status: 400, message: "No check-in found for today" };
    }
    if (record.check_out) {
      throw { status: 400, message: "Already checked out" };
    }

    const checkOutTime = new Date();
    const hours = (checkOutTime.getTime() - new Date(record.check_in).getTime()) / 36e5;

    record = await TimekeepingModel.update(record.timekeeping_id, {
      ...record,
      check_out: checkOutTime,
      total_hours: hours,
    });

    res.json(record);
  },
};
