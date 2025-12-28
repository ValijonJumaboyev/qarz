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
        
        // Check if origin matches any allowed origin (string or regex)
        const isAllowed = allowedOrigins.some(allowed => {
            if (typeof allowed === 'string') {
                return allowed === origin;
            } else if (allowed instanceof RegExp) {
                return allowed.test(origin);
            }
            return false;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            // In development, be more permissive with local network IPs
            const isDevelopment = process.env.NODE_ENV !== 'production';
            if (isDevelopment) {
                // Allow local network IPs (192.168.x.x, 10.x.x.x, 172.16-31.x.x)
                const localNetworkPattern = /^http:\/\/(192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+|172\.(1[6-9]|2[0-9]|3[0-1])\.\d+\.\d+):\d+$/;
                if (localNetworkPattern.test(origin)) {
                    console.log(`✅ Allowing local network origin: ${origin}`);
                    return callback(null, true);
                }
            }
            
            // In production, log but allow HTTPS origins for flexibility
            if (process.env.NODE_ENV === 'production' && origin.startsWith('https://')) {
                console.log(`✅ Allowing HTTPS origin in production: ${origin}`);
                return callback(null, true);
            }
            
            console.log(`❌ CORS blocked origin: ${origin}`);
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
        dbName: "authDB",
    })
    .then(() => {
        console.log("✅ Connected to MongoDB (authDB)");
        console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
        // Listen on 0.0.0.0 to allow connections from local network
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`🚀 QarzDaftar API running on http://localhost:${PORT}`);
            console.log(`🌐 Accessible from local network on port ${PORT}`);
        });
    })
    .catch((err) => {
        console.error("❌ MongoDB connection failed:", err.message);
        process.exit(1);
    });
