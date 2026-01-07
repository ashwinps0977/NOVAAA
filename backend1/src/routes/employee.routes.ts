import { Router } from "express";
import { createEmployee, getEmployees } from "../controllers/EmployeeController";
import { authenticate } from "../middleware/auth.middleware";
import { authorize } from "../middleware/role.middleware";

const router = Router();

router.post("/", authenticate, authorize("HR", "ADMIN"), createEmployee);
router.get("/", authenticate, authorize("HR", "ADMIN"), getEmployees);

export default router;
