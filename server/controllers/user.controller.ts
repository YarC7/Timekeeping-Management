import { UserModel } from "../models/user.model.js";

export const UserController = {
  async create(req, res) {
    const user = await UserModel.create(req.validated);
    res.json(user);
  },

  async getAll(req, res) {
    const users = await UserModel.findAll();
    res.json(users);
  },

  async getOne(req, res) {
    const user = await UserModel.findById(req.params.id);
    if (!user) throw { status: 404, message: "User not found" };
    res.json(user);
  },

  async update(req, res) {
    const user = await UserModel.update(req.params.id, req.validated);
    if (!user) throw { status: 404, message: "User not found" };
    res.json(user);
  },

  async remove(req, res) {
    const user = await UserModel.remove(req.params.id);
    if (!user) throw { status: 404, message: "User not found" };
    res.json({ message: "Deleted successfully" });
  },
};
