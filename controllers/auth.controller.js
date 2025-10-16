import User from '../models/user.model.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { sendPasswordResetEmail } from '../utils/email.js';

export const signup = async (req, res) => {
    console.log('Signup endpoint hit');
    console.log('Request body:', req.body);
    try {
        const { name, email, password } = req.body;
        const user = await User.findOne({ email });
        if (user) {
            // If user exists, send a 409 Conflict status
            return res.status(409).json({ message: 'User already exists!', success: false });
        }
        const userModel = new User({ name, email, password });
        userModel.password = await bcrypt.hash(password, 10);
        await userModel.save();
        console.log('User saved:', userModel);
        res.status(201).json({
            message: 'Signup successful',
            success: true
        });

    } catch (err) {
        console.error('Signup error:', err);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        const errMsg = "Authentication failed: email or password incorrect.";
        if (!user) {
            return res.status(403).json({ message: errMsg, success: false });
        }
        const isPassEqual = await bcrypt.compare(password, user.password);

        if (!isPassEqual) {
            return res.status(403).json({ message: errMsg, success: false });
        }
        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id, name: user.name },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Logged in successfully',
            success: true,
            token: jwtToken,
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

// --- NEW: Forgot Password Function ---
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // We don't want to reveal if a user exists or not for security reasons
            return res.status(200).json({ message: 'If a user with that email exists, a password reset link has been sent.', success: true });
        }

        // Generate a random token
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hash the token and save it to the user model
        user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        // Set token to expire in 10 minutes
        user.resetPasswordExpires = Date.now() + 10 * 60 * 1000; 

        await user.save();

        // Create the reset URL for the email
        const resetUrl = `${req.protocol}://${req.get('host')}/reset-password.html?token=${resetToken}`;

        try {
            await sendPasswordResetEmail({
                email: user.email,
                name: user.name,
                resetUrl: resetUrl
            });
            res.status(200).json({ message: 'Password reset link has been sent to your email.', success: true });
        } catch (emailError) {
            console.error('Email sending error:', emailError);
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            res.status(500).json({ message: 'Error sending password reset email. Please try again later.', success: false });
        }

    } catch (err) {
        console.error('Forgot Password error:', err);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};

// --- NEW: Reset Password Function ---
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            return res.status(400).json({ message: 'Token and new password are required.', success: false });
        }

        // Hash the incoming token to match the one in the database
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        // Find the user by the hashed token and check if it has not expired
        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: Date.now() } // $gt means "greater than"
        });

        if (!user) {
            return res.status(400).json({ message: 'Password reset token is invalid or has expired.', success: false });
        }

        // Set the new password
        user.password = await bcrypt.hash(password, 10);
        
        // Clear the reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;

        await user.save();

        // Log the user in by sending back a new JWT
        const jwtToken = jwt.sign(
            { email: user.email, _id: user._id, name: user.name },
            process.env.JWT_SECRET || 'default_secret',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            message: 'Password has been reset successfully.',
            success: true,
            token: jwtToken
        });

    } catch (err) {
        console.error('Reset Password error:', err);
        res.status(500).json({ message: 'Internal Server Error', success: false });
    }
};