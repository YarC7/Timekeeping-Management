import { Router } from "express";
import { TimekeepingController } from "../controllers/timekeeping.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/dashboard", asyncHandler(TimekeepingController.dashboard));
router.get("/", asyncHandler(TimekeepingController.list));
router.get("/:id", asyncHandler(TimekeepingController.get));
router.post("/", asyncHandler(TimekeepingController.create));
router.put("/:id", asyncHandler(TimekeepingController.update));
router.delete("/:id", asyncHandler(TimekeepingController.remove));

// Checkin / Checkout API
router.post(
  "/checkin/:employee_id",
  asyncHandler(TimekeepingController.checkIn),
);
router.post(
  "/checkout/:employee_id",
  asyncHandler(TimekeepingController.checkOut),
);

export default router;
