import { Router } from "express";
import { authenticateJWT } from "../middlewares/auth.js";
import {
  submitApplication,
  getMyApplication,
  listApplications,
  getApplication,
  updateApplicationStatus,
} from "../controllers/verificationController.js";
const router = Router();
router.post("/applications", authenticateJWT, submitApplication);
router.get("/applications/me", authenticateJWT, getMyApplication);
router.get("/applications", authenticateJWT, listApplications);
router.get("/applications/:id", authenticateJWT, getApplication);
router.patch(
  "/applications/:id/status",
  authenticateJWT,
  updateApplicationStatus,
);
export default router;
