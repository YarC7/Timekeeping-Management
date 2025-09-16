import { Router } from "express";
import { TimekeepingController } from "../controllers/timekeeping.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

// 📊 Dashboard
router.get("/dashboard", asyncHandler(TimekeepingController.dashboard));

// 🔍 Danh sách log + chi tiết
router.get("/", asyncHandler(TimekeepingController.list));
router.get("/:id", asyncHandler(TimekeepingController.get));

// ⏱️ Check-in / Check-out
router.post("/checkin/:employee_id", asyncHandler(TimekeepingController.checkIn));
router.post("/checkout/:employee_id", asyncHandler(TimekeepingController.checkOut));

// ❌ Xóa log
router.delete("/:id", asyncHandler(TimekeepingController.remove));

export default router;
