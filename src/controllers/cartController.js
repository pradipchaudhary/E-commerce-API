import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.userId }).populate(
            "items.product"
        );
        res.json(cart);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const addToCart = async (req, res) => {
    const { productId, quantity } = req.body;

    try {
        const product = await Product.findById(productId);

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        let cart = await Cart.findOne({ user: req.user.userId });

        if (!cart) {
            cart = new Cart({ user: req.user.userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(
            (item) => item.product.toString() === productId
        );

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: product, Id, quantity });
        }

        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const removeFromCart = async (req, res) => {
    const { productId } = req.body;

    try {
        const cart = await Cart.findOne({ user: req.user.userId });

        if (!cart) {
            return res.status(404).json({ msg: "Cart not found" });
        }

        cart.items = cart.items.filter(
            (item) => item.product.toString() !== productId
        );

        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
