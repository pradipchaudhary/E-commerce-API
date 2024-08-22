import Product from "../models/Product.js";
import Order from "../models/Order.js";

export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find()
            .populate("items.product")
            .populate("user");
        res.json(orders);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const getAllProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
