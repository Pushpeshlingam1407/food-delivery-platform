import { Router } from "express";
import {
  getAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
} from "../controllers/addressController.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticateJWT, getAddresses);
router.post("/", authenticateJWT, createAddress);
router.put("/:id", authenticateJWT, updateAddress);
router.delete("/:id", authenticateJWT, deleteAddress);

export default router;
