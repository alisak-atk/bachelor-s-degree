const axios = require("axios");
const activeTransactions = new Map();

exports.submitPayment = async (req, res) => {
  try {
    const { amount, description ,paymentMethod } = req.body; 

    if (!paymentMethod || !['bcel', 'jdb'].includes(paymentMethod)) {
      return res.status(400).json({ error: "Invalid payment method. Choose 'bcel' or 'jdb'." });
    }

    let url = '';
    if (paymentMethod === 'bcel') {
      url = "https://payment-gateway.lailaolab.com/v1/api/payment/generate-bcel-qr";
    } else if (paymentMethod === 'jdb') {
      url = "https://payment-gateway.lailaolab.com/v1/api/payment/generate-jdb-qr";
    }

    const config = {
      method: "post",
      url: url,
      headers: {
        secretKey: process.env.PAYMENT_Support_SECRET,
        "Content-Type": "application/json",
      },
      data: JSON.stringify({ amount, description }),
    };

    const response = await axios.request(config);
    activeTransactions.set(response.data.transactionId, true);
    
    res.status(200).json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to process payment." });
  }
};

exports.activeTransactions = activeTransactions;
