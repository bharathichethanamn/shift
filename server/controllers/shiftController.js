const Shift = require('../models/Shift');

// @desc    Get all shifts
// @route   GET /api/shifts
const getShifts = async (req, res) => {
    try {
        let shifts;

        if (req.user.role === 'admin') {
            // ADMIN VIEW: Only show shifts created by THIS specific manager
            shifts = await Shift.find({ createdBy: req.user.id })
                .populate('userId', 'name email');
        } else {
            // EMPLOYEE VIEW: Only show shifts assigned to THIS employee
            shifts = await Shift.find({ userId: req.user.id })
                .populate('userId', 'name email');
        }

        res.json(shifts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all shifts for swapping (employees can see all shifts)
// @route   GET /api/shifts/all
const getAllShifts = async (req, res) => {
    try {
        // Return ALL shifts with user details for swap functionality
        const shifts = await Shift.find({})
            .populate('userId', 'name email')
            .sort({ startTime: 1 });

        res.json(shifts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new shift
// @route   POST /api/shifts
const createShift = async (req, res) => {
    const { userId, startTime, endTime, type } = req.body;

    try {
        // 1. Basic Validation
        if (new Date(startTime) >= new Date(endTime)) {
            return res.status(400).json({ message: "End time must be after start time" });
        }

        // 2. Check for Overlaps (The Smart Part)
        const conflict = await Shift.findOne({
            userId,
            $or: [
                // New shift starts inside an existing shift
                { startTime: { $lt: endTime, $gte: startTime } },
                // New shift ends inside an existing shift
                { endTime: { $gt: startTime, $lte: endTime } },
                // New shift completely covers an existing shift
                { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
            ]
        });

        if (conflict) {
            return res.status(400).json({ message: "This employee already has a shift during this time!" });
        }

        // 3. Create Shift
        const shift = await Shift.create({
            userId,
            startTime,
            endTime,
            type,
            createdBy: req.user.id
        });

        // Return the shift with user details populated
        const populatedShift = await Shift.findById(shift._id).populate('userId', 'name');
        res.status(201).json(populatedShift);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getShifts, getAllShifts, createShift };