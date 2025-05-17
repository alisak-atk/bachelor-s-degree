const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI; 


async function connectToDatabase() {
  try {
    await mongoose.connect(uri); 
    console.log('Connected to MongoDB using Mongoose!');
    return true;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    return false;
  }
}

module.exports = {
  connectToDatabase,
};
