import cloudinary from 'cloudinary'
cloudinary.config({
    cloudname:process.env.cloudname,
    apikey:process.env.apikey,
    apisecret:process.env.apisecret
})
export default cloudinary