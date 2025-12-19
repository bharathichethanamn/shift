const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { 
        type: String, 
        enum: ['admin', 'employee'], 
        default: 'employee' 
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
    department: { type: String, default: '' },
    designation: { type: String, default: '' },
    workLocation: { type: String, default: '' },
    availability: {
        monday: { available: { type: Boolean, default: true }, hours: { type: String, default: '9:00-17:00' } },
        tuesday: { available: { type: Boolean, default: true }, hours: { type: String, default: '9:00-17:00' } },
        wednesday: { available: { type: Boolean, default: true }, hours: { type: String, default: '9:00-17:00' } },
        thursday: { available: { type: Boolean, default: true }, hours: { type: String, default: '9:00-17:00' } },
        friday: { available: { type: Boolean, default: true }, hours: { type: String, default: '9:00-17:00' } },
        saturday: { available: { type: Boolean, default: false }, hours: { type: String, default: '9:00-17:00' } },
        sunday: { available: { type: Boolean, default: false }, hours: { type: String, default: '9:00-17:00' } }
    },
}, { timestamps: true });

// Encrypt password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Method to match password
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);