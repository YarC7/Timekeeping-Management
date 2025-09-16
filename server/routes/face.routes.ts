import { Router } from "express";
import { FaceController } from "../controllers/face.controller.js";
import { validate } from "../middlewares/validate.js";
import { registerFaceSchema } from "../schemas/face.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/", validate(registerFaceSchema), asyncHandler(FaceController.register));
router.get("/:id", asyncHandler(FaceController.getByEmployee));

export default router;
