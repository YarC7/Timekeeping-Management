import { EmployeeModel } from "../models/employee.model";

export const EmployeeController = {
  async create(req, res) {
    const employee = await EmployeeModel.create(req.validated);
    res.json(employee);
  },

  async getAll(req, res) {
    const employees = await EmployeeModel.findAll();
    res.json(employees);
  },

  async getOne(req, res) {
    const employee = await EmployeeModel.findById(req.params.id);
    if (!employee) throw { status: 404, message: "Employee not found" };
    res.json(employee);
  },

  async update(req, res) {
    const employee = await EmployeeModel.update(req.params.id, req.validated);
    if (!employee) throw { status: 404, message: "Employee not found" };
    res.json(employee);
  },

  async toggle(req, res, next) {
    try {
      const employee = await EmployeeModel.toggle(req.params.id);

      if (!employee) {
        return res.status(404).json({ message: "Employee not found" });
      }

      res.json(employee);
    } catch (err) {
      next(err); // chuyển qua error handler middleware
    }
  },

  async remove(req, res) {
    const employee = await EmployeeModel.remove(req.params.id);
    if (!employee) throw { status: 404, message: "Employee not found" };
    res.json({ message: "Deleted successfully" });
  },
};
