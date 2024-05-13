require('dotenv');
const express = require("express");
const morgan = require("morgan");
const fs = require("fs");
const http = require("http");
const socketIo = require("socket.io");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const multer = require("multer");

// Rate Limiter
const rateLimit = require("express-rate-limit");
const { swaggerDocs } = require('./config/swagger');
const errorMiddleware = require('./middleware/errorHandler');

// Apply rate limiting middleware
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,   //15 minutes
    max: 100,      //Max requests per IP - Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-7', // draft-6: `RateLimit-*` headers; draft-7: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.  
    // message: 'Too many requests from this IP, please try again later.'
    // keyGenerator: function (req) {
    //     return req.user.id;     //Use user ID as the key, (defaults to IP address)
    // },
    handler: function (req, res, next) {
        res.status(429).json({
            error: "You have exceeded the 100 requests in 15 minutes limit! Please try again later.",
            success: false,
            status: 429
        })
    }
})

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


// Middlewares    
app.disable('x-powered-by');
// app.use(helmet())   //HTTP Header security middleware
// if(NODE_ENV === "production") {
//     app.use(helmet());  //HTTP Header security middleaware
// }

app.use(morgan('dev'));     //HTTP middleware
app.use(express.json());    //To allow json requests 
app.use(express.urlencoded({ extended: false }))  //Decode requests from forms (To allow objects to be sent from forms or not using the query string (qs))
app.use(cookieParser())


// To prevent cors error
app.use(cors())

// Apply the rate limiting middleware to all requests.
app.use(limiter);

// Swagger Doc
swaggerDocs(app)

// For File Upload
if (!fs.existsSync('./uploads')) {
    fs.mkdirSync("./uploads");
}

// For static rendering, also for image/file upload
app.use(express.static('uploads'));


// For API endpoint (home route)
app.get("/", (req, res) => {
    res.status(200).json({
        status: "Trackit Backend Server ACTIVE!",
        type: `${req.method} request`
    })
})

// ROUTES - Return all the routes from our routes directory
fs.readdirSync("./src/routes").map((routes) => {
    app.use("/api/v1", require(`./routes/${routes}`))
})

// Socket.IO setup


// General (Custom) Error middleware handler - This error handler is also used by express async handler method as it calls the next method which looks for the next error handler middleware 
app.use(errorMiddleware)

// Return 404 JSON response for undefined requests
app.use("*", (req, res) => {
    res.status(404).send({ error: "Endpoint does not exist", success: false, status: 404 });
})

module.exports = { app, server };
