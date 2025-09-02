import express from "express";
import bcrypt from "bcrypt";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { User } from "../models/AuthModel.js";
import { getShopDb } from "../dbManager.js";
import getDebtNoteModel from "../models/DebtModel.js";

const router = express.Router();

// JWT secret key - in production, use environment variable
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRY = "7d"; // 1 week

// Helper function to generate JWT token
function generateToken(user) {
    return jwt.sign(
        {
            userId: user._id,
            email: user.email,
            shopName: user.shopName,
            dbName: user.dbName
        },
        JWT_SECRET,
        { expiresIn: JWT_EXPIRY }
    );
}

// --- SIGN UP ---
router.post("/signup", async (req, res) => {
    try {
        const { email, password, shopName } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(400).json({ message: "Email already registered" });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const dbName = `shop_${new mongoose.Types.ObjectId()}`; // unique db name

        // create user in authDB
        const user = await User.create({ email, passwordHash, shopName, dbName });

        // connect to shop db
        const shopConn = getShopDb(dbName);

        // bind model to this shop connection
        const DebtNote = getDebtNoteModel(shopConn);

        // insert a tiny doc so Atlas actually creates the DB
        await DebtNote.create({
            customerName: "Init",
            items: [{ description: "Setup", amount: 0 }],
            total: 0,
            status: "paid",
        });

        // Generate JWT token
        const token = generateToken(user);

        res.status(201).json({
            message: "Signup successful, shop database created",
            user: {
                id: user._id,
                email: user.email,
                shopName: user.shopName,
                dbName: user.dbName,
            },
            token
        });
    } catch (err) {
        console.error("Signup error:", err);
        res.status(500).json({ message: "Signup failed", error: err.message });
    }
});

// --- SIGN IN ---
router.post("/signin", async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log("SignIn attempt for:", email);

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

        // Generate JWT token
        const token = generateToken(user);
        console.log("SignIn - JWT token generated, length:", token.length);
        console.log("SignIn - Token payload:", JSON.parse(atob(token.split('.')[1])));

        res.json({
            message: "Signin successful",
            user: {
                id: user._id,
                email: user.email,
                shopName: user.shopName,
                dbName: user.dbName,
            },
            token
        });
    } catch (err) {
        console.error("SignIn error:", err);
        res.status(500).json({ message: "Error", error: err.message });
    }
});

export default router;
