const mongoose = require('mongoose');

const swapSchema = new mongoose.Schema({
    requestingUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    requestingShiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
    targetShiftId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shift', required: true },
    reason: { type: String },
    status: { 
        type: String, 
        enum: ['Pending Employee', 'Pending Manager', 'Approved', 'Rejected by Employee', 'Rejected by Manager'], 
        default: 'Pending Employee' 
    },
    employeeResponse: { type: String, enum: ['Pending', 'Accepted', 'Rejected'], default: 'Pending' },
    managerResponse: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' },
    employeeResponseDate: { type: Date },
    managerResponseDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('SwapRequest', swapSchema);