const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getUsers } = require('../controllers/authController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// @route   POST /api/auth/register
// @desc    Register a new Manager/Admin (Public - No Token Needed)
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Login user & get token
router.post('/login', loginUser);

// @route   POST /api/auth/create-employee
// @desc    Manager creates an Employee (Protected - Saves Manager's ID)
router.post('/create-employee', protect, adminOnly, registerUser);

// @route   GET /api/auth/users
// @desc    Get all users created by the logged-in Manager (For Dropdowns)
router.get('/users', protect, getUsers);

module.exports = router;