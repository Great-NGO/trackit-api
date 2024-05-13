const winston = require('winston');
const { NODE_ENV } = require('../utils/envSecrets');

// Define custom log format with colorization
const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    let color;
    // Apply colorization based on log level
    switch (level) {
        case 'info':
            color = '\x1b[90m'; // Light Gray
            // color = '\x1b[32m'; //Green
            break;
        case 'warn':
            color = '\x1b[33m'; // Yellow
            break;
        case 'error':
            color = '\x1b[31m'; // Red
            break;
        default:
            color = '\x1b[37m'; // White
    }

    return `${color}[${timestamp}] level:${level}, message: ${message}\x1b[0m]`; //Reset color after message
});

// Configure Winston logger
const loggerTransports = [
    new winston.transports.Console({
        format: winston.format.combine(
            winston.format.timestamp(),
            logFormat
        )
    })  // Log to console
];

// Add file transports only if not in development mode
if (NODE_ENV !== 'development') {
    loggerTransports.push(
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),  // Log errors to file
        new winston.transports.File({ filename: 'logs/combined.log' })  // Log all messages to another file
    );
}

const logger = winston.createLogger({
    transports: loggerTransports
});

module.exports = logger;
