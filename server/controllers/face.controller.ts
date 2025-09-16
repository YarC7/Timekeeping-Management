import { FaceModel } from "../models/face.model.js";

export const FaceController = {
  async register(req, res) {
    const face = await FaceModel.register(req.validated);
    res.json(face);
  },

  async getByEmployee(req, res) {
    const embeddings = await FaceModel.findByEmployee(req.params.id);
    res.json(embeddings);
  },
};
