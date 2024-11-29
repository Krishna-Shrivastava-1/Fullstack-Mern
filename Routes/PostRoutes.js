import express from 'express';
import Post from '../Models/Post.js';
import upload from '../Middleware/Multer.js';
import cloudinary from 'cloudinary';

const router = express.Router();

// Cloudinary configuration (make sure you have your credentials set in .env)
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, description, content } = req.body;
        let imageUrl = '';

        // If there's an uploaded file, upload it to Cloudinary
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                cloudinary.v2.uploader.upload_stream(
                    { resource_type: 'auto' },
                    (error, result) => {
                        if (error) {
                            reject(error);
                        } else {
                            resolve(result);
                        }
                    }
                ).end(req.file.buffer); // Sending file buffer to Cloudinary
            });

            imageUrl = result.secure_url; // Store the uploaded image URL
        }

        // Create a new post with content and image URL (if available)
        const newPost = new Post({
            content,
            imageUrl,
            title,
            description,
        });

        await newPost.save(); // Save the post in the database

        // Respond with the created post
        res.status(201).json(newPost);
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: 'There was an error with the upload',
            success: false
        });
    }
});

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find(); // Get all posts from the database
        res.status(200).json(posts); // Send the posts as response
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Failed to retrieve posts', success: false });
    }
});

export default router;
