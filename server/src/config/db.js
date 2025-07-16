const mongoose = require('mongoose');

// Database Connection Handler
// Handles MongoDB connection with proper error handling and logging

const connectDB = async () => {
  try {
    // Determine database URI based on environment
    const dbURI = process.env.NODE_ENV === 'test' 
      ? process.env.MONGODB_TEST_URI 
      : process.env.MONGODB_URI;

    console.log('🔗 Connecting to MongoDB...');
    console.log('🔗 Database URI:', dbURI);

    const conn = await mongoose.connect(dbURI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database Name: ${conn.connection.name}`);

    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('🛑 Shutting down gracefully...');
      await mongoose.connection.close();
      console.log('🔌 MongoDB connection closed');
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    process.exit(1);
  }
};

/**
 * Close database connection
 * Used primarily in testing
 */
const closeDB = async () => {
  try {
    await mongoose.connection.close();
    console.log('🔌 Database connection closed');
  } catch (error) {
    console.error('❌ Error closing database connection:', error);
  }
};

/**
 * Clear database
 * Used primarily in testing
 */
const clearDB = async () => {
  try {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    console.log('🧹 Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
  }
};

module.exports = {
  connectDB,
  closeDB,
  clearDB
};