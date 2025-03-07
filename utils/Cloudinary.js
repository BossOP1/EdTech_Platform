import { v2 as cloudinary } from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINART_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCloudinary = async (localFilePath)=>{
   
    try {
        //localfilePath not found
       // console.log("LocalPath",localFilePath)
        if(!localFilePath) return null;

        // upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath,{
            resource_type:"auto",
        }
        )
        // id file upload is successfull
        //console.log("the uploaded file url is",response.url)
      // console.log("response is @@@@@@@@@",response)

        fs.unlinkSync(localFilePath)
        return response   // for the user

    } catch (error) {
       
        fs.unlinkSync(localFilePath) // removing the locally saved file as the upload to main server is failed
        return null;
    }
}
export {uploadOnCloudinary}