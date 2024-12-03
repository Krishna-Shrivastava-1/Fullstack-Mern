import express from 'express';
import Post from '../Models/Post.js';
import upload from '../Middleware/Multer.js';
import cloudinary from 'cloudinary';
import { verifytoken, verifytokenOptional } from './AuthRoutes.js';
import mongoose from 'mongoose';
import User from '../Models/User.js';
// import { promisify } from 'util';
const router = express.Router();

// Cloudinary configuration (make sure you have your credentials set in .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// POST request to create a post

import { promisify } from 'util';

router.post('/', upload.single('image'), verifytoken, async (req, res) => {
    try {
        const { title, description, content } = req.body;
        let imageUrl = '';

        // If a file is uploaded, handle Cloudinary upload
        if (req.file) {
            const uploadToCloudinary = promisify(cloudinary.v2.uploader.upload_stream);

            try {
                const result = await uploadToCloudinary({ resource_type: 'auto' }).end(req.file.buffer);
                imageUrl = result.secure_url; // Store uploaded image URL
            } catch (error) {
                return res.status(500).json({ message: 'Cloudinary upload failed', error });
            }
        }

        // Create a new post with provided data
        const newPost = new Post({
            title,
            description,
            content,
            imageUrl,
            user: req.userId, // Attach user ID from token
        });

        // Save the post to the database
        await newPost.save();

        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: 'There was an error with post creation',
            success: false,
            error: error.message || error,
        });
    }
});

// router.post('/', upload.single('image'), verifytoken, async (req, res) => {
//     try {
//         const { title, description, content } = req.body;
//         let imageUrl = '';

//         // If there's an uploaded file, upload it to Cloudinary
//         if (req.file) {
//             try {
//                 const result = await cloudinary.v2.uploader.upload_stream(
//                     { resource_type: 'auto' },
//                     (error, result) => {
//                         if (error) {
//                             return res.status(500).json({ message: 'Error uploading image to Cloudinary', error });
//                         }
//                         return result; // Resolve the result on success
//                     }
//                 ).end(req.file.buffer); // Sending file buffer to Cloudinary

//                 imageUrl = result.secure_url; // Store the uploaded image URL
//             } catch (error) {
//                 return res.status(500).json({ message: 'Cloudinary upload failed', error });
//             }
//         }

//         // Create a new post with content and image URL (if available)
//         const newPost = new Post({
//             title,
//             description,
//             content,
//             imageUrl,
//             user: req.userId // Assuming userId comes from the verifytoken middleware
//         });

//         // Save the post in the database
//         await newPost.save();

//         // Respond with the created post
//         res.status(201).json(newPost);
//     } catch (error) {
//         console.log(error);
//         return res.status(500).json({
//             message: 'There was an error with the post creation',
//             success: false,
//             error: error.message || error
//         });
//     }
// });

// GET request to fetch all posts
// http://localhost:5550/post/ GET
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find(); // Get all posts from the database
        res.status(200).json(posts); // Send the posts as response
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to retrieve posts', success: false });
    }
});

// Get all user
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find(); // Get all posts from the database
        res.status(200).json(posts); // Send the posts as response
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to retrieve posts', success: false });
    }
});
// GET request to  posts by id
// 

router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;  // Get userId from the URL parameter

        // Ensure the userId is in ObjectId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const posts = await Post.find({ user: userId });  // Find posts by userId
        if (posts.length === 0) {
            return res.status(404).json({ message: 'No posts found for this user' });
        }

        res.status(200).json(posts);  // Send the posts back as JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

router.get('/profile/:userId', verifytokenOptional, async (req, res) => {
    try {
        const userId = req.params.userId;  // Get userId from the URL parameter

        // Ensure the userId is in ObjectId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        const profile = await User.findById(userId).select('-password');  // Find user by userId and exclude password field
        if (!profile) {
            return res.status(404).json({ message: 'No user found for this id' });
        }

        res.status(200).json(profile);  // Send the user profile back as JSON
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// Get All User
router.get('/users', verifytokenOptional, async (req, res) => {
    try {
        // Extract token from request headers (if present)
        const token = req.header('Authorization') ? req.header('Authorization').replace('Bearer ', '') : null;

        // If a token is provided, decode it to get the logged-in user's ID
        let loggedInUserId = null;
        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            loggedInUserId = decoded.userId;
        }

        // Find all users except the logged-in user
        const users = loggedInUserId
            ? await User.find({ _id: { $ne: loggedInUserId } }).select('-password')  // Exclude logged-in user
            : await User.find().select('-password');  // If no token, return all users

        res.status(200).json(users);  // Send users as response
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to retrieve users', success: false });
    }
});


// router.get('/profile/:userId', verifytoken,async (req, res) => {
//     try {
//         const userId = req.params.userId;  // Get userId from the URL parameter

//         // Ensure the userId is in ObjectId format
//         if (!mongoose.Types.ObjectId.isValid(userId)) {
//             return res.status(400).json({ message: 'Invalid user ID' });
//         }

//         const profile = await User.findById(userId).select('-password');  // Find posts by userId
//         if (profile.length === 0) {
//             return res.status(404).json({ message: 'No user found for this id' });
//         }

//         res.status(200).json(profile);  // Send the posts back as JSON
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({ message: 'Server Error' });
//     }
// });

router.put('/profile/:userId',async (req, res) => {
    try {
        const userId = req.params.userId;  // Get userId from the URL parameter
        const updates = req.body;  // Get updated data from request body

        // Ensure the userId is in ObjectId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        // Find and update the user profile
        const updatedUser = await User.findByIdAndUpdate(userId, updates, {
            new: true, // Returns the updated document
            runValidators: true, // Runs schema validation before saving
        });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Send updated user profile back as JSON
        res.status(200).json(updatedUser);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});


// Likes and deislike route

// Like a post
router.put('/likeuser/:id/like', async (req, res) => {
    const { id } = req.params; // Post ID
    const userId = req.body.userId; // Liking user's ID
  
    try {
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ message: 'Post not found' });
  
      console.log("Post Before Like:", post);
  
      // Ensure `likes` is an array
      if (!Array.isArray(post.likes)) {
        post.likes = [];
      }
  
      // Check if user already liked the post
      if (post.likes.includes(userId)) {
        return res.status(400).json({ message: 'Already liked' });
      }
  
      post.likes.push(userId); // Add user ID to likes
      await post.save();
  
      console.log("Post After Like:", post);
  
      res.status(200).json({ message: 'Post liked', likes: post.likes.length });
    } catch (error) {
      console.error("Error Occurred:", error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
  
  
  // Unlike a post
  router.put('/dislikeuser/:id/unlike', async (req, res) => {
    const { id } = req.params; // Post ID
    const userId = req.body.userId; // Unliking user's ID
  
    try {
      const post = await Post.findById(id);
      if (!post) return res.status(404).json({ message: 'Post not found' });
  
      // Remove user ID from likes
      post.likes = post.likes.filter((like) => like.toString() !== userId);
      await post.save();
  
      res.status(200).json({ message: 'Post unliked', likes: post.likes.length });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

export default router;
