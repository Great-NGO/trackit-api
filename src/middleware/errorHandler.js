const multer = require("multer");
const logger = require("../config/logger");
const { translateError } = require("../utils/translateError");
const log = require("../utils/logger");

// ErrorHandler Middleware

const errorMiddleware = (error, req, res, next) => {
    // Log the error
    logger.error(`Error from error handler middleware: ${error}`);

    let err = error;    //Clone the error parameter into the err variable

    // If error is a multer Error, the status is 400 and the error is the error message
    if (err instanceof multer.MulterError) {
        // Handle Multer errors
        switch (err.code) {
            case 'LIMIT_FILE_SIZE':
                err.status = 400; //Bad request
                // err.error = err.message;
                // err.error = 'File size exceeds the limit.';
                err.message = 'File size exceeds the limit.';

                break;
            case 'LIMIT_UNEXPECTED_FILE':
                err.status = 400; //Bad request
                // err.error = err.message;
                // err.error = 'Unexpected number of files.';
                err.message = 'Unexpected number of files.';
                break;
            // any other type of multer error (default)
            default:
                err.status = 400;
                // err.error = err.message;
                err.message = err.message;
                break;
        }
    }

    // Translate the error for client response
    let [success, data, errorMessage, errResponseMetadata] = translateError(err, 'handling request');

    // Set the HTTP Status code based on the error
    let statusCode = errResponseMetadata?.status || 500;
    // log("errorMessage middleware ", errorMessage)

    errorMessage == null || errorMessage == undefined ? errorMessage = "Something went wrong" : errorMessage;

    return res.status(statusCode).json({
        error: errorMessage || "Internal Server Error.",
        success: false,
        status: statusCode,
        // errors: errResponseMetadata?.errors || []

    });
}

module.exports = errorMiddleware;