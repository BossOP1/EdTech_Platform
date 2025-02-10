import { asyncHandler } from "../utils/asyncHandler";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";




const verifyJWT = asyncHandler(async(req,res)=>{
    try {
        
  const token  = req?.cookies.accessToken || req.header
  (Authorization)?.replace("Bearer ","")

  const decodedToken = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);

  const user = await User.findById(decodedToken?._id).select("-password -refreshToken")
   
    if(!user){
        throw new ApiError(401,"invalid Token")
    }
   
    req.user = user;
    next();


    } catch (error) {
        throw new ApiError(500,error.message || " invalid access token")
    }
})


const isAdmin =asyncHandler(async(req,res)=>{
      
   try {
     const user = await User.findOne({
         email :req.user?.email
     })
 
     if(!user){
         throw new ApiError(400,"the user does not dound")
     }
 
     if(user?.accountType !== "Admin"){
         throw new ApiError(400,"this route is only for admin")
     }
     next();
   } catch (error) {
    throw new ApiError(400,error.message || "there is some error in isAdmin")
   }
})

const isStudent = asyncHandler(async(req,res)=>{
    try {
        
        const user = await User.findOne({
            email:req.user?.email
        })

        if(!user){
            throw new ApiError(400,"user not found")
        }

        if(user?.accountType !== "Student"){
           throw new ApiError(400,"this routs is procured for student only")
        }

        next();


    } catch (error) {
        throw new ApiError(400,error.message || "there is some error in isStudent")
    }
})

const isInstructor = asyncHandler(async(req,res)=>{
     
   try {
     const user = await User.findOne({
         email:user?.email
     })
 
     if(!user){
         throw new ApiError(400,"no user found")
     }
 
     if(user?.accountType !== "isInstructor"){
         throw new ApiError(400,"this route is only procured for instructor")
     }
     next();


   } catch (error) {
       throw new ApiError(500,error.message || "there is some problem in isInstructor middleware")
   }
})




export {verifyJWT,isAdmin,isStudent,isInstructor}