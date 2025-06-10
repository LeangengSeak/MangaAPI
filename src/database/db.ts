const mongoose = require("mongoose");
const { config } = require("../config/app.config");

const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log("connected to Mongo database");
  } catch (error) {
    console.error("Error connecting to Mongo database");
    process.exit(1);
  }
};

export = connectDatabase;
