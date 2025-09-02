import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        passwordHash: { type: String, required: true }, // bcrypt hashed
        shopName: { type: String, required: true },
        dbName: { type: String, required: true }, // e.g., "shop_123"
        createdAt: { type: Date, default: Date.now }
    },
    { collection: "users" }
);

export const User = mongoose.model("User", userSchema);
