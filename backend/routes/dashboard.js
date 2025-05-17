const express = require("express");
const router = express.Router();
const WithdrawRequest = require("../models/WithdrawRequest");
const Donation = require("../models/Donation");
const User = require("../models/User");

router.get("/total", async (req, res) => {
  const userId = req.user.id;
  const { startDate, endDate } = req.query;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  
  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.$gte = new Date(startDate);
    dateFilter.$lte = new Date(endDate);
  }

  try {
    
    const donationQuery = { receiverID: userId };
    if (startDate && endDate) {
      donationQuery.dateTime = dateFilter;
    }

    const donations = await Donation.find(donationQuery).select("amount donor");

    const taxRate = 0.1;
    const totalDonationsAfterTax = donations.reduce((total, donation) => {
      const tax = Math.floor(donation.amount * taxRate);
      const amountAfterTax = Math.floor(donation.amount - tax);
      return total + amountAfterTax;
    }, 0);

    const uniqueDonorSet = new Set(donations.map((d) => d.donor));
    const donorCount = uniqueDonorSet.size;

    
    const withdrawQuery = {
      userID: userId,
      status: { $in: ["pending", "approved", "rejected"] },
    };

    const requestQuery = {
      userID: userId,
    };

    if (startDate && endDate) {
      withdrawQuery.requestedAt = dateFilter;
      requestQuery.requestedAt = dateFilter;
    }

    const withdrawals = await WithdrawRequest.find(withdrawQuery).select(
      "amount"
    );

    const totalWithdrawals = withdrawals.reduce(
      (total, request) => total + Math.floor(request.amount),
      0
    );

    const withdrawalCount = totalWithdrawals;

    const remainingAmount = Math.floor(
      totalDonationsAfterTax - totalWithdrawals
    );

    res.status(200).json({
      totalDonationsAfterTax,
      remainingAmount,
      donorCount,
      withdrawalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

router.get("/monthly-total", async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = new Date();
  const currentYear = now.getFullYear();

  const startOfYear = new Date(Date.UTC(currentYear, 0, 1, 0, 0, 0));
  const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

  try {
    const donations = await Donation.find({
      receiverID: userId,
      dateTime: {
        $gte: startOfYear,
        $lte: endOfYear,
      },
    }).select("amount dateTime");

    const taxRate = 0.1;
    const monthlyTotals = Array(12).fill(0);

    donations.forEach((donation) => {
      const month = new Date(donation.dateTime).getUTCMonth(); 
      const taxedAmount = Math.floor(
        donation.amount - donation.amount * taxRate
      );
      monthlyTotals[month] += taxedAmount;
    });

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const result = monthlyTotals.map((total, index) => ({
      month: monthNames[index],
      total,
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/admin/total", async (req, res) => {
  const user = req.user;

  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const { startDate, endDate } = req.query;

  const dateFilter = {};
  if (startDate && endDate) {
    dateFilter.$gte = new Date(startDate);
    dateFilter.$lte = new Date(endDate);
  }

  try {
    
    const userQuery = { role: { $ne: "admin" } };

    if (startDate && endDate) {
      userQuery.timestamps = dateFilter;
    }

    const userCount = await User.countDocuments(userQuery);

    
    const donationQuery = {};
    if (startDate && endDate) {
      donationQuery.dateTime = dateFilter;
    }

    const donations = await Donation.find(donationQuery).select("amount donor");

    const taxRate = 0.1;
    const totalDonationsAfterTax = donations.reduce((total, donation) => {
      const taxed = Math.floor(donation.amount - donation.amount * taxRate);
      return total + taxed;
    }, 0);

    
    const withdrawQuery = {
      status: { $in: ["pending", "approved", "rejected"] },
    };

    if (startDate && endDate) {
      withdrawQuery.requestedAt = dateFilter;
    }

    const withdrawals = await WithdrawRequest.find(withdrawQuery).select(
      "amount status"
    );

    const totalWithdrawals = withdrawals.reduce(
      (total, request) => total + Math.floor(request.amount),
      0
    );

    let approvedTotal = 0;
    let pendingTotal = 0;
    let rejectedTotal = 0;

    withdrawals.forEach((w) => {
      const amount = Math.floor(w.amount);
      if (w.status === "approved") approvedTotal += amount;
      else if (w.status === "pending") pendingTotal += amount;
      else if (w.status === "rejected") rejectedTotal += amount;
    });

    const withdrawalCount = totalWithdrawals;

    const pieChartData = [
      { name: "Approved", value: approvedTotal },
      { name: "Pending", value: pendingTotal },
      { name: "Rejected", value: rejectedTotal },
    ];

    const totalTransactions = donations.length;

    res.status(200).json({
      userCount,
      totalDonationsAfterTax,
      withdrawalCount,
      totalTransactions,
      pieChartData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/admin/monthly-total", async (req, res) => {
  const user = req.user;

  if (!user || user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden" });
  }

  const now = new Date();
  const currentYear = now.getFullYear();

  const startOfYear = new Date(Date.UTC(currentYear, 0, 1));
  const endOfYear = new Date(Date.UTC(currentYear, 11, 31, 23, 59, 59, 999));

  try {
    const donations = await Donation.find({
      dateTime: { $gte: startOfYear, $lte: endOfYear },
    }).select("amount dateTime");

    const taxRate = 0.1;
    const monthlyTotals = Array(12).fill(0);

    donations.forEach((donation) => {
      const month = new Date(donation.dateTime).getUTCMonth();
      const taxedAmount = Math.floor(
        donation.amount - donation.amount * taxRate
      );
      monthlyTotals[month] += taxedAmount;
    });

    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    const result = monthlyTotals.map((total, index) => ({
      month: monthNames[index],
      total,
    }));

    res.status(200).json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
