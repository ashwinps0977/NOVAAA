import { Router } from "express";
import { applyLeave, approveLeave } from "../controllers/LeaveController";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post("/", authenticate, applyLeave);
router.put("/:id/approve", authenticate, authorize("HR"), approveLeave);

export default router;
