const bcrypt = require('bcrypt');
const User = require('../models/User');
const {generateAccessToken, generateRefreshToken} = require('../utils/jwt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { sendPasswordResetEmail, sendVerificationEmail } = require('../utils/email');


console.log('✅ Email functions imported:', {
    sendPasswordResetEmail: typeof sendPasswordResetEmail,
    sendVerificationEmail: typeof sendVerificationEmail
});

// Register Controller
exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ msg: 'User already exists' });
        }
        
        const hashed = await bcrypt.hash(password, 10);
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(verificationToken).digest('hex');

        const user = await User.create({
            name,
            email,
            password: hashed,
            isVerified: false,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000
        });

        // ✅ FIXED: Correct function call (no extra parentheses)
        await sendVerificationEmail(
            user.email, 
            user.name, 
            verificationToken  // Use the plain token, not hashed
        );

        console.log(`📧 Verification token (dev only): ${verificationToken}`);

        res.status(201).json({
            message: 'Registration successful! Please verify your email.',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {
        console.log('❌ REGISTRATION ERROR DETAILS:');
        console.log('Error name:', error.name);
        console.log('Error message:', error.message);
        console.log('Error stack:', error.stack);
        
        res.status(500).json({ msg: 'Server Error: ' + error.message });
    }
};

// Login Controller
exports.login = async(req, res) => {
    try {
        const {email , password} = req.body;
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).json({msg: 'Invalid credentials'});
        }
        if (!user.isVerified) {
            return res.status(403).json({
                msg : 'Please verify your email before logging in'
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({msg: 'Invalid credentials'});
        }
        const accessToken = jwt.sign(
            {id : user._id},
            process.env.JWT_SECRET,
            {expiresIn : '15m'}
        )

        const refreshToken = jwt.sign(
            {id : user._id},
            process.env.JWT_SECRET,
            {expiresIn: '7d'}
        )
      
        user.refreshToken = refreshToken;
        await user.save();
  

     
        res.json({
            message : 'Login successful',
            accessToken,
            refreshToken,
            user : {
                id : user._id,
                name : user.name,
                email : user.email,
                isVerified : user.isVerified
            }
        });


    } catch (error) {
        res.status(500).json({msg : 'Server Error'});
    }
};

exports.refreshToken = async(req, res) => {
    const {refreshToken} = req.body;
    if (!refreshToken) {
        return res.status(400).json({msg: 'No refresh token provided'});
    }

    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id);
       if (!user || user.refreshToken !== refreshToken) {
            return res.status(401).json({msg: 'Invalid refresh token'});
       }
       const newAccessToken = generateAccessToken(user._id);
       res.json({accessToken : newAccessToken});

    } catch (error) {
        res.status(401).json({msg : 'Invalid refresh token'});
    }
}

// logout controller
exports.logout = async(req, res) => {
    const {refreshToken} =  req.body;

    if (!refreshToken) {
        return res.status(400).json({msg : 'No refresh token provided'});
    }
    const user = await User.findOne({refreshToken});

    if (!user) {
        return res.status(400).json({msg: 'Invalid refresh token'});
    }
    user.refreshToken = null;
    await user.save();
    res.json({msg : 'Logged out successfully'});
}

exports.forgotPassword = async(req, res) => {
    try {
    const {email} = req.body;
    const user = await User.findOne({email});
     if (!user) {
        return res.status(400).json({msg : 'User not found for this email'});
     }
     const resetToken = crypto.randomBytes(32).toString('hex');
     const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');
     user.resetPasswordToken = hashed;
     user.resetPasswordExpires = Date.now() + 15 * 60 * 1000;
     await user.save();


    await sendPasswordResetEmail(
        user.email,
        user.name || 'User',
        resetToken
    );
    console.log(`Password reset token for ${user.email} : ${resetToken}`);
    res.json({msg : 'Password reset email sent'});
} catch( error) {
     console.error(' FULL ERROR DETAILS:');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
    res.status(500).json({msg : 'Server Error'});
}
}

exports.resetPassword = async(req,res) => {
    try {
    const {token, newPassword} = req.body;
    if (!token || !newPassword) {
        return res.status(400).json({msg : 'Token and new password are required'});
    }

    if (newPassword.length < 6) {
        return res.status(400).json({msg : 'Password must be at least 6 characters long'});
    }


    const hashed = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        resetPasswordToken : hashed,
        resetPasswordExpires : {$gt : Date.now()}
    });
    if (!user) {
        return res.status(400).json({msg : 'Invalid or expired reset token'});
    }
    user.password = await bcrypt.hash(newPassword, 10);
    user.resetPasswordToken = null;
    user.resetPassworExpires = null;
    await user.save();

    res.json({msg : 'Password reset successfully'});

} catch (error) {
    console.error('Error in resetPassword controller : ', error);
    res.status(500).json({msg : 'Server Error'});
}

}

exports.verifyEmail = async(req, res) => {
    try {
        const {token} = req.query;
    if (!token) {
        return res.status(400).json({msg : "Verification token required"});
    }
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationExpires: {$gt : Date.now()}

    });
    if (!user) {
        return res.status(400).json({msg : "invalid or expired token"});
    }
    user.isVerified = true;
    user.emailVerificationToken = null,
    user.emailVerificationExpires = null,
    await user.save();

   res.json({msg : 'Email verified successfully! You can now login'})
    
    } catch (error) {
        console.log('Verification error: ', error);
        res.status(500).json({msg: 'server error'});
    }

}