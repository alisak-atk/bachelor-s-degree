const express = require("express");
const router = express.Router();
const User = require("../models/User");

router.get("/", async (req, res) => {
  try {
    const users = await User.find({
      firstname: { $ne: null },
      lastname: { $ne: null },
    })
      .select("-password")
      .sort({ timestamps: -1 });

    const formattedUsers = users.map((user) => ({
      ...user.toObject(),
      timestamps: new Date(user.timestamps).toLocaleString("en-GB", {
        timeZone: "Asia/Bangkok",
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }),
    }));

    res.json(formattedUsers);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const updates = req.body;
    if (updates.password) delete updates.password;

    updates.timestamps = new Date();

    const updated = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    }).select("-password");

    if (!updated) return res.status(404).json({ error: "User not found" });

    res.json({ message: "User updated", user: updated });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({ error: "Forbidden" });
    }

    const removed = await User.findByIdAndDelete(req.params.id);
    if (!removed) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ error: "Deletion failed" });
  }
});

module.exports = router;
