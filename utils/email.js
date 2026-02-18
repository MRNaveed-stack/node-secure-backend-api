const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendPasswordResetEmail = async (toEmail, userName, resetToken) => {
    const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

    const msg = {
        to: toEmail,
        from: process.env.FROM_EMAIL,
        subject: "Password Reset Request",
        html: `
        <div style="font-family: Arial; max-width:600px; margin:auto;">
            <h2>Password Reset</h2>
            <p>Hello ${userName || "User"},</p>
            <p>Click below to reset your password:</p>
            <a href="${resetLink}" style="padding:12px 20px;background:#4CAF50;color:white;text-decoration:none;">
                Reset Password
            </a>
            <p>This link expires in 15 minutes.</p>
        </div>
        `
    };

    await sgMail.send(msg);
    console.log("✅ Password reset email sent to:", toEmail);
};

const sendVerificationEmail = async (toEmail, userName, verificationToken) => {
    const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;

    const msg = {
        to: toEmail,
        from: process.env.FROM_EMAIL,
        subject: "Verify your email address",
        html: `
        <div style="font-family: Arial; max-width:600px; margin:auto;">
            <h2>Welcome ${userName || "User"}!</h2>
            <p>Please verify your email:</p>
            <a href="${verifyLink}" style="padding:12px 20px;background:blue;color:white;text-decoration:none;">
                Verify Email
            </a>
            <p>This link expires in 24 hours.</p>
        </div>
        `
    };

    await sgMail.send(msg);
    console.log("✅ Verification email sent to:", toEmail);
};

module.exports = {
    sendPasswordResetEmail,
    sendVerificationEmail
};
