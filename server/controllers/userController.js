const User = require('../models/User');

// @desc    Get employees
// @route   GET /api/users
// @access  Private
const getEmployees = async (req, res) => {
    try {
        let users;
        
        if (req.user.role === 'admin') {
            // Admin sees all employees
            users = await User.find({ 
                role: 'employee'
            }).select('-password');
        } else {
            // Employee sees other employees in same department
            users = await User.find({ 
                role: 'employee',
                department: req.user.department,
                _id: { $ne: req.user.id } // Exclude self
            }).select('-password');
        }
        
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update employee
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateEmployee = async (req, res) => {
    try {
        const { name, email, department, designation, workLocation } = req.body;
        
        const employee = await User.findByIdAndUpdate(
            req.params.id,
            { name, email, department, designation, workLocation },
            { new: true }
        ).select('-password');

        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        res.json(employee);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete employee
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteEmployee = async (req, res) => {
    try {
        const employee = await User.findById(req.params.id);
        
        if (!employee) {
            return res.status(404).json({ message: 'Employee not found' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'Employee deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getEmployees, updateEmployee, deleteEmployee };