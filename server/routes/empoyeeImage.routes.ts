// routes/employeeImage.routes.js
import { Router } from "express";
import multer from "multer";
import { EmployeeImageController } from "../controllers/employeeImage.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();
const upload = multer({ dest: "uploads/" }); // lưu file local

router.get("/:id/images", asyncHandler(EmployeeImageController.list));
router.post(
  "/:id/images",
  upload.single("file"),
  asyncHandler(EmployeeImageController.upload)
);
router.delete(
  "/:id/images/:image_id",
  asyncHandler(EmployeeImageController.remove)
);

export default router;
