const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: process.env.SMTP_PORT || 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER, // generated ethereal user
        pass: process.env.SMTP_PASS, // generated ethereal password
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
            console.log('---------------------------------------------------');
            console.log(`[MOCK EMAIL] To: ${to}`);
            console.log(`[MOCK EMAIL] Subject: ${subject}`);
            console.log(`[MOCK EMAIL] Content: ${html}`);
            console.log('---------------------------------------------------');
            return { accepted: [to], messageId: 'mock-email-id' };
        }

        const info = await transporter.sendMail({
            from: process.env.MAIL_FROM || '"Nova Recruitment" <no-reply@nova.com>', // sender address
            to: to, // list of receivers
            subject: subject, // Subject line
            html: html, // html body
        });

        console.log("Message sent: %s", info.messageId);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        // Don't throw error to prevent blocking the main flow, just log it
        return null;
    }
};

module.exports = sendEmail;
