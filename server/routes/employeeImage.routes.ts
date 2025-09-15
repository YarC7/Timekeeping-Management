import { Router } from "express";
import { EmployeeImageController } from "../controllers/employeeImage.controller.js";

const router = Router();

router.get("/:id", EmployeeImageController.list);
router.post("/:id", EmployeeImageController.upload);
router.delete("/:id/:image_id", EmployeeImageController.remove);

export default router;
