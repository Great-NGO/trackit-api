require('dotenv').config();
const bcrypt = require("bcryptjs");


/* Generate Password Salt and hash */
const encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(13);
    return await bcrypt.hash(password, salt);
}

/* Compare Password */
const comparePassword = async(password, hashedPassword) => {
    return await bcrypt.compare(password, hashedPassword)
  }

module.exports = {
    encryptPassword,
    comparePassword
}
