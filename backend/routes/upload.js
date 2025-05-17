const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const User = require("../models/User");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });


router.post("/", upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded!" });
  }

  const { fileTypeFromBuffer } = await import("file-type");

  const fileType = await fileTypeFromBuffer(req.file.buffer);
  if (!fileType || !["image/jpeg", "image/png"].includes(fileType.mime)) {
    return res
      .status(400)
      .json({ error: "Invalid image format! Only JPG and PNG allowed." });
  }

  const userId = req.body.userId || "default"; 
  const userDir = path.join(__dirname, "../uploads", userId);

  
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
  }

  const filePath = path.join(userDir, "profile.jpg");

  
  fs.writeFileSync(filePath, req.file.buffer);

  res.json({
    message: "File uploaded successfully!",
  });
});

router.get("/get-image", (req, res) => {
  try {
    const userId = req.query.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required!" });
    }

    const imagePath = path.join(__dirname, "../uploads", userId, "profile.jpg");

    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: "Image not found!" });
    }

    res.setHeader("Cache-Control", "public, max-age=86400");

    res.sendFile(imagePath);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post(
  "/verify",
  upload.fields([
    { name: "idFront", maxCount: 1 },
    { name: "idBack", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  async (req, res) => {
    const {
      userId,
      firstname,
      lastname,
      phonenumber,
      cardType,
      bankName,
      accountName,
      accountNumber,
    } = req.body;

    if (
      !userId ||
      !firstname ||
      !lastname ||
      !phonenumber ||
      !cardType ||
      !bankName ||
      !accountName ||
      !accountNumber ||
      !req.files
    ) {
      return res
        .status(400)
        .json({ error: "Missing required fields or files!" });
    }

    const allowedCardTypes = ["passport", "citizenId", "driverLicense"];
    if (!allowedCardTypes.includes(cardType)) {
      return res.status(400).json({ error: "Invalid cardType!" });
    }

    try {
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      
      const verifyDir = path.join(__dirname, "../uploads", userId, "verify");

      
      if (!fs.existsSync(verifyDir)) {
        fs.mkdirSync(verifyDir, { recursive: true });
      }

      
      const idFrontPath = path.join(verifyDir, "idfront.jpg");
      const idBackPath = path.join(verifyDir, "idback.jpg");
      const selfiePath = path.join(verifyDir, "selfie.jpg");

      fs.writeFileSync(idFrontPath, req.files.idFront[0].buffer);
      fs.writeFileSync(idBackPath, req.files.idBack[0].buffer);
      fs.writeFileSync(selfiePath, req.files.selfie[0].buffer);

      user.firstname = firstname;
      user.lastname = lastname;
      user.phonenumber = phonenumber;
      user.cardType = cardType;

      const newBankAccount = {
        bankName: bankName,
        accountName: accountName,
        accountNumber: accountNumber,
      };

      user.bankAccount = newBankAccount;

      user.bankAccount = newBankAccount;
      user.status = "pending";
      user.isVerified = false;

      await user.save();

      res.json({
        message: "Verification data uploaded successfully!",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        error: "An error occurred while uploading verification data.",
      });
    }
  }
);

router.get("/verification", async (req, res) => {
  const { userId } = req.query;

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const user = await User.findById(userId).select(
      "firstname lastname phonenumber cardType status bankAccount.bankName bankAccount.accountName bankAccount.accountNumber"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user verification data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/get-verification-image", (req, res) => {
  const { userId, imageType } = req.query;

  if (!userId || !imageType) {
    return res
      .status(400)
      .json({ error: "userId and imageType are required!" });
  }

  const allowedTypes = ["idfront", "idback", "selfie"];
  if (!allowedTypes.includes(imageType)) {
    return res.status(400).json({ error: "Invalid imageType!" });
  }

  const imagePath = path.join(
    __dirname,
    "../uploads",
    userId,
    "verify",
    `${imageType}.jpg`
  );

  if (!fs.existsSync(imagePath)) {
    return res.status(404).json({ error: "Image not found!" });
  }

  res.sendFile(imagePath);
});

router.get("/verification/admin", async (req, res) => {
  try {
    const allowedStatuses = ["approved", "pending", "rejected"];
    const users = await User.find({
      status: { $in: allowedStatuses },
    }).select("firstname lastname status _id");

    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    const data = users.map((user) => ({
      userId: user._id,
      name: `${user.firstname} ${user.lastname}`,
      status: user.status,
    }));

    res.json(data);
  } catch (error) {
    console.error("Error fetching user verification data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/verification/admin/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error fetching user data:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/verification/admin/update/:userId", async (req, res) => {
  try {
    const { userId } = req.params; 
    const { status, isVerified } = req.body; 

    
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.status = status ?? user.status;
    user.isVerified = isVerified ?? user.isVerified;

    await user.save();

    res.json(user);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.patch("/verification/admin/delete/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      {
        firstname: null,
        lastname: null,
        phonenumber: null,
        cardType: null,
        status: null,
        bankAccount: {
          bankName: null,
          accountName: null,
          accountNumber: null,
        },
        isVerified: false,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const verifyDir = path.join(__dirname, "../uploads", userId, "verify");
    if (fs.existsSync(verifyDir)) {
      fs.rmSync(verifyDir, { recursive: true, force: true });
    }

    res.json({ message: "User verification rejected and data cleared", user });
  } catch (error) {
    console.error("Error rejecting user:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
