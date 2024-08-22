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
