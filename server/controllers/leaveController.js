const LeaveRequest = require('../models/LeaveRequest');
const Notification = require('../models/Notification');

// @desc    Create leave request
// @route   POST /api/leaves
// @access  Private
const createLeaveRequest = async (req, res) => {
    try {
        const { startDate, endDate, reason } = req.body;
        
        const leave = await LeaveRequest.create({
            userId: req.user.id,
            startDate,
            endDate,
            reason
        });

        // Create notification for admin (find any admin)
        const User = require('../models/User');
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            await Notification.create({
                userId: admin._id,
                message: `${req.user.name} has requested leave from ${new Date(startDate).toLocaleDateString()} to ${new Date(endDate).toLocaleDateString()}`
            });
        }

        res.status(201).json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get leave requests
// @route   GET /api/leaves
// @access  Private
const getLeaveRequests = async (req, res) => {
    try {
        let leaves;
        
        if (req.user.role === 'admin') {
            // Admin sees all leave requests
            leaves = await LeaveRequest.find({})
                .populate('userId', 'name email')
                .sort({ createdAt: -1 });
        } else {
            // Employee sees only their own requests
            leaves = await LeaveRequest.find({ userId: req.user.id })
                .populate('userId', 'name email')
                .sort({ createdAt: -1 });
        }
        
        res.json(leaves);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update leave status
// @route   PUT /api/leaves/:id
// @access  Private/Admin
const updateLeaveStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        const leave = await LeaveRequest.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('userId', 'name email');

        if (!leave) {
            return res.status(404).json({ message: 'Leave request not found' });
        }

        // Create notification for employee
        await Notification.create({
            userId: leave.userId._id,
            message: `Your leave request has been ${status.toLowerCase()}`
        });

        res.json(leave);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createLeaveRequest,
    getLeaveRequests,
    updateLeaveStatus
};