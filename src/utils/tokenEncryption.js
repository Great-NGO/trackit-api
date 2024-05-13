const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const { JWT_SECRET_KEY } = require("./envSecrets");

// Generate JWT for Admin
const generateAccessTokenForAdmin = (admin_id, isAdmin=true, role="admin") => {
    return jwt.sign({ id:admin_id, isAdmin, role}, JWT_SECRET_KEY, { expiresIn: '3h' })
}

const generateAccessToken = (user_id, isAdmin=false, role="user") => {
    return jwt.sign({id:user_id, isAdmin, role}, JWT_SECRET_KEY, {expiresIn: '3h'})
}

const hashResetToken = (token) => {
    return bcrypt.hashSync(token, 10)
}

const generateResetToken = () => {
    // create buffer and convert to hex format
    const token = crypto.randomBytes(32).toString('hex');
    // Set Expire time for 30 Minutes  //format - milsec*sec*min*hr e.g. 1000ms * 60sec * 30min
    const expiresIn = Date.now() + 1000 * 60 * 30;
    const hashedToken = hashResetToken(token);     //Hash the token using hash reset token method
    return { token, expiresIn, hashedToken }
}

const generateResetJWT = (id, uuid, univ_id, role) => {
    // Generate token link valid for 30 minutes
    return jwt.sign({ id, uuid, role, univ_id }, JWT_SECRET_KEY, { expiresIn: '30m' })
}

/** VerifyResetJWT accepts Reset JWT as a param and checks its validity - if expired or invalid */
const verifyResetJWT = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        return [true, decoded, "Reset password link is valid."]
    } catch (error) {
        if (error.name === "TokenExpiredError") {
            return [false, null, "Reset password link has expired."];
        } else {
            return [false, null, "Reset password link is invalid."]
        }
    }
}

const verifyResetToken = async (token, hashedResetToken) => {
    // console.log(await bcrypt.compare(token, hashedResetToken))
    return await bcrypt.compare(token, hashedResetToken)
}

module.exports = {

    generateAccessTokenForAdmin,
    generateAccessToken,
    generateResetToken,
    generateResetJWT,
    verifyResetJWT,
    hashResetToken,
    verifyResetToken
}