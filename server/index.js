import e from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

import authRoute from "./routes/auth.js";
import debtRoute from "./routes/debtNote.js";
import { productionConfig } from "./config/production.js";

dotenv.config();
const app = e();

const PORT = process.env.PORT || productionConfig.PORT;
const MONGO_URI = process.env.MONGO_URI || productionConfig.MONGO_URI;

// CORS configuration
const corsOptions = {
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        const allowedOrigins = productionConfig.CORS_ORIGINS;
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

// Middleware
app.use(e.json());
app.use(cors(corsOptions));

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development'
    });
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api/", debtRoute);

app.get("/", (req, res) => {
    res.json({
        app: "QarzDaftar API",
        version: "1.0.0",
        status: "running",
        endpoints: [
            { auth: `http://localhost:${PORT}/api/auth` },
            { debts: `http://localhost:${PORT}/api/debts` },
            { health: `http://localhost:${PORT}/health` }
        ]
    });
});

// MongoDB connection
mongoose
    .connect(MONGO_URI, {
        dbName: "authDB", // main auth DB
    })
    .then(() => {
        console.log("✅ Connected to MongoDB (authDB)");
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        app.listen(PORT, () =>
            console.log(`🚀 QarzDaftar API running on http://localhost:${PORT}`)
        );
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1);
    });
