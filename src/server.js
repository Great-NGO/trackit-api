const { server } = require("./app");
const { connectToDB } = require("./config/dbConfig");
const port = process.env.PORT || 4000;
const logger = require("./config/logger");

const startServer = () => {

    server.listen(port, () => {
        logger.info(`Trackit Server is listening on PORT ${port}`);
    })

}

// Call the ConnectToDB Method - Ensures connection to DB occurs
connectToDB()
    .then(() => {
        startServer()   //Call the startServer function which starts the server after database connection 
    })
    .catch((err) => {
        logger.error(`Failed to connect to Database and start Server. Error: ${err}`)
    })


// If any error in starting server
server.on("error", (err) => {
    logger.error(`Error Present: ${err}`)
    process.exit(1);
});

// If any warning
process.on('warning', (error) => {
    // console.warn(`WARNING `, error.stack);
    logger.warn(`WARNING: ${error}`);

})

// If any unhandledRejection in our process Event
process.on("unhandledRejection", (error) => {
    logger.error(`UNHANDLED REJECTION! Shutting down... : ${error}`);
    // console.error("UNHANDLED REJECTION! Shutting down...", error);
    process.exit(1);
})
