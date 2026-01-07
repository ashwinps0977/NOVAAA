const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Verify connection
transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Connection Error:', error);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

// Send interview email
exports.sendInterviewEmail = async (emailData) => {
  try {
    const mailOptions = {
      from: `"NOVA HR" <${process.env.SMTP_USER}>`,
      to: emailData.candidateEmail,
      subject: `Interview Invitation: ${emailData.jobTitle} at ${emailData.companyName}`,
      text: generateInterviewEmailText(emailData),
      html: generateInterviewEmailHTML(emailData)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Interview email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
};

// Send rejection email
exports.sendRejectionEmail = async (emailData) => {
  try {
    const mailOptions = {
      from: `"NOVA HR" <${process.env.SMTP_USER}>`,
      to: emailData.candidateEmail,
      subject: `Update on Your Application: ${emailData.jobTitle}`,
      text: generateRejectionEmailText(emailData),
      html: generateRejectionEmailHTML(emailData)
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Rejection email sent:', info.messageId);
    return true;
  } catch (error) {
    console.error('Rejection email error:', error);
    return false;
  }
};

// Helper functions
const generateInterviewEmailText = (emailData) => {
  return `
Dear ${emailData.candidateName},

Congratulations! You have been shortlisted for an interview for the position of "${emailData.jobTitle}" at ${emailData.companyName}.

Interview Details:
- Date: ${emailData.interviewDate}
- Time: ${emailData.interviewTime}
- Type: ${emailData.interviewType}
${emailData.interviewLink ? `- Link: ${emailData.interviewLink}` : ''}
${emailData.interviewLocation ? `- Location: ${emailData.interviewLocation}` : ''}
- Interviewer: ${emailData.interviewerName} (${emailData.interviewerEmail})

${emailData.additionalNotes ? `Additional Notes: ${emailData.additionalNotes}` : ''}

Please confirm your availability for this interview. If you have any questions, feel free to contact ${emailData.interviewerName}.

Best regards,
${emailData.companyName} HR Team
  `.trim();
};

const generateRejectionEmailText = (emailData) => {
  return `
Dear ${emailData.candidateName},

Thank you for your interest in the ${emailData.jobTitle} position at ${emailData.companyName}.

After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our requirements at this time.

${emailData.rejectionReason ? `Note: ${emailData.rejectionReason}` : ''}

We appreciate the time you invested in your application and encourage you to apply for future positions that match your skills and experience.

We wish you the best in your job search.

Best regards,
${emailData.companyName} HR Team
  `.trim();
};

// HTML templates (similar to earlier but as functions)
const generateInterviewEmailHTML = (emailData) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #4f46e5; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: #4f46e5; color: white; text-decoration: none; border-radius: 6px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Interview Invitation</h1>
            <p>${emailData.companyName}</p>
        </div>
        <div class="content">
            <p>Dear ${emailData.candidateName},</p>
            <p>Congratulations! You have been shortlisted for an interview for the position of <strong>${emailData.jobTitle}</strong>.</p>
            
            <div class="details">
                <h3>Interview Details:</h3>
                <p><strong>Date:</strong> ${emailData.interviewDate}</p>
                <p><strong>Time:</strong> ${emailData.interviewTime}</p>
                <p><strong>Type:</strong> ${emailData.interviewType}</p>
                ${emailData.interviewLink ? `<p><strong>Link:</strong> <a href="${emailData.interviewLink}">${emailData.interviewLink}</a></p>` : ''}
                ${emailData.interviewLocation ? `<p><strong>Location:</strong> ${emailData.interviewLocation}</p>` : ''}
                <p><strong>Interviewer:</strong> ${emailData.interviewerName} (${emailData.interviewerEmail})</p>
                ${emailData.additionalNotes ? `<p><strong>Additional Notes:</strong> ${emailData.additionalNotes}</p>` : ''}
            </div>
            
            <p>Please confirm your availability for this interview.</p>
            <p>Best regards,<br>${emailData.companyName} HR Team</p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply directly.</p>
        </div>
    </div>
</body>
</html>
  `.trim();
};

const generateRejectionEmailHTML = (emailData) => {
  return `
<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #6b7280; color: white; padding: 20px; text-align: center; }
        .content { padding: 20px; background: #f9fafb; }
        .message { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Application Update</h1>
            <p>${emailData.companyName}</p>
        </div>
        <div class="content">
            <p>Dear ${emailData.candidateName},</p>
            
            <div class="message">
                <p>Thank you for your interest in the <strong>${emailData.jobTitle}</strong> position.</p>
                <p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our requirements at this time.</p>
                
                ${emailData.rejectionReason ? `<p><em>${emailData.rejectionReason}</em></p>` : ''}
                
                <p>We appreciate the time you invested in your application and encourage you to apply for future positions that match your skills and experience.</p>
            </div>
            
            <p>We wish you the best in your job search.</p>
            <p>Best regards,<br>${emailData.companyName} HR Team</p>
        </div>
        <div class="footer">
            <p>This is an automated email. Please do not reply directly.</p>
        </div>
    </div>
</body>
</html>
  `.trim();
};