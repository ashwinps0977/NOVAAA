const OTP = require('../models/OTP');
const sendEmail = require('../utils/mailer');

// Send OTP to email
exports.sendOTP = async (req, res) => {
    try {
        const { recipient, type } = req.body;

        if (!recipient || !type) {
            return res.status(400).json({
                success: false,
                message: 'Recipient and type are required'
            });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Save to database (will overwrite existing for same recipient thanks to TTL or we can delete old ones)
        await OTP.deleteMany({ recipient, type });
        await OTP.create({ recipient, otp, type });

        if (type === 'email') {
            const subject = 'Your Verification Code - NOVA HR';
            const html = `
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px; max-width: 500px;">
          <h2 style="color: #10b981;">Verification Code</h2>
          <p>Hello,</p>
          <p>Your verification code for the job application is:</p>
          <div style="background: #f3f4f6; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; color: #1f2937; border-radius: 5px;">
            ${otp}
          </div>
          <p style="margin-top: 20px; color: #6b7280; font-size: 14px;"> This code will expire in 5 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
          <p style="font-size: 12px; color: #9ca3af;">NOVA Workforce Solutions</p>
        </div>
      `;
            await sendEmail(recipient, subject, html);
        } else {
            // Mocking mobile OTP for now as there's no SMS gateway setup
            console.log(`[MOCK SMS] OTP ${otp} sent to ${recipient}`);
        }

        res.status(200).json({
            success: true,
            message: `OTP sent to ${recipient}`
        });
    } catch (error) {
        console.error('Send OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to send OTP'
        });
    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {
        const { recipient, otp, type } = req.body;

        if (!recipient || !otp || !type) {
            return res.status(400).json({
                success: false,
                message: 'Recipient, OTP, and type are required'
            });
        }

        const otpRecord = await OTP.findOne({ recipient, otp, type });

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: 'Invalid or expired OTP'
            });
        }

        // Delete OTP after successful verification
        await OTP.deleteOne({ _id: otpRecord._id });

        res.status(200).json({
            success: true,
            message: 'OTP verified successfully'
        });
    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify OTP'
        });
    }
};
