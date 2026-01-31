const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Try MongoDB Atlas first
        const conn = await mongoose.connect(process.env.MONGO_ATLAS_URI);
        console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log(`⚠️ MongoDB Atlas unavailable, trying local...`);
        try {
            // Fallback to local MongoDB
            const conn = await mongoose.connect(process.env.MONGO_URI);
            console.log(`✅ Local MongoDB Connected: ${conn.connection.host}`);
        } catch (localError) {
            console.error(`❌ Both connections failed:`);
            console.error(`Atlas: ${error.message}`);
            console.error(`Local: ${localError.message}`);
            process.exit(1);
        }
    }
};

module.exports = connectDB;