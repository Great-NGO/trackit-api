require('dotenv').config();
const jwt = require("jsonwebtoken");
const responseHandler = require('../utils/responseHandler');
const { JWT_SECRET_KEY } = require('../utils/envSecrets');
const log = require('../utils/logger');

const requireSignin = async (req, res, next) => {
    const header = req.headers.authorization
    const token = header && header.split(" ")[1] || req.cookies&&req.cookies.authToken || req.cookies&&req.cookies.adminAuthToken;

    if (!token) {
        return responseHandler(res, "User Unauthorized!", 401);
    } else {
        try {

            const decoded = jwt.verify(token, JWT_SECRET_KEY);
  
            const { id, isAdmin, role } = decoded;
            req.user = { id, isAdmin, role };
            // log("req user ", req.user)
            return next();

        } catch (err) {
            logger.error('Error in decoding token', err);
            // log(err.name)

            if (err.name === "TokenExpiredError") {
                return responseHandler(res, "User Session has expired.", 401)

            } else {
                // return responseHandler(res, "Failed to validate user token", 400)
                return responseHandler(res, "UnAuthorized.", 400)
            }
        }
    }

}

const isAdmin = async(req, res, next) => {
    if(req.user.isAdmin !== true) {
        return responseHandler(res, "User UnAuthorized! ", 403)
    } else {
        return next()
    }
}

const isNotAdmin = async(req, res, next) => {
    if(req.user.isAdmin !== false) {
        return responseHandler(res, "UnAuthorized!", 403)
    } else {
        return next()
    }
}

const clearCookies = async (req, res) => {
    res.clearCookie('authToken');
    res.clearCookie('adminAuthToken');

}

module.exports = {
    requireSignin,
    isAdmin,
    isNotAdmin,
    clearCookies
}
