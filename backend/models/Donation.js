const mongoose = require("mongoose");

const donationSchema = new mongoose.Schema({
  donor: { type: String, required: true },
  receiverID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: { type: Number, required: true },
  dateTime: { type: Date, default: Date.now },
  paymentMethod: { type: String, required: true },
  status: { type: Boolean, default: false },
  message: { type: String },
  transactionId: { type: String, required: true },
});

module.exports = mongoose.model("Donation", donationSchema);
