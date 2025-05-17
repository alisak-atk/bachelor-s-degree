const express = require("express");
const User = require("../models/User"); 
const router = express.Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "ອີເມວນີ້ມີການລົງທະບຽນກ່ອນແລ້ວ!" });
    }

    const newUser = new User({ email, password });
    await newUser.save();

    res.status(201).json({ message: "ສະໝັກສະມາຊິກສຳເລັດ!" });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "ການລົງທະບຽນຜິດພາດ!" });
  }
});

module.exports = router;
