import { Router } from "express";
import { EmployeeImageController } from "../controllers/employeeImage.controller.js";

const router = Router();

router.get("/:id/images", EmployeeImageController.list);
router.post("/:id/images", EmployeeImageController.upload);
router.delete("/:id/images/:image_id", EmployeeImageController.remove);

export default router;
