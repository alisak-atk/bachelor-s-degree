const express = require("express");
const Donation = require("../models/Donation");
const router = express.Router();

router.get("/", async (req, res) => {
  try {

    const { role, id } = req.query;

    let query = {};
    let sortCriteria = { dateTime: -1 };

    if (role === "user") {
      query = { receiverID: id };
    }

    const donations = await Donation.find(query)
      .populate("receiverID", "username") 
      .select("donor amount dateTime paymentMethod transactionId receiverID")
      .sort(sortCriteria);

    if (!donations || donations.length === 0) {
      return res.status(404).json({ message: "No donations found" });
    }

    const data = donations.map((donation) => ({
      receiverUsername: donation.receiverID?.username || "Unknown",
      name: donation.donor,
      amount: donation.amount,
      date: new Date(donation.dateTime).toLocaleString(
        "en-GB",
        {
          timeZone: "Asia/Bangkok",
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }
      ),
      bank: donation.paymentMethod,
      transactionId: donation.transactionId,
    }));

    res.json(data);
  } catch (error) {
    console.error("Error fetching donation history:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
