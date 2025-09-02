import jwt from "jsonwebtoken";
import { User } from "../models/AuthModel.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

export function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    console.log("Auth middleware - Headers:", req.headers);
    console.log("Auth middleware - Token:", token ? "Present" : "Missing");

    if (!token) {
        return res.status(401).json({ message: "Access token required" });
    }

    jwt.verify(token, JWT_SECRET, async (err, decoded) => {
        if (err) {
            console.log("JWT verification error:", err.message);
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({ message: "Token expired" });
            }
            return res.status(403).json({ message: "Invalid token" });
        }

        console.log("JWT decoded successfully:", decoded);

        try {
            // Verify user still exists
            const user = await User.findById(decoded.userId);
            if (!user) {
                console.log("User not found in database:", decoded.userId);
                return res.status(404).json({ message: "User not found" });
            }

            console.log("User found:", user.email, "DB:", user.dbName);

            // Add user info to request
            req.user = {
                id: user._id,
                email: user.email,
                shopName: user.shopName,
                dbName: user.dbName
            };
            next();
        } catch (error) {
            console.error("Auth middleware error:", error);
            res.status(500).json({ message: "Authentication error" });
        }
    });
}
