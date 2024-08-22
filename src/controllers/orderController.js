import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.userId }).populate(
            "items.product"
        );

        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ msg: "Cart is empty" });
        }

        const total = cart.items.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
        );

        const newOrder = new Order({
            user: req.user.userId,
            items: cart.items,
            total,
        });

        await newOrder.save();

        // Clear cart
        cart.items = [];
        await cart.save();

        res.status(201).json(newOrder);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const getOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.userId }).populate(
            "items.product"
        );
        res.json(orders);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
