require('dotenv').config();

console.log('🔍 Debugging application startup...');

// Test environment variables
console.log('\n📋 Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV || 'Not set');
console.log('PORT:', process.env.PORT || 'Not set');
console.log('MONGO_URI:', process.env.MONGO_URI ? '✅ Set' : '❌ Not set');
console.log('DB_NAME:', process.env.DB_NAME || 'Not set');
console.log('ACCESS_SECRET:', process.env.ACCESS_SECRET ? '✅ Set' : '❌ Not set');
console.log('REFRESH_SECRET:', process.env.REFRESH_SECRET ? '✅ Set' : '❌ Not set');

// Test MongoDB connection
console.log('\n🔌 Testing MongoDB Connection...');
const mongoose = require('mongoose');

async function testMongoDB() {
    try {
        await mongoose.connect(process.env.MONGO_URI, {
            dbName: process.env.DB_NAME,
        });
        console.log('✅ MongoDB connection successful');
        
        // Test basic operations
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📁 Available collections:', collections.length);
        
        mongoose.connection.close();
        return true;
    } catch (err) {
        console.error('❌ MongoDB connection failed:', err.message);
        return false;
    }
}

async function testBasicImports() {
    console.log('\n📦 Testing module imports...');
    try {
        require('./src/config/cloudinary.config');
        console.log('✅ Cloudinary config loaded');
        
        require('./src/config/cors');
        console.log('✅ CORS config loaded');
        
        require('./src/utils/initialSetup');
        console.log('✅ Initial setup loaded');
        
        return true;
    } catch (err) {
        console.error('❌ Module import failed:', err.message);
        return false;
    }
}

async function runDiagnostics() {
    console.log('🚀 Starting diagnostics...\n');
    
    const importTest = await testBasicImports();
    const mongoTest = await testMongoDB();
    
    console.log('\n📊 Diagnostic Results:');
    console.log('Module imports:', importTest ? '✅ PASS' : '❌ FAIL');
    console.log('MongoDB connection:', mongoTest ? '✅ PASS' : '❌ FAIL');
    
    if (importTest && mongoTest) {
        console.log('\n🎉 All tests passed! You can try running the main application.');
    } else {
        console.log('\n⚠️ Some tests failed. Please fix the issues above.');
    }
    
    process.exit(importTest && mongoTest ? 0 : 1);
}

runDiagnostics().catch(console.error);