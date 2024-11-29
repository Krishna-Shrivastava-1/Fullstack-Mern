import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from 'mongoose'
import PostRoutes from './Routes/PostRoutes.js'

const app = express()
dotenv.config()


const Port = process.env.PORT || 3333

// Middleware
app.use(cors({
    // origin: 'http://localhost:3000', // Replace with your frontend URL
    methods: ['GET', 'POST'],
  }));
app.use(express.json())

mongoose.connect(process.env.MONGO_URI,{
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(()=>console.log("connected to database")).catch((err)=> console.log(err));


app.use('/post',PostRoutes)

app.listen(Port,()=>{
    console.log('Server is listening ' + Port)
})