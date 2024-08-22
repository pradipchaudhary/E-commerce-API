import { Router } from "express";
import {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct,
} from "../controllers/productController.js";
import { authenticate } from "../middlewares/authMiddleware.js";
import { authorize } from "../middlewares/roleMiddleware.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", authenticate, authorize(["Admin", "Manager"]), createProduct);
router.put(
    "/:id",
    authenticate,
    authorize(["Admin", "Manager"]),
    updateProduct
);
router.delete("/:id", authenticate, authorize(["Admin"]), deleteProduct);

export default router;
