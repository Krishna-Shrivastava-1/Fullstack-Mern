import { timeStamp } from "console";
import mongoose from "mongoose";

const postshema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    image: {
        type: String
    },
    creatdat: {
        type: Date,
        default: Date.now
    },
    imageUrl: {
        type: String, // URL of the image stored on Cloudinary (or any other storage service)
    },
    username:{
        type:String,
        // required:true
    },
    content:{
        type:String
        
    }
},{timeStamp:true})
export default mongoose.model("Post", postshema)