const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); 
const Hashids = require('hashids');
const hashids = new Hashids(process.env.HASH_SECRET, 10);
const router = express.Router();

router.get("/get-username", async (req, res) => {
    const userId = req.user.id; 

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ username: user.username }); 
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/change-username", async (req, res) => {
    const { username } = req.body;
    const userId = req.user.id; 

    const usernameRegex = /^[a-zA-Z0-9]+$/;

    if (!usernameRegex.test(username)) {
        return res.status(400).json({ message: "Username can only contain letters (a-z, A-Z, 0-9)" });
    }

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (username && username !== user.username) {
            const usernameExists = await User.findOne({ username });

            if (usernameExists) {
                return res.status(400).json({ message: "ຊື່ຜູ້ໃຊ້ນິ້ມິຢູ່ໃນລະບົບແລ້ວ" });
            }

            user.username = username; 
        }

        await user.save(); 

        res.status(200).json({ message: "Username updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.put("/reset-password", async (req, res) => {
    const { password } = req.body;
    const userId = req.user.id; 

    try {
        
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (password) {
            user.password = password; 
        }

        await user.save(); 

        res.status(200).json({ message: "Profile updated successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/verify-password", async (req, res) => {
    const { password } = req.body;
    const userId = req.user.id; 

    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: "Incorrect password" });
        }

        res.status(200).json({ message: "Password verified successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/new-link", async (req, res) => {
    const userId = req.user.id;
  
    try {
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const encodedId = hashids.encodeHex(userId);
  
      const newLinks = {
        pop_up: `${encodedId}/popup`,
        lot: `${encodedId}/lot`,
        rank: `${encodedId}/rank`
      };
  
      user.links = newLinks;
      await user.save();
  
      res.status(200).json({ links: user.links });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
});
  
router.get("/get-link", async (req, res) => {
    const userId = req.user.id;
  
    try {
        const user = await User.findById(userId);
  
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
  
        res.status(200).json({ links: user.links });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});


module.exports = router;
