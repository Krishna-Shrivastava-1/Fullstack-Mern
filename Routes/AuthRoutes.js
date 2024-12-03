import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../Models/User.js';
import cookieParser from 'cookie-parser';

const router = express.Router();
const secretKey = process.env.SECRET_KEY_OF_JWT || 'sdfhisdfisdnicdsijew'; // Fixed typo for secret key

// Register User
// http://localhost:5550/auth/register/
router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered",
                success: false
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ name, email, password: hashedPassword });
        await newUser.save();

        res.status(200).json({
            message: "User Registered Successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "User failed to register",
            success: false
        });
    }
});

// Login User
// http://localhost:5550/auth/login/

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isPasswordCorrect = await bcrypt.compare(password, user.password);
        if (!isPasswordCorrect) {
            return res.status(404).json({ message: 'Invalid Credentials' });
        }

        const token = jwt.sign({ id: user._id  }, secretKey, { expiresIn: '1d' });

        // Send token in JSON response
        return res.status(201).json({
            message: `Welcome back ${user.name}`,
            success: true,
            token: token  // Add token here in the response
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Login failed",
            success: false
        });
    }
});

// router.post('/login', async (req, res) => {
//     const { email, password } = req.body;
//     try {
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(404).json({ message: 'User not found' });
//         }

//         const isPasswordCorrect = await bcrypt.compare(password, user.password);
//         if (!isPasswordCorrect) {
//             return res.status(404).json({ message: 'Invalid Credentials' });
//         }

//         const token = jwt.sign({ id: user._id }, secretKey, { expiresIn: '1d' });

//         // Set token in cookies with httpOnly flag to prevent access via JavaScript
//         return res.status(201).cookie("token", token, {
//             expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day expiration
//             httpOnly: true, // Secure token (client can't access it via JS)
//         }).json({
//             message: `Welcome back ${user.name}`,
//             success: true
//         });
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({
//             message: "Login failed",
//             success: false
//         });
//     }
// });

// Logout User
// http://localhost:5550/auth/logout/
router.post('/logout', (req, res) => {
    try {
        // Clear the cookie
        return res.cookie("token", "", {
            expires: new Date(0), // Expire immediately
            httpOnly: true, // Ensure the cookie is cleared
        }).json({
            message: "User logged out successfully",
            success: true
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Logout failed",
            success: false
        });
    }
});

// Token Verification Middleware
// Correct export for token verification
// export const verifytoken = (req, res, next) => {
//     const token = req.cookies.token;  // This should now work with cookie-parser

//     // console.log(token);  // Check if the token is being extracted properly
    
//     if (!token) {
//         return res.status(401).json({ message: 'Authorization token is missing' });
//     }

//     try {
//         const decoded = jwt.verify(token, secretKey);  // Use your actual secret key here
//         req.userId = decoded.id;  // Store decoded user ID in the request object
//         next();  // Proceed to next middleware or route handler
//     } catch (error) {
//         return res.status(401).json({ message: 'Invalid token' });
//     }
// };

export const verifytoken = (req, res, next) => {
    const token = req.cookies.token;
    
    console.log("Token from cookies: ", token);  // Log the token to check if it's coming

    if (!token) {
        return res.status(401).json({ message: 'Authorization token is missing' });
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.userId = decoded.id;
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};

export const verifytokenOptional = (req, res, next) => {
    const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
    
    if (!token) {
        req.userId = null; // No token provided, proceed without user ID
        return next();
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.userId = decoded.id; // Attach userId from token
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};




export default router;
