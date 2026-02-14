const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth : {
        user : process.env.EMAIL_USER,
        pass : process.env.EMAIL_PASS
    }

});

transporter.verify((error , success) => {
    if (error) {
        console.log(error);
    }
    else {
        console.log('Server is ready to take messages');
    }
});

const sendPasswordResetEmail = async(toEmail , userName , resetToken) => {
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const mailOptions = {
        from : `"Backend Team" <${process.env.EMAIL_USER}>`,
        to : toEmail,
        subject : 'Password Reset Request',
         html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    .container {
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        border: 1px solid #e0e0e0;
                        border-radius: 5px;
                    }
                    .button {
                        display: inline-block;
                        padding: 12px 24px;
                        background-color: #4CAF50;
                        color: white;
                        text-decoration: none;
                        border-radius: 4px;
                        font-weight: bold;
                        margin: 20px 0;
                    }
                    .footer {
                        margin-top: 20px;
                        font-size: 12px;
                        color: #666;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Password Reset Request</h2>
                    <p>Hello ${userName || 'User'},</p>
                    <p>We received a request to reset your password. 
                       Click the button below to create a new password:</p>
                    
                    <a href="${resetLink}" class="button">Reset Password</a>
                    
                    <p>Or copy this link:</p>
                    <p>${resetLink}</p>
                    
                    <p><strong>This link expires in 15 minutes.</strong></p>
                    
                    <div class="footer">
                        <p>If you didn't request this, please ignore this email.</p>
                        <p>This is an automated message, please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    
    };
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: ' + info.response);
    return info;


};

const sendVerificationEmail = async (toEmail, userName, verificationToken) => {
    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    const mailOptions = {
        from: `"Backend Team" <${process.env.EMAIL_USER}>`,
        to: toEmail,
        subject: "Verify your email address",
        html: `
            <h2>Welcome ${userName}!</h2>
            <p>Please verify your email address:</p>
            <a href="${verifyLink}" style="padding: 10px 20px; background: blue; color: white;">
                Verify Email
            </a>
            <p>This link expires in 24 hours.</p>
        `
    };
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent to:', toEmail);
};


module.exports = { 
    sendPasswordResetEmail, 
    sendVerificationEmail 
};