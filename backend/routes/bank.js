const express = require("express");
const router = express.Router();
const WithdrawRequest = require("../models/WithdrawRequest");
const Donation = require("../models/Donation");

router.get("/withdraw/total", async (req, res) => {
  const userId = req.user.id;

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const donations = await Donation.find({ receiverID: userId }).select(
      "amount"
    );

    const taxRate = 0.1;
    const totalDonationsAfterTax = donations.reduce((total, donation) => {
      const tax = Math.floor(donation.amount * taxRate);
      const amountAfterTax = Math.floor(donation.amount - tax);

      return total + amountAfterTax;
    }, 0);

    const withdrawals = await WithdrawRequest.find({
      userID: userId,
      status: { $in: ["pending", "approved"] },
    }).select("amount");

    const totalWithdrawals = withdrawals.reduce(
      (total, request) => total + Math.floor(request.amount),
      0
    );

    const remainingAmount = Math.floor(
      totalDonationsAfterTax - totalWithdrawals
    );

    res.status(200).json({
      totalDonationsAfterTax,
      remainingAmount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error. Try again later." });
  }
});

router.post("/withdraw/request", async (req, res) => {
  const { userId, withdrawAmount, remainingAmount } = req.body;

  if (!userId || !withdrawAmount) {
    return res
      .status(400)
      .json({ message: "User ID and withdrawal amount are required." });
  }

  try {
    if (withdrawAmount > remainingAmount) {
      return res
        .status(400)
        .json({ message: "Insufficient balance for this withdrawal." });
    }

    const withdrawalId = "WID-" + new Date().getTime();

    const requestedAt = new Date();

    const newWithdrawRequest = new WithdrawRequest({
      userID: userId,
      amount: withdrawAmount,
      status: "pending",
      withdrawalId,
      requestedAt: requestedAt,
    });

    await newWithdrawRequest.save();

    return res.status(200).json({
      message: "Withdrawal request successfully created.",
    });
  } catch (error) {
    console.error("Error processing withdrawal request:", error);
    return res
      .status(500)
      .json({ message: "Server error. Please try again later." });
  }
});

router.get("/withdraw/get", async (req, res) => {
  try {
    const { role, id } = req.query;

    let query = {};
    let sortCriteria = { requestedAt: -1 };
    let selectFields = "amount status requestedAt withdrawalId";

    if (role === "user") {
      query = { userID: id };
    } else if (role === "admin") {
      selectFields = "amount status requestedAt userID withdrawalId";
    }

    const withdrawRequests = await WithdrawRequest.find(query)
      .select(selectFields)
      .sort(sortCriteria);

    if (role === "admin") {
      await WithdrawRequest.populate(withdrawRequests, {
        path: "userID",
        select: "username",
      });
    }

    const data = withdrawRequests.map((withdraw) => ({
      amount: withdraw.amount,
      status: withdraw.status,
      date: new Date(withdraw.requestedAt).toLocaleString("en-GB", {
        timeZone: "Asia/Bangkok",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
      withdrawalId: withdraw.withdrawalId,
      ...(role === "admin" && {
        username: withdraw.userID ? withdraw.userID.username : null,
      }),
    }));

    res.json(data);
  } catch (error) {
    console.error("Error fetching withdraw request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/withdraw/details/:withdrawalId", async (req, res) => {
  try {
    const { withdrawalId } = req.params;

    const withdrawRequest = await WithdrawRequest.findOne({
      withdrawalId,
    }).populate("userID", "username bankAccount");

    if (!withdrawRequest) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    res.json({
      username: withdrawRequest.userID.username,
      amount: withdrawRequest.amount,
      status: withdrawRequest.status,
      processAt: withdrawRequest.processAt
        ? new Date(withdrawRequest.processAt).toLocaleString("en-GB", {
            timeZone: "Asia/Bangkok",
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false,
          })
        : "",
      requestedAt: new Date(withdrawRequest.requestedAt).toLocaleString(
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
      adminNote: withdrawRequest.adminNote || "",
      sendMoneyID: withdrawRequest.sendMoneyID || "",
      bankAccount: withdrawRequest.userID.bankAccount || {},
    });
  } catch (error) {
    console.error("Error fetching withdrawal details:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/withdraw/update/:withdrawalId", async (req, res) => {
  try {
    const { withdrawalId } = req.params;
    const { status, adminNote, sendMoneyID } = req.body;

    const ProcessAt = new Date();

    const updatedRequest = await WithdrawRequest.findOneAndUpdate(
      { withdrawalId },
      { status, sendMoneyID, adminNote, processAt: ProcessAt },
      { new: true }
    );

    if (!updatedRequest) {
      return res.status(404).json({ message: "Withdrawal request not found" });
    }

    res.json({
      success: true,
      message: "Withdrawal request updated successfully",
    });
  } catch (error) {
    console.error("Error updating withdrawal request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
