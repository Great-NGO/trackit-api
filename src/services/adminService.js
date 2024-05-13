
const { comparePassword, encryptPassword } = require("../utils/passwordEncryption");
const logger = require("../config/logger");
const BaseRepository = require("./baseRepoService")
const Admin = require("../models/adminModel");
const ResetToken = require("../models/resetTokenModel");
const { generateDefaultPassword } = require("../utils/generateRandom");
const User = require("../models/userModel");
const ResetTokenService = require("./authService");
const { sendResetPwdMail } = require("../utils/sendMail");
const mongoose = require("mongoose");

/** Admin Service Class - Manage every Admin related operation */
class AdminService extends BaseRepository {

    constructor() {
        super(Admin)
    }

    static async findByIdExcludingPassword(id) {
        try {

            const Admin = await Admin.findById(id).select('-password');
            if (Admin) {
                return [true, Admin, "Admin found", { status: 200 }];
            }
            return [false, null, "Admin not found.", { status: 404 }];
        } catch (error) {
            return translateError(error, "finding Admin by id.")
        }
    }

    static async login(email, password) {
        try {
            const Admin = await Admin.findOne({ email }).lean();  //Use the lean method to convert response to an object, so we dont return back the mongoose related info (cluttered data)

            if (Admin && await comparePassword(password, Admin.password)) {
                const { password, ...AdminWithoutPassword } = Admin;  //Destructure password from Admin and spread the remaining properties of Admin into new variable (object) called AdminWithoutPassword

                return [true, AdminWithoutPassword, "Admin Login Successful", { status: 200 }];
            }
            return [false, null, "Incorrect Email/Password", { status: 400 }];

        } catch (error) {
            const errResponse = translateError(error, "authenticating Admin.");
            return errResponse;
        }
    }

    /** Admin Service - Register New Admin */
    static async register({ firstName, lastName, email, password, phoneNumber }) {

        try {
            const countAdmin = await Admin.countDocuments();

            if (countAdmin > 0) {
                return [false, null, "Admin already registered", { status: 400 }];
            }

            let newAdmin = {
                firstName,
                lastName,
                email,
                password: await encryptPassword(password),
                phoneNumber
            }

            const createdData = await Admin.create(newAdmin);
            if (createdData) {
                return [true, createdData, 'Admin registered successfully', { status: 201 }];
            }

            return [false, null, "Failed to register new admin", { status: 400 }];

        } catch (error) {
            const errResponse = translateError(error, "registering new Admin.");
            return errResponse;
        }

    }
    /** Admin Service - Add/Register New User/Staff */
    static async addUser({ firstName, lastName, email, phoneNumber, gender, dob }) {

        const session = await mongoose.startSession();
        session.startTransaction()

        try {

            let generatedPassword = generateDefaultPassword()
            let hashedPassword = await encryptPassword(generatedPassword);

            let newUser = {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phoneNumber,
                gender,
                dob
            }

            const createdData = await User.create(newUser, { session });

            // Send Email link to them (The user added to the system and provide them a link to reset their password)
            let [resetTokenSuccess, resetTokenData] = await new ResetTokenService.create(createdData._id, "Admin");
            if (!resetTokenSuccess) {
            // End session and abort transaction - undoing every db commit/write
                await session.abortTransaction();
                session.endSession();
                return [false, null, "Failed to send reset password link to new user", { status: 400 }];
            }


            const [mailSuccess, mailMessage] = await sendResetPwdMail(email, firstName, resetTokenData?.token, "User");
            if (!mailSuccess) {
            // End session and abort transaction - undoing every db commit/write
                await session.abortTransaction();
                session.endSession();
                return [false, null, mailMessage, { status: 400 }];
            }

            // End session and abort transaction - undoing every db commit/write
            await session.commitTransaction();
            session.endSession();

            return [true, createdData, 'User registered successfully, Reset password mail has been sent to new user.', { status: 200 }];


        } catch (error) {
            // End session and abort transaction - undoing every db commit/write
            await session.abortTransaction();
            session.endSession();

            const errResponse = translateError(error, "adding new user to system.");
            return errResponse;
        }

    }

    /** Admin Service - Update Password */
    static async updatePassword(id, password) {
        try {
            const hashedPassword = await encryptPassword(password);
            const updatedAdmin = await Admin.findByIdAndUpdate(id, { password: hashedPassword }, { new: true }).select('-password');
            if (updatedAdmin) {
                return [true, updatedAdmin, `Admin Password updated successfully.`, { status: 200 }];
            }
            return [true, null, "Failed to update Admins password", { status: 404 }];

        } catch (error) {
            const errResponse = translateError(error, "updating Admins password.");
            return errResponse;
        }
    }

    /** Reset Admins password */
    static async resetPassword(adminId, password, tokenId) {
        try {
            const hashedPassword = await encryptPassword(password);
            const updatedAdmin = await Admin.findByIdAndUpdate(adminId, { password: hashedPassword }, { new: true }).select('-password');
            if (updatedAdmin) {
                await ResetToken.findByIdAndDelete(tokenId);
                return [true, updatedAdmin, `Admin Password reset successfully.`, { status: 200 }];
            }
            return [true, null, "Failed to reset Admins password", { status: 404 }];

        } catch (error) {
            const errResponse = translateError(error, "resetting Admins password.");
            return errResponse;
        }

    }

    /** Admin Service - Update profile - for updating Admin profile - handle cases of profile picture present or not  */
    static async updateProfile(req) {
        try {

        } catch (error) {
            let result = translateError(error, "updating Admins profile details.");
            logger.error("Update Profile method (Admin Service)", result);
            return result;
        }
    }
}

module.exports = AdminService;