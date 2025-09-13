// controllers/employeeImage.controller.js

import { EmployeeImageModel } from "../models/employeeImage.js";

export const EmployeeImageController = {
  async upload(req, res) {
    if (!req.file) throw { status: 400, message: "No file uploaded" };

    const url = `/uploads/${req.file.filename}`; // nếu dùng local
    const employee_id = req.params.id;

    const img = await EmployeeImageModel.create(employee_id, url);
    res.json(img);
  },

  async list(req, res) {
    const employee_id = req.params.id;
    const images = await EmployeeImageModel.findByEmployee(employee_id);
    res.json(images);
  },

  async remove(req, res) {
    const image_id = req.params.image_id;
    const deleted = await EmployeeImageModel.remove(image_id);
    if (!deleted) throw { status: 404, message: "Image not found" };
    res.json({ message: "Deleted successfully" });
  },
};
