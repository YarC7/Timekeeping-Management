import type { Request, Response } from "express";
import { FaceModel } from "../models/face.model";

export const FaceController = {
  async register(req: Request, res: Response) {
    try {
      const employee_id = req.params.id;
      const body = req.body as { embedding: number[] };

      if (!body.embedding || !Array.isArray(body.embedding)) {
        return res.status(400).json({ error: "Embedding is required" });
      }

      const face = await FaceModel.register({
        employee_id,
        embedding: body.embedding,
        image_url: null, // không cần ảnh nếu PC chỉ gửi embedding
      });

      res.status(201).json(face);
    } catch (err: any) {
      console.error("Register face error:", err);
      res.status(500).json({ error: err.message });
    }
  },

  async getAllImages(req: Request, res: Response) {
    const embeddings = await FaceModel.getAll();
    res.json(embeddings);
  },

  async getByEmployee(req: Request, res: Response) {
    const embeddings = await FaceModel.findByEmployee(req.params.id);
    res.json(embeddings);
  },

  async update(req: Request, res: Response) {
    const vector_id = req.params.vector_id;
    const { image_url } = req.body as {
      image_url?: string | null;
    };
    const face = await FaceModel.update(vector_id, { image_url });
    if (!face) throw { status: 404, message: "Face not found" } as any;
    res.json(face);
  },

  async remove(req: Request, res: Response) {
    const vector_id = req.params.vector_id;
    const face = await FaceModel.remove(vector_id);
    if (!face) throw { status: 404, message: "Face not found" } as any;
    res.json({ message: "Deleted successfully" });
  },
};
