console.log('--- System Diagnostic ---');
console.log('🌍 process.cwd():', process.cwd());
console.log('📂 __dirname:', __dirname);
console.log('🔗 NODE_PATH:', process.env.NODE_PATH || '(not set)');
console.log('📦 node_modules path:', require.resolve('body-parser'));
console.log('--- Diagnostic End ---');
