Here's a complete example of a Node.js REST API for an e-commerce platform using MongoDB, including multi-user role management. We'll cover user roles such as "Manager," "Admin," and "Customer" with access control. The implementation includes user authentication, product management, cart management, and order processing.

### 1. **Setup the Project**

First, initialize your project and install the required dependencies:

```bash
mkdir ecommerce-api
cd ecommerce-api
npm init -y
npm install express mongoose bcryptjs jsonwebtoken dotenv
```

### 2. **Project Structure**

Create the following project structure:

```
ecommerce-api/
│
├── config/
│   ├── db.js
│   └── keys.js
│
├── controllers/
│   ├── authController.js
│   ├── productController.js
│   ├── cartController.js
│   ├── orderController.js
│   └── adminController.js
│
├── middlewares/
│   ├── authMiddleware.js
│   └── roleMiddleware.js
│
├── models/
│   ├── User.js
│   ├── Product.js
│   ├── Cart.js
│   ├── Order.js
│   └── Admin.js
│
├── routes/
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   ├── orderRoutes.js
│   └── adminRoutes.js
│
├── .env
├── app.js
└── README.md
```

### 3. **Environment Variables (.env)**

Create a `.env` file with the following content:

```env
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret
```

### 4. **Database Configuration (config/db.js)**

```javascript
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("MongoDB connected");
    } catch (err) {
        console.error(err.message);
        process.exit(1);
    }
};

export default connectDB;
```

### 5. **Models**

#### **User Model (models/User.js)**

```javascript
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
        type: String,
        enum: ["Customer", "Manager", "Admin"],
        default: "Customer",
    },
});

const User = mongoose.model("User", UserSchema);

export default User;
```

#### **Product Model (models/Product.js)**

```javascript
import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: String, required: true },
    description: { type: String },
    stock: { type: Number, required: true },
});

const Product = mongoose.model("Product", ProductSchema);

export default Product;
```

#### **Cart Model (models/Cart.js)**

```javascript
import mongoose from "mongoose";

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: { type: Number, required: true },
        },
    ],
});

const Cart = mongoose.model("Cart", CartSchema);

export default Cart;
```

#### **Order Model (models/Order.js)**

```javascript
import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
        {
            product: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Product",
                required: true,
            },
            quantity: { type: Number, required: true },
        },
    ],
    total: { type: Number, required: true },
    status: {
        type: String,
        enum: ["Pending", "Completed", "Shipped"],
        default: "Pending",
    },
});

const Order = mongoose.model("Order", OrderSchema);

export default Order;
```

### 6. **Controllers**

#### **Auth Controller (controllers/authController.js)**

```javascript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ msg: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
        });
        await newUser.save();

        const payload = { userId: newUser._id, role: newUser.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};

export const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: "Invalid credentials" });
        }

        const payload = { userId: user._id, role: user.role };
        const token = jwt.sign(payload, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });

        res.json({ token });
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
```

#### **Product Controller (controllers/productController.js)**

```javascript
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
```

#### **Cart Controller (controllers/cartController.js)**

```javascript
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.userId }).populate('items.product');
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
            return res.status(404).json({ msg: 'Product not found' });
        }

        let cart = await Cart.findOne({ user: req.user.userId });

        if (!cart) {
            cart = new Cart({ user: req.user.userId, items: [] });
        }

        const itemIndex = cart.items.findIndex(item => item.product.toString() === productId);

        if (itemIndex > -1) {
            cart.items[itemIndex].quantity += quantity;
        } else {
            cart.items.push({ product: product

Id, quantity });
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
            return res.status(404).json({ msg: 'Cart not found' });
        }

        cart.items = cart.items.filter(item => item.product.toString() !== productId);

        await cart.save();
        res.json(cart);
    } catch (err) {
        res.status(500).json({ msg: err.message });
    }
};
```

#### **Order Controller (controllers/orderController.js)**

```javascript
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
```

#### **Admin Controller (controllers/adminController.js)**

```javascript
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
```

### 7. **Middleware**

#### **Auth Middleware (middlewares/authMiddleware.js)**

```javascript
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const authenticate = async (req, res, next) => {
    const token = req.headers["authorization"]?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ msg: "No token, authorization denied" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ msg: "Token is not valid" });
    }
};
```

#### **Role Middleware (middlewares/roleMiddleware.js)**

```javascript
export const authorize = (roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: "Access denied" });
        }
        next();
    };
};
```

### 8. **Routes**

#### **Auth Routes (routes/authRoutes.js)**

```javascript
import { Router } from "express";
import { register, login } from "../controllers/authController.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

export default router;
```

#### **Product Routes (routes/productRoutes.js)**

```javascript
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
```

#### **Cart Routes (routes/cartRoutes.js)**

```javascript
import { Router } from "express";
import {
    getCart,
    addToCart,
    removeFromCart,
} from "../controllers/cartController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.get("/", authenticate, getCart);
router.post("/add", authenticate, addToCart);
router.post("/remove", authenticate, removeFromCart);

export default router;
```

#### **Order Routes (routes/orderRoutes.js)**

```javascript
import { Router } from "express";
import { createOrder, getOrders } from "../controllers/orderController.js";
import { authenticate } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/", authenticate, getOrders);

export default router;
```

#### **Admin Routes (routes/adminRoutes.js)**

```javascript
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
```

### 9. **App Entry Point (app.js)**

```javascript
import express from "express";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import dotenv from "dotenv";

dotenv.config();
connectDB();

const app = express();
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin", adminRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

### 10. **Run the Application**

Start your application with:

```bash
node app.js
```

This code sets up a basic e-commerce API with role-based access control. Admins can manage products and view all orders, while Managers can manage products and view orders related to their role. Customers can view products, manage their cart, and place orders.
