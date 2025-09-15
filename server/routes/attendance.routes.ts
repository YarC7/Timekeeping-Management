import { Router } from "express";
import { AttendanceController } from "../controllers/attendance.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/dashboard", asyncHandler(AttendanceController.dashboard));

router.get("/", asyncHandler(AttendanceController.list));

router.get("/:id", asyncHandler(AttendanceController.get));
router.post("/", asyncHandler(AttendanceController.create));
router.put("/:id", asyncHandler(AttendanceController.update));
router.delete("/:id", asyncHandler(AttendanceController.remove));

router.post(
  "/checkin/:employee_id",
  asyncHandler(AttendanceController.checkIn),
);
router.post(
  "/checkout/:employee_id",
  asyncHandler(AttendanceController.checkOut),
);

export default router;
