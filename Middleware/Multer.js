import multer from "multer";

const storage = multer.memoryStorage()
const upload =multer({
    storage,
    limits:{fileSize:10*1024*1024},
    fileFilter:(req,file,cb)=>{
if (file.mimetype.startsWith('image/')) {
    cb(null,true)
} else {
    cb(new Error('not a image'),false)
}
    }
})

export default upload;