const express = require("express");
const User = require("../models/User");
const Hashids = require('hashids');
const hashids = new Hashids(process.env.HASH_SECRET, 10);

const router = express.Router();

router.get("/get-user/:username", async (req, res) => {
  const { username } = req.params;
  try {
    const user = await User.findOne({ username }).select("_id");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json({ _id: user._id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/get-id/:userid", async (req, res) => {
  const { userid } = req.params;

  try {
    const decodedId = hashids.decodeHex(userid);
    if (!decodedId) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findOne({ _id: decodedId }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ _id: user._id });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
