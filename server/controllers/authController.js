const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Helper function to generate a Token
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;

    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        // Logic: If the person creating this user is logged in, save their ID
        // If it's a public registration (first admin), createdBy is null
        const createdBy = req.user ? req.user.id : null; 

        const user = await User.create({
            name,
            email,
            password,
            role: role || 'employee',
            createdBy // <--- Saving the link here
        });

        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user._id, user.role),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id, user.role),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get All Users (Scoped by Manager)
// @route   GET /api/users
const getUsers = async (req, res) => {
    try {
        let users;
        // If Admin, only show employees created by them
        if (req.user.role === 'admin') {
            users = await User.find({ 
                role: 'employee',
                createdBy: req.user.id 
            }).select('-password');
        } else {
            // Employees might want to see everyone (or just themselves)
            users = await User.find({ role: 'employee' }).select('-password');
        }
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { registerUser, loginUser, getUsers };