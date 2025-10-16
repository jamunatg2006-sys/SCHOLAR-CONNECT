import express from 'express';
const router = express.Router();

// Import all the controller functions
import {
    signup,
    login,
    forgotPassword,
    resetPassword
} from "../controllers/auth.controller.js";

// Import validation middleware
import {
    signupValidation,
    loginValidation
} from "../middlewares/error.middleware.js";

// --- Authentication Routes ---
router.post('/register', signupValidation, signup);
router.post('/login', loginValidation, login);

// --- Password Reset Routes ---
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);





export default router;