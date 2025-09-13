import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "../config/s3.js";
import multer from "multer";
import crypto from "crypto";
import path from "path";
import { EmployeeImageModel } from "server/models/employeeImage.js";

const upload = multer({ storage: multer.memoryStorage() });

export const EmployeeImageController = {
  upload: [
    upload.single("file"),
    async (req, res) => {
      if (!req.file) return res.status(400).json({ error: "No file uploaded" });

      const ext = path.extname(req.file.originalname);
      const key = `employees/${req.params.id}/${crypto.randomUUID()}${ext}`;

      await s3Client.send(
        new PutObjectCommand({
          Bucket: "face-attendance",
          Key: key,
          Body: req.file.buffer,
          ContentType: req.file.mimetype,
        }),
      );
      const url = `${s3Client.config.endpoint}face-attendance/${key}`;

      const img = await EmployeeImageModel.create(req.params.id, url);
      res.json(img);
    },
  ],

  list: async (req, res) => {
    const images = await EmployeeImageModel.findByEmployee(req.params.id);
    res.json(images);
  },

  remove: async (req, res) => {
    const { image_id } = req.params;
    const deleted = await EmployeeImageModel.remove(image_id);
    if (!deleted) return res.status(404).json({ error: "Not found" });

    const key = deleted.url.split("/face-attendance/")[1];
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: "face-attendance",
        Key: key,
      }),
    );

    res.json({ message: "Deleted successfully" });
  },
};
