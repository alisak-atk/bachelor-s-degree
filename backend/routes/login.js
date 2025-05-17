const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

router.post("/", async (req, res) => {
  const { email, password } = req.body;

  try {
    
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "ອີເມວນີ້ບໍ່ມີຢູ່ໃນລະບົບ!" });
    }

    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "ລະຫັດຜ່ານບໍ່ຖືກຕ້ອງ!" });
    }

    
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
        username: user.username, 
        verified: user.isVerified,
      },
      process.env.JWT_SECRET,
      { expiresIn: "2d" } 
    );
    

    res.status(200).json({ message: "ເຂົ້າສູ່ລະບົບສຳເລັດ!", token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "ມີຂໍ້ຜິດພາດໃນລະບົບ!" });
  }
});

module.exports = router;
