import { Router } from "express";
import { register, login } from "../controllers/authController";
import { registerFood, getAvailableFood, getStats } from "../controllers/foodController";
import { claimDelivery, confirmDelivery, getSchoolDeliveries, getActiveDeliveries, topupPoints, verifyHardwareCode } from "../controllers/deliveryController";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// Stats
router.get("/stats", getStats);

// Auth
router.post("/auth/register", register);
router.post("/auth/login", login);

// Food
router.post("/food", authenticate, authorize(["STORE"]), registerFood);
router.get("/food/available", authenticate, getAvailableFood);

// Delivery
router.post("/delivery/claim", authenticate, authorize(["USER"]), claimDelivery);
router.post("/delivery/confirm", authenticate, authorize(["SCHOOL"]), confirmDelivery);
router.get("/delivery/school", authenticate, authorize(["SCHOOL"]), getSchoolDeliveries);
router.get("/delivery/active", authenticate, authorize(["USER"]), getActiveDeliveries);

// Points & Hardware
router.post("/points/topup", authenticate, topupPoints);
router.post("/hardware/verify", verifyHardwareCode);

export default router;
