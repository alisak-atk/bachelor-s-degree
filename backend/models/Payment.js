const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  transactionId: { type: String, required: true },
  receiverID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: { type: Number, required: true },
  status: { type: String, required: true },
  paymentMethod: { type: String, required: true },
  dateTime: { type: String, required: true },
  memo: { type: String },
  merchantName: { type: String },
  billNumber: { type: String, required: true, unique: true },
});

module.exports = mongoose.model("Payment", PaymentSchema);
