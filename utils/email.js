import nodemailer from 'nodemailer';

// This function will send the password reset email.
// It uses Ethereal Email for development, which is a fake SMTP service.
export const sendPasswordResetEmail = async (options) => {
    // 1. Create a test account on Ethereal
    // This only needs to be done once. We can reuse the credentials.
    let testAccount = await nodemailer.createTestAccount();

    // 2. Create a transporter object using the Ethereal SMTP transport
    const transporter = nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        },
    });

    // 3. Define the email options
    const mailOptions = {
        from: '"QUBIT FUND Support" <support@qubitfund.com>',
        to: options.email,
        subject: 'Your Password Reset Link (Valid for 10 Minutes)',
        html: `
            <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                <h2>Hello ${options.name},</h2>
                <p>You requested a password reset for your QUBIT FUND account.</p>
                <p>Please click the button below to set a new password. This link is only valid for 10 minutes.</p>
                <a href="${options.resetUrl}" style="background-color: #28a745; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Your Password</a>
                <p>If you did not request a password reset, please ignore this email.</p>
                <p>Thank you,<br>The QUBIT FUND Team</p>
            </div>
        `
    };

    // 4. Send the email
    const info = await transporter.sendMail(mailOptions);

    console.log('Message sent: %s', info.messageId);
    
    // IMPORTANT: The preview URL will be logged to your console.
    // You can click this link to see the email that was sent.
    console.log('Password Reset Email Preview URL: %s', nodemailer.getTestMessageUrl(info));
};