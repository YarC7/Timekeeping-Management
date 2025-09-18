import { Router } from "express";
import { TimekeepingController } from "../controllers/timekeeping.controller";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// 📊 Dashboard
router.get("/dashboard", asyncHandler(TimekeepingController.dashboard));

// 🔍 Danh sách log + chi tiết
router.get("/", asyncHandler(TimekeepingController.list));
router.get("/:id", asyncHandler(TimekeepingController.get));

// ⏱️ Check-in / Check-out
router.post("/logs", asyncHandler(TimekeepingController.logTimekeeping));
router.post("/logging", asyncHandler(TimekeepingController.logTimekeepingWithType));


// ❌ Xóa log
router.delete("/:id", asyncHandler(TimekeepingController.remove));

export default router;
