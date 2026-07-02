import { Router } from "express";
import {
  getWalletBalance,
  addWalletFunds,
  requestPayout,
} from "../controllers/walletController.js";
import { authenticateJWT } from "../middlewares/auth.js";

const router = Router();

router.get("/", authenticateJWT, getWalletBalance);
router.post("/deposit", authenticateJWT, addWalletFunds);
router.post("/payout", authenticateJWT, requestPayout);

export default router;
