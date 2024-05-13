const { validationResult } = require("express-validator")

const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if(errors.isEmpty()){
        return next();
    }
    const extractedErrors = [];
    errors.array().map((err) => extractedErrors.push(err.msg));

    return res.status(400).json({
        success: false,
        error: extractedErrors[0],
        errors: extractedErrors,
        status: 400
    })
}

module.exports = { 
    validateRequest
};