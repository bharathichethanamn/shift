const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Try local MongoDB first
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`❌ Local MongoDB Connection Error: ${error.message}`);
        console.log('Make sure MongoDB is installed and running locally');
        process.exit(1);
    }
};

module.exports = connectDB;