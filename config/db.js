const mongoose = require("mongoose");
const dotenv = require("dotenv")
dotenv.config({ path: './config/config.env' });
const connectDB = async () => {
  try {
    mongoose.set('strictQuery', false);
    console.log("MongoDB LINK ", process.env.MONGODB_LINK)
    await mongoose.connect(process.env.MONGODB_LINK, {
      useNewUrlParser: true,
    });

    console.log("MongoDB Connected...");
  } catch (err) {
    console.error("Error while conne",err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
