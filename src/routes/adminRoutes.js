require('dotenv').config();
const express = require('express');
const { adminLogin, addAdmin, forgotPassword, resetPassword, editAdmin, updatePassword, getAdmin, deleteAdmin, getAdmins, getAllUsers, updateAdmin, adminLogout, getAdminDetails, addUser, adminForgotPassword, adminResetPassword, updateAdminPassword, adminGetUser, adminGetAllUsers, adminGetNotification, adminDeleteNotification, adminUpdateIssue, adminDeleteAllNotifications, getAllAdminNotifications, adminRegister } = require('../controllers/adminController');

const { requireSignin, isAdmin } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const { loginValidator, forgotPasswordValidator, resetPasswordValidator, updateAdminPasswordValidator } = require('../validators/authRelatedValidations');
const { adminSignupValidator, addStaffValidator, adminUpdateValidator } = require('../validators/adminValidator');

const router = express.Router();

router.post('/admin/signup', adminSignupValidator, validateRequest, asyncHandler(adminRegister) );

router.post('/admin/login', loginValidator, validateRequest, asyncHandler(adminLogin));

// Get logged in admins details
router.get('/admin', requireSignin, isAdmin, asyncHandler(getAdminDetails));

router.post('/admin/logout', asyncHandler(adminLogout));

router.get('/admin/logout', asyncHandler(adminLogout));

router.route('/admin/add-staffs').post(requireSignin, isAdmin, addStaffValidator, validateRequest, asyncHandler(addUser));

router.post("/admin/forgot-password", forgotPasswordValidator, validateRequest, asyncHandler(adminForgotPassword));

router.put("/admin/reset-password", resetPasswordValidator, validateRequest, asyncHandler(adminResetPassword));

router.put('/admin/edit-password', requireSignin, isAdmin, updateAdminPasswordValidator, validateRequest, asyncHandler(updateAdminPassword));

router.put('/admin/edit', requireSignin, isAdmin, adminUpdateValidator, validateRequest, asyncHandler(updateAdmin));

// To get a regular user
router.get('/admin/user/:id', requireSignin, isAdmin, asyncHandler(adminGetUser));

// Admin can get all the users details
router.get('/admin/users', requireSignin, isAdmin, asyncHandler(adminGetAllUsers))

// Get all issues - would use pagination and filtering for this to return all the issues according to search
// router.get('/admin/reports', requireSignin, isAdmin, asyncHandler(adminGetAllIssues));

// Get all notifications - would use pagination and filter to return notifications ( reports)
router.get('/admin/notifications', requireSignin, isAdmin, asyncHandler(getAllAdminNotifications));

// Update an issue (status)
// router.put('/admin/update-issue', requireSignin, isAdmin, updateIssueValidator, validateRequest, asyncHandler(adminUpdateIssue))

// Get Notification by ID
router.get('/notification/:id', requireSignin, isAdmin, asyncHandler(adminGetNotification));

// Delete Notification by ID
// router.post('/notification/delete', requireSignin, isAdmin, deleteNotificationValidator, validateRequest, asyncHandler(adminDeleteNotification));

// Delete all Notifications
router.delete('/notifications/delete', requireSignin, isAdmin, asyncHandler(adminDeleteAllNotifications));


module.exports = router;