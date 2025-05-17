
const Donation = require("../models/Donation");

const userProcessingQueues = {};  
const PROCESSING_DELAY = 20000;  

async function processDonationQueue(io, receiverID) {
  
  if (!userProcessingQueues[receiverID]) {
    userProcessingQueues[receiverID] = [];
  }

  
  userProcessingQueues[receiverID].push(async () => {
    try {
      const donations = await Donation.find({ status: false, receiverID }).sort({ dateTime: 1 });

      if (donations.length === 0) {
        return;
      }

      for (const donation of donations) {
        
        io.to(donation.receiverID.toString()).emit("Overlay", {
          user: donation.donor,
          amount: donation.amount,
          comment: donation.message,
        });

        
        await Donation.updateOne(
          { _id: donation._id },
          { $set: { status: true } }
        );

        
        if (PROCESSING_DELAY > 0) {
          await new Promise(resolve => setTimeout(resolve, PROCESSING_DELAY));
        }
      }
    } catch (error) {
      console.error("Error processing donation queue:", error);
    } finally {
      
      userProcessingQueues[receiverID].shift();

      
      if (userProcessingQueues[receiverID].length > 0) {
        const nextTask = userProcessingQueues[receiverID][0];
        nextTask();
      }
    }
  });

  
  if (userProcessingQueues[receiverID].length === 1) {
    const currentTask = userProcessingQueues[receiverID][0];
    currentTask();
  }
}

module.exports = { processDonationQueue };
