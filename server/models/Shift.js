const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    type: { 
        type: String, 
        enum: ['Morning', 'Afternoon', 'Night', 'Custom'], 
        required: true 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);