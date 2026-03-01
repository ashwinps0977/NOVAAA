try {
    console.log('Attempting to load server.js...');
    require('./src/server.js');
    console.log('Server loaded (this might not happen if it immediately starts listening)');
} catch (err) {
    console.error('--- FULL ERROR START ---');
    console.error('Name:', err.name);
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    console.error('Stack:', err.stack);
    if (err.requireStack) {
        console.error('Require Stack:', err.requireStack);
    }
    console.error('--- FULL ERROR END ---');
}
