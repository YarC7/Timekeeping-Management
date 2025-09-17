import { Router } from "express";
import multer from "multer";
import path from "path";
import { EmployeeController } from "../controllers/employee.controller";
import { validate } from "../middlewares/validate";
import { createEmployeeSchema, updateEmployeeSchema } from "../schemas/employee.schema";
import { asyncHandler } from "../utils/asyncHandler";
import { FaceController } from "../controllers/face.controller";

const router = Router();

// Configure multer to store uploads under public/uploads and keep readable filenames
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, path.join(process.cwd(), "public/uploads")),
  filename: (_req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
    cb(null, `${Date.now()}-${safeName}`);
  },
});
const upload = multer({ storage });

router.post("/", validate(createEmployeeSchema), asyncHandler(EmployeeController.create));
router.get("/", asyncHandler(EmployeeController.getAll));
router.get("/:id", asyncHandler(EmployeeController.getOne));

// Faces API for an employee
router.get("/:id/images", asyncHandler(FaceController.getByEmployee));
router.post("/:id/images", upload.single("file"), asyncHandler(FaceController.register));
router.put("/:id/images/:vector_id", asyncHandler(FaceController.update));
router.delete("/:id/images/:vector_id", asyncHandler(FaceController.remove));

router.put("/:id", validate(updateEmployeeSchema), asyncHandler(EmployeeController.update));
router.patch("/:id/toggle", asyncHandler(EmployeeController.toggle));
router.delete("/:id", asyncHandler(EmployeeController.remove));

export default router;
