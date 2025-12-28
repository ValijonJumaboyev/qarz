// models/DebtNote.js
import mongoose from "mongoose";

export const debtNoteSchema = new mongoose.Schema(
    {
        customerName: { type: String, required: true },
        phone: { type: String },
        items: [
            {
                description: { type: String, required: true },
                amount: { type: Number, required: true },
            },
        ],
        total: { type: Number, required: true },
        dueDate: { type: Date },
        status: {
            type: String,
            enum: ["unpaid", "paid", "disabled"],
            default: "unpaid",
        },
        createdAt: { type: Date, default: Date.now },
    },
    { collection: "debts" }
);

// Export function to create model for specific connection
// ⚠️ Do NOT attach model here globally (otherwise it pollutes authDB)
const getDebtNoteModel = (connection) => {
    return connection.model("DebtNote", debtNoteSchema);
};

export default getDebtNoteModel;