require('dotenv').config();

const { clearCookies } = require('../middleware/authMiddleware');
const AdminService = require('../services/adminService');
const ResetTokenService = require('../services/authService');
const UserService = require('../services/userService');
const log = require('../utils/logger');
const { responseHandler } = require('../utils/responseHandler');
const { sendResetPwdMail } = require('../utils/sendMail');
const { generateAccessTokenForAdmin } = require('../utils/tokenEncryption');


const getAdminDetails = async (req, res) => {
    const { id } = req.user;

    let [success, data, message, metadata] = await AdminService.findByIdExcludingPassword(id);
    if (success) {
        return responseHandler(res, "Admin Details returned", metadata?.status || 200, true, { admin: data });
    }
    return responseHandler(res, message, metadata?.status || 400);
}

const adminRegister = async (req, res) => {

    const { firstName, lastName, email, password } = req.body;
    let newAdmin = { firstName, lastName, email, password };

    let [success, data, message, metadata] = await new AdminService.register(newAdmin);

    if (success) {
        // Return as JSON the response from adminservice register method
        return responseHandler(res, message, metadata?.status || 200, true, { token, admin: data });
    }
    return responseHandler(res, message, metadata?.status || 400);

}


const adminLogin = async (req, res) => {

    const { email, password } = req.body;

    let [success, data, message, metadata] = await AdminService.login(email, password);

    if (success) {
        // Clear every cookie first, before sending new cookie back
        clearCookies(req, res);

        const { _id } = data;
        const token = generateAccessTokenForAdmin(_id);
        // Send cookie to frontend
        res.cookie('adminAuthToken', token, {
            secure: process.env.NODE_ENV === "production",
            maxAge: 1000 * 60 * 60 * 24,    //24hours
            httpOnly: true
        })
        // Return JSON response
        return responseHandler(res, "Admin Login Successful.", metadata?.status || 200, true, { token, admin: data });
    }
    return responseHandler(res, message, metadata?.status || 400);

}

const adminLogout = async (req, res) => {
    res.clearCookie('authToken');
    res.clearCookie('adminAuthToken');
    return responseHandler(res, "Admin Logout Successful", 200, true)
}

const updateAdmin = async (req, res) => {

    const { id } = req.user;
    const { firstName, lastName } = req.body;

    let [success, data, message, metadata] = await new AdminService().update(id, { firstName, lastName });
    if (success) {
        return responseHandler(res, "Admins Details updated succesfully", metadata?.status || 200, true, { admin: data })
    }
    return responseHandler(res, message, metadata?.status || 400)

}

const updateAdminPassword = async (req, res) => {
    const { id } = req.user;
    const { confirmPassword } = req.body;

    let [success, data, message, metadata] = await AdminService.updatePassword(id, confirmPassword);
    if (success) {
        return responseHandler(res, message, metadata?.status || 200, true, { admin: data })
    }
    return responseHandler(res, message, metadata?.status || 400)

}

const adminForgotPassword = async (req, res) => {

    // To reset password - must enter email address
    const { email } = req.body;

    // Confirm Admin Account with Email
    let [success, data, message, metadata] = await new AdminService().getOne({ email });
    if (!success) {
        return responseHandler(res, message, metadata?.status || 400)
    }

    const admin = data;     //Clone admin data into variable admin which is to be used later
    const { _id, firstName } = admin;
    // Create new token (reset password link) to send to admin
    [success, data, message, metadata] = await new ResetTokenService.create(_id, "Admin")
    const sendMail = await sendResetPwdMail(email, firstName, data.token, "Admin")    //Send Email to Admin
    // const sendMail = [true];  //For testing so that the api works (true to work, false to fail)
    if (!sendMail[0]) {
        return responseHandler(res, "Something went wrong in sending reset password link to admins email.", 500)
    }
    return responseHandler(res, "A reset password link has been sent to your email. This link expires in 30 minutes.", 200, true, { data })

}

const adminResetPassword = async (req, res) => {

    const { token, newPassword } = req.body;
    // Verify token details
    let [success, data, message, metadata] = await ResetTokenService.verifyAdminToken(token)
    if (!success) {
        return responseHandler(res, message, metadata?.status || 400);
    }

    // Proceed with password reset, get the admin id and the token id which would be used to reset the admins password and delete token after reset is complete using the token id.
    const { adminId, tokenId } = data;
    [success, data, message, metadata] = await AdminService.resetPassword(adminId, newPassword, tokenId);
    if (success) {
        return responseHandler(res, message, metadata?.status || 200, true, { admin: data })
    }
    return responseHandler(res, message, metadata?.status || 400);

}


const addUser = async (req, res) => {

    const { firstName, lastName, email, phoneNumber, gender, dob } = req.body;
    let newUser = { firstName, lastName, email, phoneNumber, gender, dob };

    let [success, data, message, metadata] = await AdminService.addUser(newUser);
    
    if (success) {
        return responseHandler(res, "New Staff added successfully, Reset password mail sent to new staff.", metadata?.status || 200, true)
    }
    return responseHandler(res, message, metadata?.status || 400)
}

const adminGetUser = async (req, res) => {

    const { id } = req.params;

    let [success, data, message, metadata] = await new UserService().findByIdExcludingPassword(id);
    if (success) {
        return responseHandler(res, "User details returned successfully.", metadata?.status || 200, true, { user: data });
    }
    return responseHandler(res, message, metadata?.status || 400);
}

const adminGetAllUsers = async (req, res) => {

    let [success, data, message, metadata] = await new UserService().findAllByConditionPaginated();
    if (success) {
        return responseHandler(res, "Staffs  details returned successfully.", metadata?.status || 200, true, { users: data });
    }
    return responseHandler(res, message, metadata?.status || 400);
}


const getAllAdminNotifications = async (req, res) => {

    const { univ_id } = req.user;

    let [success, data, message, metadata] = await ProgramService.getAllPrograms(univ_id);
    if (success) {
        return responseHandler(res, message, metadata?.status || 200, true, { programs: data });
    }
    return responseHandler(res, message, metadata?.status || 400);
}

const adminUpdateIssue = async () => {

}

const adminGetNotification = async (req, res) => {

    const { univ_id } = req.user;

    let [success, data, message, metadata] = await ProgramService.getAllPrograms(univ_id);
    if (success) {
        return responseHandler(res, message, metadata?.status || 200, true, { programs: data });
    }
    return responseHandler(res, message, metadata?.status || 400);
}

const adminDeleteNotification = async () => {

}

const adminDeleteAllNotifications = async () => {

}

const addSession = async (req, res) => {
    const { session_year } = req.body;
    const { univ_id } = req.user;

    let sessionService = new SessionService(session_year, univ_id);
    let [success, data, message, metadata] = await sessionService.addSession();
    if (success) {
        return responseHandler(res, message, metadata?.status || 201, true, { session: data });
    }
    return responseHandler(res, message, metadata?.status || 400);
}

// For the Admin to update their session status (ongoing, paused, closed )
const updateSession = async (req, res) => {

    const { univ_id } = req.user;
    const { status, session_id } = req.body;     //Admin can update the status of a session

    let [success, data, message, metadata] = await SessionService.updateSessionByIdAndUnivId(session_id, univ_id, status);
    if (success) {
        return responseHandler(res, message, metadata?.status || 200, true, { session: data })
    }
    return responseHandler(res, message, metadata?.status || 400)
}

const deleteSession = async (req, res) => {
    const { session_id } = req.body;
    const { univ_id } = req.user;

    let [success, data, message, metadata] = await SessionService.deleteSession(session_id, univ_id);
    if (success) {
        return responseHandler(res, message, metadata?.status || 200, true);
    }
    return responseHandler(res, message, metadata?.status || 400);
}




module.exports = {
    getAdminDetails,
    adminRegister,
    adminLogin,
    adminLogout,
    updateAdmin,
    updateAdminPassword,
    adminForgotPassword,
    adminResetPassword,
    addUser,
    adminGetUser,
    adminGetAllUsers,

    adminUpdateIssue,

    adminGetNotification,
    getAllAdminNotifications,
    adminDeleteNotification,
    adminDeleteAllNotifications,


    addSession,
    updateSession,
    deleteSession,


}
