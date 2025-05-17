const express = require("express");
const { submitPayment } = require("../controllers/donation.controller");

const router = express.Router();
const Donation = require("../models/Donation");

router.post("/submit-payment", submitPayment);

router.get("/total/:userId", async (req, res) => {
  const { userId } = req.params;
  const { timestart, timeend } = req.query;

  if (!timestart || !timeend) {
    return res.status(400).json({ error: "Missing timestart or timeend" });
  }

  const formatDateString = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const formattedStartDate = formatDateString(timestart);
  const formattedEndDate = formatDateString(timeend);

  const startDate = new Date(formattedStartDate);
  const rawEndDate = new Date(formattedEndDate);
  const endDate = new Date(rawEndDate.setHours(23, 59, 59, 999));

  const LAO_OFFSET = 7 * 60 * 60 * 1000;
  const utcStartDate = new Date(startDate.getTime() - LAO_OFFSET);
  const utcEndDate = new Date(endDate.getTime() - LAO_OFFSET);

  try {
    const donations = await Donation.find({
      receiverID: userId,
      dateTime: {
        $gte: utcStartDate,
        $lte: utcEndDate
      }
    });

    const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0);

    res.json({ amount: totalAmount });
  } catch (err) {
    console.error("Filter error:", err);
    res.status(500).json({ error: "Failed to filter donations" });
  }
});

router.get("/topdonators/:userId", async (req, res) => {
  const { userId } = req.params;
  const { timestart, timeend } = req.query;

  if (!timestart || !timeend) {
    return res.status(400).json({ error: "Missing timestart or timeend" });
  }

  const formatDateString = (dateString) => {
    const [day, month, year] = dateString.split("-");
    return `${year}-${month}-${day}`;
  };

  const formattedStartDate = formatDateString(timestart);
  const formattedEndDate = formatDateString(timeend);

  const startDate = new Date(formattedStartDate);
  const rawEndDate = new Date(formattedEndDate);
  const endDate = new Date(rawEndDate.setHours(23, 59, 59, 999));

  const LAO_OFFSET = 7 * 60 * 60 * 1000;
  const utcStartDate = new Date(startDate.getTime() - LAO_OFFSET);
  const utcEndDate = new Date(endDate.getTime() - LAO_OFFSET);

  try {
    const donations = await Donation.find({
      receiverID: userId,
      dateTime: {
        $gte: utcStartDate,
        $lte: utcEndDate,
      },
    });

    const donationMap = {};

    for (const donation of donations) {
      if (!donationMap[donation.donor]) {
        donationMap[donation.donor] = 0;
      }
      donationMap[donation.donor] += donation.amount;
    }

    const topDonors = Object.entries(donationMap)
      .map(([donor, amount]) => ({ donor, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    res.json(topDonors);
  } catch (err) {
    console.error("Top Donator Error:", err);
    res.status(500).json({ error: "Failed to fetch top donators" });
  }
});


module.exports = router;
