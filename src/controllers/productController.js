import Product from "../models/Product.js";

export const getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const createProduct = async (req, res) => {
    const { name, price, category, description, stock } = req.body;

    try {
        const newProduct = new Product({
            name,
            price,
            category,
            description,
            stock,
        });
        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const updateProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        res.json(product);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);

        if (!product) {
            return res.status(404).json({ msg: "Product not found" });
        }

        res.json({ msg: "Product deleted" });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
