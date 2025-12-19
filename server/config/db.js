const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Connect to MongoDB Atlas (primary)
        const atlasConn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅ MongoDB Atlas Connected: ${atlasConn.connection.host}`);
        
        // Create second connection for local MongoDB
        const localConn = mongoose.createConnection(process.env.MONGO_LOCAL_URI);
        
        localConn.on('connected', () => {
            console.log('✅ Local MongoDB Connected: 127.0.0.1:27017');
        });
        
        localConn.on('error', (err) => {
            console.log('❌ Local MongoDB not available:', err.message);
        });
        
    } catch (error) {
        console.error(`❌ MongoDB Atlas Connection Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;