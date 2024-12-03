import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import PostRoutes from './Routes/PostRoutes.js'
import AuthRoutes from './Routes/AuthRoutes.js'
import cookieParser from 'cookie-parser'
import bodyParser from 'body-parser'
const app = express()
dotenv.config()

const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
const Port = process.env.PORT || 3333
app.use(cors({
    origin: frontendUrl,  // Frontend URL (React app)
    credentials: true,                // Allow cookies to be sent with requests
    methods: 'GET,POST,PUT',
    allowedHeaders: 'Content-Type,Authorization',
  }));
// Middleware
// app.use(cors({
//     // origin: 'http://localhost:3000', // Replace with your frontend URL
//     methods: 'GET,POST',
//   allowedHeaders: 'Content-Type,Authorization',
// }));

app.use(cookieParser())
app.use(express.json())
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("connected to database")).catch((err) => console.log(err));


app.use('/post', PostRoutes)
app.use('/auth', AuthRoutes)


app.listen(Port, () => {
    console.log('Server is listening ' + Port)
})

// http://localhost:5550/post/