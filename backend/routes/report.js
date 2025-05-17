const express = require("express");
const router = express.Router();
const Donation = require("../models/Donation");
const WithdrawRequest = require("../models/WithdrawRequest");
const User = require("../models/User");

const formatDate = (date) => {
  return date
    ? new Date(date).toLocaleString("en-GB", {
        timeZone: "Asia/Bangkok",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      })
    : "";
};

router.get("/user", async (req, res) => {
  const { type, id } = req.query;

  try {
    let data;

    if (type === "donation") {
      data = await Donation.find({
        receiverID: id,
      }).select("donor amount dateTime paymentMethod message");

      data = await Donation.populate(data, {
        path: "receiverID",
        select: "username",
      });

      data = data.map((donation) => ({
        ...donation.toObject(),
        dateTime: formatDate(donation.dateTime),
      }));
    }

    if (type === "withdraw") {
      data = await WithdrawRequest.find({
        userID: id,
      }).select("amount status requestedAt processAt sendMoneyID adminNote");

      data = await WithdrawRequest.populate(data, {
        path: "userID",
        select: "username",
      });

      data = data.map((withdraw) => ({
        ...withdraw.toObject(),
        requestedAt: formatDate(withdraw.requestedAt),
        processAt: formatDate(withdraw.processAt),
      }));
    }

    res.json({ data });
  } catch (err) {
    console.error("Error fetching report data:", err);
    res.status(500).json({ error: "Failed to fetch report data" });
  }
});

router.get("/admin", async (req, res) => {
  const { type, role } = req.query;

  try {
    if (role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }

    let data = [];

    if (type === "user") {
      data = await User.find({
        firstname: { $ne: null },
        lastname: { $ne: null },
      }).select("firstname lastname username role timestamps");

      data = data.map((user) => ({
        ...user.toObject(),
        timestamps: formatDate(user.timestamps),
      }));
    }

    if (type === "donation") {
      data = await Donation.find({})
        .select("donor amount dateTime paymentMethod transactionId receiverID")
        .populate({
          path: "receiverID",
          select: "username",
        });

      data = data.map((donation) => ({
        ...donation.toObject(),
        dateTime: formatDate(donation.dateTime),
      }));
    }
    if (type === "verifyRequest") {
      data = await User.find({
        firstname: { $ne: null },
        lastname: { $ne: null },
      }).select("firstname lastname status bankAccount cardType timestamps");

      data = data.map((user) => ({
        ...user.toObject(),
        timestamps: formatDate(user.timestamps),
        bankName: user.bankAccount?.bankName || null,
        accountName: user.bankAccount?.accountName || null,
        accountNumber: user.bankAccount?.accountNumber || null,
      }));
    }

    if (type === "withdraw") {
      data = await WithdrawRequest.find({})
        .select(
          "amount status requestedAt processAt sendMoneyID adminNote userID"
        )
        .populate({
          path: "userID",
          select: "username",
        });
      data = data.map((withdraw) => ({
        ...withdraw.toObject(),
        requestedAt: formatDate(withdraw.requestedAt),
        processAt: formatDate(withdraw.processAt),
      }));
    }

    res.json({ data });
  } catch (err) {
    console.error("Error fetching admin report data:", err);
    res.status(500).json({ error: "Failed to fetch report data" });
  }
});

module.exports = router;
