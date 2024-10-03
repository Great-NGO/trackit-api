
const { body, check } = require("express-validator");
const AdminService = require("../services/adminService");
const UserService = require("../services/userService");


const loginValidator = [
    check("email", "Email is required").isEmail().normalizeEmail(),
    check("password", "Password is required").trim().notEmpty(),
];

const forgotPasswordValidator = [
    check("email", "Email is required").trim().notEmpty().isEmail(),
];

const updatePasswordValidator = [
    check("currentPassword", "Please enter your current password").trim().notEmpty(),
    check("currentPassword").custom(async (value, { req }) => {

        const { user_id } = req.user;
        const user = await new UserService().getById(user_id);
        const isCorrectPassword = await comparePassword(value, user[1].password)
        if (!isCorrectPassword) {
            return Promise.reject()
        }

    }).withMessage("Current Password is incorrect"),
    check("newPassword", "New Password can not be empty").trim().notEmpty(),
    check("newPassword", "New Password must be atleast 8 characters").trim().isLength({ min: 8 }),
    check("newPassword").custom((value, { req }) => {
        const { currentPassword } = req.body;
        if (value === currentPassword) {
            return false        //New Password can not be the same as old password
        } else {
            return true
        }
    }).withMessage("New Password can not be the same as old password"),
    check("confirmPassword", "Please confirm your new password").trim().notEmpty(),
    check("confirmPassword").custom((value, { req }) => {
        const { newPassword } = req.body;

        if (value === newPassword) {
            return true
        } else {
            return false
        }
    }).withMessage("Passwords must match!")

]

const updateAdminPasswordValidator = [
    check("currentPassword", "Please enter your current password").trim().notEmpty(),
    check("currentPassword").custom(async (value, { req }) => {

        const { user_id } = req.user;
        const admin = await new AdminService().getById(user_id);
        const isCorrectPassword = await comparePassword(value, admin[1].password)
        console.log("IS correct password ", isCorrectPassword)
        if (!isCorrectPassword) {
            return Promise.reject()
        }

    }).withMessage("Current Password is incorrect"),
    check("newPassword", "New Password can not be empty").trim().notEmpty(),
    check("newPassword", "New Password must be atleast 8 characters").trim().isLength({ min: 8 }),
    check("newPassword").custom((value, { req }) => {
        const { currentPassword } = req.body;
        if (value === currentPassword) {
            return false        //New Password can not be the same as old password
        } else {
            return true
        }
    }).withMessage("New Password can not be the same as old password"),
    check("confirmPassword", "Please confirm your new password").trim().notEmpty(),
    check("confirmPassword").custom((value, { req }) => {
        const { newPassword } = req.body;

        if (value === newPassword) {
            return true
        } else {
            return false
        }
    }).withMessage("Passwords must match!")

]

const resetPasswordValidator = [

    body("token", "Token is required").trim().notEmpty(),
    // body("email", "Email is required").trim().notEmpty().isEmail(),
    check("newPassword", "New Password can not be empty").trim().notEmpty(),
    check("newPassword", "New Password must be atleast 8 characters").isLength({ min: 8 }),
    check("confirmPassword", "Please confirm your new password").trim().notEmpty(),
    check("confirmPassword").custom((value, { req }) => {
        const { newPassword } = req.body;
        if (value === newPassword) {
            return true
        } else {
            return false
        }
    }).withMessage("Passwords must match!")

]
module.exports = {
    loginValidator,
    forgotPasswordValidator,
    updatePasswordValidator,
    updateAdminPasswordValidator,
    resetPasswordValidator
}

