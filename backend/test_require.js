try {
    console.log('Testing require skillRoutes...');
    const skillRoutes = require('./src/routes/skillRoutes');
    console.log('Success!');
} catch (err) {
    console.error('Error:', err);
}
