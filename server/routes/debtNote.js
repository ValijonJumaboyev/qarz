// routes/getDebtNoteModel.js
import express from "express";
import { getShopDb } from "../dbmnager.js";
import getDebtNoteModel from "../models/DebtModel.js";
import { authenticateToken } from "../middleware/auth.js";

const router = express.Router();

// middleware to resolve shop db from authenticated user
async function withShopDb(req, res, next) {
    try {
        // User info is now available from JWT auth middleware
        const { dbName } = req.user;

        console.log("withShopDb - User info:", req.user);
        console.log("withShopDb - Database name:", dbName);

        req.shopConn = getShopDb(dbName);
        req.getDebtNoteModel = getDebtNoteModel(req.shopConn);
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to resolve shop db" });
    }
}

// --- TEST ENDPOINT ---
router.get("/test", authenticateToken, (req, res) => {
    console.log("Test endpoint - User info:", req.user);
    res.json({
        message: "JWT authentication working",
        user: req.user,
        timestamp: new Date().toISOString()
    });
});

// --- CREATE ---
router.post("/debts", authenticateToken, withShopDb, async (req, res) => {
    try {
        const { customerName, phone, items, total, dueDate } = req.body;
        const note = await req.getDebtNoteModel.create({
            customerName,
            phone,
            items,
            total,
            dueDate
        });
        res.status(201).json(note);
    } catch (err) {
        res.status(500).json({ message: "Failed to create debt", error: err.message });
    }
});

// --- LIST ALL ---
router.get("/debts", authenticateToken, withShopDb, async (req, res) => {
    try {
        console.log("GET /debts - Fetching debts for user:", req.user.email);

        // First, get all records to see what's in the database
        const allDebts = await req.getDebtNoteModel.find().sort({ createdAt: -1 });
        console.log("GET /debts - All records found:", allDebts.length);
        console.log("GET /debts - All records:", allDebts.map(d => ({ customerName: d.customerName, total: d.total })));

        // Filter out "Init" records and sort by creation date
        const debts = await req.getDebtNoteModel
            .find({ customerName: { $ne: "Init" } })
            .sort({ createdAt: -1 });

        console.log("GET /debts - Filtered debts:", debts.length);
        console.log("GET /debts - Sample debt:", debts[0]);

        res.json(debts);
    } catch (err) {
        console.error("GET /debts - Error:", err);
        res.status(500).json({ message: "Failed to fetch debts", error: err.message });
    }
});

// --- GET ONE ---
router.get("/debts/:id", authenticateToken, withShopDb, async (req, res) => {
    try {
        const note = await req.getDebtNoteModel.findById(req.params.id);
        if (!note) return res.status(404).json({ message: "Not found" });
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch debt", error: err.message });
    }
});

// --- UPDATE ---
router.patch("/debts/:id", authenticateToken, withShopDb, async (req, res) => {
    try {
        const note = await req.getDebtNoteModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!note) return res.status(404).json({ message: "Not found" });
        res.json(note);
    } catch (err) {
        res.status(500).json({ message: "Failed to update debt", error: err.message });
    }
});

// --- DELETE ---
router.delete("/debts/:id", authenticateToken, withShopDb, async (req, res) => {
    try {
        const note = await req.getDebtNoteModel.findByIdAndDelete(req.params.id);
        if (!note) return res.status(404).json({ message: "Not found" });
        res.json({ message: "Deleted successfully" });
    } catch (err) {
        res.status(500).json({ message: "Failed to delete debt", error: err.message });
    }
});

export default router;
