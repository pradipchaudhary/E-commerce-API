import { Router } from "express";
import {
    getAllOrders,
    getAllProducts,
} from "../controllers/adminController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/orders", authenticate, authorize(["Admin"]), getAllOrders);
router.get(
    "/products",
    authenticate,
    authorize(["Admin", "Manager"]),
    getAllProducts
);

export default router;
