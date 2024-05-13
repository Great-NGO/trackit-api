// Database Configuration files
const mongoose = require("mongoose");
const { MONGODB_DEV_URI, MONGODB_URI, NODE_ENV } = require("../utils/envSecrets");
const log = require("../utils/logger");

exports.connectToDB = async () => {

    //Connecting to the database.
    log("NODE_ENV", NODE_ENV)
    const dbUri = NODE_ENV === "development" ? MONGODB_DEV_URI : MONGODB_URI;

    mongoose.set('strictQuery', false); 
    await mongoose
        .connect(dbUri)
        .then(() => {
            console.log(`Successfully connected to MongoDB @ ${dbUri}`);
        })
        .catch((err) => {
            //   logError("Error connecting to database: ", err);
            console.error("Error connecting to database: ", err);
            throw new Error(err);
        });
};

exports.closeDBConnection = () => {
    return mongoose.disconnect();
};
