import { Router } from "express";
import { AttendanceLogController } from "../controllers/attendanceLog.controller.js";
import { validate } from "../middlewares/validate.js";
import { attendanceLogSchema } from "../schemas/attendanceLog.schema.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(AttendanceLogController.list));
router.get("/:id", asyncHandler(AttendanceLogController.get));
router.get(
  "/employee/:employee_id",
  asyncHandler(AttendanceLogController.getByEmployee)
);
router.post("/", validate(attendanceLogSchema), asyncHandler(AttendanceLogController.create));
router.delete("/:id", asyncHandler(AttendanceLogController.remove));

export default router;
