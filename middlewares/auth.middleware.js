import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";




const verifyJWT = asyncHandler(async (req, res, next) => {
    try {
      // Extract token from cookies or headers
      const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
  
      if (!token) {
        throw new ApiError(401, "Unauthorized request: No access token provided");
      }
  
      // Verify the token
      const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  
      // Find the user by ID and exclude sensitive fields
      const user = await User.findById(decodedToken?._id).select("-password -refreshToken");
  
      if (!user) {
        throw new ApiError(401, "Invalid token: User not found");
      }
  
      // Attach the user to the request object
      req.user = user;
  
      next(); // Pass control to the next middleware
    } catch (error) {
      next(new ApiError(500, error.message || "Invalid access token"));
    }
  });
  


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