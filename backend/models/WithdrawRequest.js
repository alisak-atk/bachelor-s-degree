const mongoose = require("mongoose");

const WithdrawRequestSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: ["pending", "approved", "rejected"],
  },
  requestedAt: { type: Date, default: Date.now, required: true },
  processAt: { type: Date },
  withdrawalId: { type: String, required: true, unique: true },
  sendMoneyID: { type: String },
  adminNote: { type: String },
});

module.exports = mongoose.model("WithdrawRequest", WithdrawRequestSchema);
