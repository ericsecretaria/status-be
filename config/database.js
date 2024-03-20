const mongoose = require("mongoose");
// Connect to db

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    console.log("DB has been connected");
  } catch (error) {
    console.log("DB Connection failed", error.message);
  }
};

module.exports = connectDB;
//sCBj9iMNVPzfmGI5
//mongodb+srv://ejsecretaria:sCBj9iMNVPzfmGI5@statustracker.lqgwlpo.mongodb.net/?retryWrites=true&w=majority&appName=statustracker
