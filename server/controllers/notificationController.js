const Notification = require('../models/Notification');

// @desc    Get notifications for user
// @route   GET /api/notifications
// @access  Private
const getNotifications = async (req, res) => {
    try {
        let notifications;
        
        if (req.user.role === 'admin') {
            // Admin gets notifications for all their employees
            const User = require('../models/User');
            const myEmployees = await User.find({ createdBy: req.user.id }).select('_id');
            const employeeIds = myEmployees.map(emp => emp._id);
            employeeIds.push(req.user.id); // Include admin's own notifications
            
            notifications = await Notification.find({
                userId: { $in: employeeIds }
            }).populate('userId', 'name email').sort({ createdAt: -1 }).limit(50);
        } else {
            // Employee gets only their notifications
            notifications = await Notification.find({ userId: req.user.id })
                .populate('userId', 'name email')
                .sort({ createdAt: -1 })
                .limit(20);
        }
        
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findByIdAndUpdate(
            req.params.id,
            { read: true },
            { new: true }
        );
        
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        
        res.json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create notification (Admin only)
// @route   POST /api/notifications
// @access  Private/Admin
const createNotification = async (req, res) => {
    try {
        const { userId, message } = req.body;
        
        const notification = await Notification.create({
            userId,
            message
        });
        
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    createNotification
};