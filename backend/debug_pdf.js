const pdf = require('pdf-parse');
console.log('pdf type:', typeof pdf);
console.log('pdf keys:', Object.keys(pdf));
console.log('pdf value:', pdf);
if (pdf.default) {
    console.log('pdf.default type:', typeof pdf.default);
}
