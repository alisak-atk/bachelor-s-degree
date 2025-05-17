const paymentService = require("../services/payment.service");
const { donationsCollection } = require("../services/donation.service");

exports.submitPayment = paymentService.submitPayment;

exports.getQueue = async (req, res) => {
  try {
    const donations = await donationsCollection
      .find({ processed: false })
      .sort({ createdAt: 1 })
      .toArray();
    res.json(donations);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch donation queue." });
  }
};
