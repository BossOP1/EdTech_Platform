import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";




const createCourse = asyncHandler(async(req,res)=>{
     
    const{courseName,courseDescription,whatYouWillLearn,price,thumbnail} = req.body

    if(!courseName || !courseDescription || whatYouWillLearn || price ||thumbnail ){
        throw new ApiError(400,"please fill all the fields")
    }

    

})