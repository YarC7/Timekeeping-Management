import type { Request, Response } from "express";
import { FaceModel } from "../models/face.model";

export const FaceController = {
  async register(req: Request, res: Response) {
    const employee_id = req.params.id;
    // Multer sets req.file when uploading; also allow direct image_url
    const file = (req as any).file as Express.Multer.File | undefined;
    const body = req.body as { image_url?: string;};

    const image_url = file ? `/uploads/${file.filename}` : body.image_url ?? null;

    const face = await FaceModel.register({
      employee_id,
      embedding: [], // placeholder embedding; real embedding generation would happen elsewhere
      image_url,
    });
    res.json(face);
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
