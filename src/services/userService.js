
const { comparePassword, encryptPassword } = require("../utils/passwordEncryption");
const logger = require("../config/logger");
const BaseRepository = require("./baseRepoService")
const User = require("../models/userModel");
const ResetToken = require("../models/resetTokenModel");
const { translateError } = require("../utils/translateError");

/** User Service Class - Manage every User related operation */
class UserService extends BaseRepository {

    constructor() {
        super(User)
    }

    static async findByIdExcludingPassword(id) {
        try {

            const user = await User.findById(id).select('-password');
            if (user) {
                return [true, user, "User found", { status: 200 }];
            }
            return [false, null, "User not found.", { status: 404 }];
        } catch (error) {
            return translateError(error, "finding User by id.")
        }
    }

    static async login(email, password) {
        try {
            const user = await User.findOne({ email }).lean();  //Use the lean method to convert response to an object, so we dont return back the mongoose related info (cluttered data)

            if (user && await comparePassword(password, user.password)) {
                const { password, ...userWithoutPassword } = user;  //Destructure password from user and spread the remaining properties of user into new variable (object) called userWithoutPassword

                return [true, userWithoutPassword, "User Login Successful", { status: 200 }];
            }
            return [false, null, "Incorrect Email/Password", { status: 400 }];

        } catch (error) {

            const errResponse = translateError(error, "authenticating user.");
            return errResponse;

        }
    }

    /** User Service - Update Password */
    static async updatePassword(id, password) {
        try {
            const hashedPassword = await encryptPassword(password);
            const updatedUser = await User.findByIdAndUpdate(id, { password: hashedPassword }, { new: true }).select('-password');
            if (updatedUser) {
                return [true, updatedUser, `User Password updated successfully.`, { status: 200 }];
            }
            return [true, null, "Failed to update Users password", { status: 404 }];

        } catch (error) {
            const errResponse = translateError(error, "updating users password.");
            return errResponse;
        }
    }

    /** Reset Users password */
    static async resetPassword(userId, password, tokenId) {
        try {
            const hashedPassword = await encryptPassword(password);
            const updatedUser = await User.findByIdAndUpdate(userId, { password: hashedPassword }, { new: true }).select('-password');
            if (updatedUser) {
                await ResetToken.findByIdAndDelete(tokenId);
                return [true, updatedUser, `User Password reset successfully.`, { status: 200 }];
            }
            return [true, null, "Failed to reset Users password", { status: 404 }];

        } catch (error) {
            logger.error("Reset pwd error ", error);
            const errResponse = translateError(error, "resetting users password.");
            return errResponse;
        }

    }

    /** User Service - Update profile - for updating user profile - handle cases of profile picture present or not  */
    static async updateProfile(req ){
        try {
            
        } catch (error) {
            let result = translateError(error, "updating Users profile details.");
            logger.error("Update Profile method (User Service)", result);
            return result;
        }
    }
}

module.exports = UserService;