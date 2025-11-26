// Test file để kiểm tra lỗi
console.log('Testing syntax...');

try {
  require('./src/index.js');
  console.log('✅ No syntax errors found!');
} catch (error) {
  console.error('❌ Error found:', error.message);
  console.error(error.stack);
}