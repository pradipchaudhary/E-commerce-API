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
