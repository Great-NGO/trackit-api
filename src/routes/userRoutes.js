require('dotenv').config();
const express = require('express');
const { getUser, userLogin, getUserProfile, forgotPassword, getReports, getUserReports, getUserNotifications, getNotification, deleteAllNotifications, submitReport, logout } = require('../controllers/userController');
const { requireSignin, isAdmin } = require('../middleware/authMiddleware');
const { validateRequest } = require('../middleware/validationMiddleware');
const { loginValidator, forgotPasswordValidator, resetPasswordValidator, updatePasswordValidator } = require('../validators/authRelatedValidations');
const { resetPassword, updatePassword } = require('../controllers/userController');
const asyncHandler = require('../middleware/asyncHandler');
const { newIssueValidator } = require('../validators/issueValidations');

const router = express.Router();

router.post('/login', loginValidator, validateRequest, asyncHandler(userLogin));

router.post('/logout', asyncHandler(logout));

router.get('/logout', asyncHandler(logout));

// To get a users detail
router.get('/user/:id', requireSignin, asyncHandler(getUser));

// To get a users profile
router.get('/profile', requireSignin, asyncHandler(getUserProfile) )

// Forgot-password
router.post("/forgot-password", forgotPasswordValidator, validateRequest, asyncHandler(forgotPassword) );

router.put("/reset-password", resetPasswordValidator, validateRequest, asyncHandler(resetPassword));

router.put('/edit-password', requireSignin, updatePasswordValidator, validateRequest, asyncHandler(updatePassword));

// Submit new issue report
router.post('/submit-issue', requireSignin, newIssueValidator, validateRequest, asyncHandler(submitReport));

// Get all the reports submitted - can be filtered
router.get('/issue-reports', requireSignin, asyncHandler(getReports));

// Get all the reports submitted by a user - can be filtered
router.get('/personal-reports', requireSignin, asyncHandler(getUserReports));

// Get a users notifications - can be filtered
router.get('/notifications', requireSignin, asyncHandler(getUserNotifications));

// Get Notification by ID
router.get('/notification/:id', requireSignin, asyncHandler(getNotification));

// Delete Notification by ID
// router.post('/notification/delete', requireSignin, deleteNotificationValidator, validateRequest, asyncHandler(deleteNotification));

// Delete all Notifications
router.delete('/notifications/delete', requireSignin, asyncHandler(deleteAllNotifications));

module.exports = router;