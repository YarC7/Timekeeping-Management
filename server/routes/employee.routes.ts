import { Router } from "express";
import { EmployeeController } from "../controllers/employee.controller.js";
import { validate } from "../middlewares/validate.js";
import { createEmployeeSchema, updateEmployeeSchema } from "../schemas/employee.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/", validate(createEmployeeSchema), asyncHandler(EmployeeController.create));
router.get("/", asyncHandler(EmployeeController.getAll));
router.get("/:id", asyncHandler(EmployeeController.getOne));
router.put("/:id", validate(updateEmployeeSchema), asyncHandler(EmployeeController.update));
router.delete("/:id", asyncHandler(EmployeeController.remove));

export default router;
