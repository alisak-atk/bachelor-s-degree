const { processDonationQueue } = require("../services/donation.service");
const Donation = require("../models/Donation"); 
const Payment = require("../models/Payment");

function overlaysocket(io) {
  io.on("connection", (socket) => {
    socket.on("joinRoom", (userId) => {
      socket.join(userId);
    });

    socket.on("donationReceived", async (donation) => {
      try {
        
        const newDonation = new Donation({
          donor: donation.donor,       
          receiverID: donation.id,    
          amount: donation.amount,  
          dateTime: donation.dateTime,  
          paymentMethod: donation.paymentMethod,
          status: false,    
          message: donation.message,  
          transactionId: donation.transactionId,
        });


        await newDonation.save();

        
        processDonationQueue(io, donation.id);
      } catch (error) {
        console.error("Error processing donation:", error);
      }
    });

    socket.on("PaymentReceived", async (payment) => {
      try {
        
        const newPayment = new Payment({
          transactionId: payment.transactionId,       
          receiverID: payment.id,    
          amount: payment.amount,   
          status: payment.status,  
          paymentMethod: payment.paymentMethod,
          dateTime: payment.dateTime,    
          memo: payment.memo,       
          merchantName: payment.merchantName,
          billNumber: payment.billNumber,
        });


        await newPayment.save();
      } catch (error) {
        console.error("Error Payment:", error);
      }
    });
  });
}

module.exports = overlaysocket;
