import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { validate } from "../middlewares/validate";
import { createUserSchema, updateUserSchema } from "../schemas/user.schema";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

router.post("/", validate(createUserSchema), asyncHandler(UserController.create));
router.get("/", asyncHandler(UserController.getAll));
router.get("/:id", asyncHandler(UserController.getOne));
router.put("/:id", validate(updateUserSchema), asyncHandler(UserController.update));
router.delete("/:id", asyncHandler(UserController.remove));

export default router;
