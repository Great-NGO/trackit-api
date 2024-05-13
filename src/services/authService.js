const logger = require("../config/logger");
const ResetToken = require("../models/resetTokenModel");
const { generateResetJWT, verifyResetJWT } = require("../utils/tokenEncryption");
const { translateError } = require("../utils/translateError");

/** Reset Service Class - Manage every ResetToken related operation for Users and Admins */
class ResetTokenService {
    constructor() {}

    /**
     * Create a reset token for the specified user ID.
     * @param {ObjectId} userId - The ID of the user for whom the reset token is being created.
     * @param {string} type - The type of the user (e.g., 'User' or 'Admin').
     * @returns {Promise<TServiceResponse<TResetToken>>} A promise resolving to a service response containing the created reset token.
     */
    static async create(userId, type="User") {
        try {
            // Generate a reset JWT token
            const token = generateResetJWT(userId);
            // Create a reset token document in the database
            let resetToken = await ResetToken.create({ userId, token, type });

            if (resetToken) {
                return [true, resetToken, "Reset Token created successfully. ", { status: 201 }]
            }
            return [false, null, "Failed to create reset token.", { status: 400 }];
        } catch (error) {
            // Handle errors
            let errResponse = translateError(error, `creating reset token link for ${type}`)
            logger.error("Error from Reset-token service create method", errResponse);
            return errResponse;
        }
    }

    /**
     * Verify the validity of a reset token.
     * @param {string} token - The reset token to verify.
     * @returns {Promise<[boolean, any | null, string, { status: number, metadata?: any}]>} A promise resolving to a tuple indicating the success of the verification and related data.
     */
    static async verifyUserToken(token = "") {
        try {
            // Define an aggregation pipeline to lookup the user associated with the token
            const pipeline = [
                {
                    '$match': {
                        'token': token
                    }
                }, {
                    '$lookup': {
                        'from': 'users',
                        'localField': 'userId',
                        'foreignField': '_id',
                        'as': 'user'
                    }
                }, {
                    '$unwind': {
                        'path': '$user'
                    }
                }, {
                    '$match': {
                        'user': {
                            '$ne': null
                        }
                    }
                }
            ]

            // Execute the aggregation pipeline
            const [userResetToken] = await ResetToken.aggregate(pipeline);

            // If no reset token is found for the user, return an error response
            if (!userResetToken) {
                return [false, null, 'Reset password link is invalid or has been used already.', { status: 400 }]
            }

            // Verify the JWT token
            const isUserTokenValid = verifyResetJWT(token);
            let [successVerification, data, verificationMessage] = isUserTokenValid;
            if (!successVerification) {
                // If the token is invalid, delete the reset token document from the database
                await ResetToken.deleteOne({ _id: userResetToken._id });
                return [false, null, verificationMessage, { status: 400 }]
            }

            // Prepare the response data
            const returnedData = {
                user: userResetToken.user,
                userId: userResetToken.user._id || data.id,
                token,
                tokenId: userResetToken._id
            }

            // Return a success response with the user data and token details
            return [true, returnedData, 'Reset password link is valid', { status: 200 }];
        } catch (error) {
            // Handle errors
            let errResponse = translateError(error, "verifying token.");
            logError("Verifying reset token (Reset token service)", errResponse);
            return errResponse;
        }
    }
    static async verifyAdminToken(token = "") {
        try {
            // Define an aggregation pipeline to lookup the user associated with the token
            const pipeline = [
                {
                    '$match': {
                        'token': token
                    }
                }, {
                    '$lookup': {
                        'from': 'admins',
                        'localField': 'userId',
                        'foreignField': '_id',
                        'as': 'admin'
                    }
                }, {
                    '$unwind': {
                        'path': '$admin'
                    }
                }, {
                    '$match': {
                        'admin': {
                            '$ne': null
                        }
                    }
                }
            ]

            // Execute the aggregation pipeline
            const [adminResetToken] = await ResetToken.aggregate(pipeline);

            // If no reset token is found for the admin, return an error response
            if (!adminResetToken) {
                return [false, null, 'Reset password link is invalid or has been used already.', { status: 400 }]
            }

            // Verify the JWT token
            const isAdminTokenValid = verifyResetJWT(token);
            let [successVerification, data, verificationMessage] = isAdminTokenValid;
            if (!successVerification) {
                // If the token is invalid, delete the reset token document from the database
                await ResetToken.deleteOne({ _id: adminResetToken._id });
                return [false, null, verificationMessage, { status: 400 }]
            }

            // Prepare the response data
            const returnedData = {
                admin: adminResetToken.admin,
                // user: adminResetToken.admin,
                // userId: adminResetToken.admin._id || data.id,
                adminId: adminResetToken.admin._id || data.id,
                token,
                tokenId: adminResetToken._id
            }

            // Return a success response with the user data and token details
            return [true, returnedData, 'Reset password link is valid', { status: 200 }];
        } catch (error) {
            // Handle errors
            let errResponse = translateError(error, "verifying token.");
            logger.error("Verifying admin reset token (Reset token service)", errResponse);
            return errResponse;
        }
    }
}

module.exports = ResetTokenService;
