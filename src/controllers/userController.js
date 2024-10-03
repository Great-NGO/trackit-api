require('dotenv').config();

const { query } = require('express');
const { clearCookies } = require('../middleware/authMiddleware');

const ResetTokenService = require('../services/authService');
const IssueService = require('../services/issueService');
const NotificationService = require('../services/notificationService');
const UserService = require('../services/userService');
const log = require('../utils/logger');
const { responseHandler } = require('../utils/responseHandler');
const { sendResetPwdMail } = require('../utils/sendMail');
const { generateAccessTokenForAdmin, generateAccessToken } = require('../utils/tokenEncryption');


const getUser = async (req, res) => {
    const { id } = req.params;

    let [success, data, message, metadata] = await UserService.findByIdExcludingPassword(id);
    if (success) {
        return responseHandler(res, "User's Details returned", metadata?.status || 200, true, { admin: data });
    }
    return responseHandler(res, message, metadata?.status || 400);
}

const getUserProfile = async (req, res) => {
    const { id } = req.user;

    let [success, data, message, metadata] = await UserService.findByIdExcludingPassword(id);
    if (success) {
        return responseHandler(res, "User's Details returned", metadata?.status || 200, true, { admin: data });
    }
    return responseHandler(res, message, metadata?.status || 400);
}

const userLogin = async (req, res) => {

    const { email, password } = req.body;

    let [success, data, message, metadata] = await UserService.login(email, password);

    if (success) {
        // Clear every cookie first, before sending new cookie back
        clearCookies(req, res);

        const { _id } = data;
        const token = generateAccessToken(_id);
        // Send cookie to frontend
        res.cookie('authToken', token, {
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24,    //24hours
            httpOnly: true
        })
        // Return JSON response
        return responseHandler(res, "User Login Successful.", metadata?.status || 200, true, { token, user: data });
    }
    return responseHandler(res, message, metadata?.status || 400);

}

const logout = async (req, res) => {
    res.clearCookie('authToken');
    res.clearCookie('adminAuthToken');
    return responseHandler(res, "Logout Successful", 200, true)
}

const updatePassword = async (req, res) => {
    const { id } = req.user;
    const { confirmPassword } = req.body;

    let [success, data, message, metadata] = await UserService.updatePassword(id, confirmPassword);
    if (success) {
        return responseHandler(res, message, metadata?.status || 200, true, { user: data })
    }
    return responseHandler(res, message, metadata?.status || 400)

}

const forgotPassword = async (req, res) => {

    // To reset password - must enter email address
    const { email } = req.body;

    // Confirm User Account with Email
    let [success, data, message, metadata] = await new UserService().getOne({ email });
    if (!success) {
        return responseHandler(res, message, metadata?.status || 400)
    }

    const user = data;     //Clone user data into variable user which is to be used later
    const { _id, firstName } = user;
    // Create new token (reset password link) to send to user
    [success, data, message, metadata] = await new ResetTokenService.create(_id, "User")
    const sendMail = await sendResetPwdMail(email, firstName, data.token, "User")    //Send Email to User
    // const sendMail = [true];  //For testing so that the api works (true to work, false to fail)
    if (!sendMail[0]) {
        return responseHandler(res, "Something went wrong in sending reset password link to users e2mail.", 500)
    }
    return responseHandler(res, "A reset password link has been sent to your email. This link expires in 30 minutes.", 200, true, { data })

}

const resetPassword = async (req, res) => {

    const { token, newPassword } = req.body;

    // Verify token details
    let [success, data, message, metadata] = await ResetTokenService.verifyUserToken(token)
    if (!success) {
        return responseHandler(res, message, metadata?.status || 400);
    }

    // Proceed with password reset, get the user id and the token id which would be used to reset the users password and delete token after reset is complete using the token id.
    const { userId, tokenId } = data;
    [success, data, message, metadata] = await UserService.resetPassword(userId, newPassword, tokenId);
    if (success) {
        return responseHandler(res, message, metadata?.status || 200, true, { user: data })
    }
    return responseHandler(res, message, metadata?.status || 400);

}

// To submit an issue report
const submitReport = async (req, res) => {

    const { id } = req.user;

    const { description, customer, sbu, solution, module, severity, dueDate } = req.body;
    let newReport = {
        description,
        customer,
        sbu,
        solution,
        module,
        severity,
        dueDate,
        reporterId: id
        // attachments
    };

    let [success, data, message, metadata] = await IssueService.submitNewReport(newReport);

    if (success) {
        // Return as JSON the response from IssueService submit new report method
        return responseHandler(res, message, metadata?.status || 200, true, { issue: data, report: data });
    }
    return responseHandler(res, message, metadata?.status || 400);

}

// To get all reports/issues submitted on the system
const getReports = async (req, res) => {

    // const { id } = req.user;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    let paginationOptions = { page, limit };
    const filter = {} // Define an empty filter object

    // Add filtering based on query parameters
    if (req.query.customer) {
        filter.customer = req.query.customer;
    }
    if (req.query.sbu) {
        filter.sbu = req.query.sbu;
    }
    if(req.query.severity){
        filter.severity = req.query.severity;
    }

    let [success, data, message, metadata] = await new IssueService().findAllByConditionPaginated(filter, paginationOptions);
    if (success) {
        let { data: returnedData, currentPage, totalCount, totalPages } = data;

        return responseHandler(res, message, metadata?.status || 200, true, { reports: returnedData, metadata: { totalCount, totalPages, currentPage } });
    }
    return responseHandler(res, message, metadata?.status || 400);
}

// To get all reports a particular logged in user has submitted
const getUserReports = async (req, res) => {

    const { id } = req.user;

    // Find all submitted issues by user
    let [success, data, message, metadata] = await new IssueService().findAllByConditionPaginated({ reporter: id });
    if (success) {
        return responseHandler(res, message, metadata?.status || 200, true, { reports: data });
    }
    return responseHandler(res, message, metadata?.status || 400);
}

const getNotification = async (req, res) => {

    const { id } = req.params;

    let [success, data, message, metadata] = await new NotificationService().getById(id);
    if (success) {
        return responseHandler(res, message, metadata?.status || 200, true, { notification: data });
    }
    return responseHandler(res, message, metadata?.status || 400);
}

// To get all a user notifications
const getUserNotifications = async (req, res) => {

    const { id } = req.user;

    let [success, data, message, metadata] = await new NotificationService().findAllByConditionPaginated({ recipient: id });
    if (success) {
        return responseHandler(res, message, metadata?.status || 200, true, { notifications: data });
    }
    return responseHandler(res, message, metadata?.status || 400);
}

const deleteNotification = async () => {

}

const deleteAllNotifications = async () => {

}



module.exports = {
    getUser,
    getUserProfile,
    userLogin,
    logout,
    updatePassword,
    forgotPassword,
    resetPassword,
    submitReport,
    getReports,
    getUserReports,
    getNotification,
    getUserNotifications,
    deleteNotification,
    deleteAllNotifications

}
