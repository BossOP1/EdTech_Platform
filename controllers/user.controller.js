import otpGenerator from "otp-generator"
import { Otp } from "../models/otp.models";
import { Profile } from "../models/profile.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";




const generateAccessAndRefreshTokens = async(userId)=>{

 try {
   const user = await User.findById(userId)
 
   const accessToken = await user.generateAccessToken()
   const refreshToken = await user.generateRefreshToken()
 
   user.refreshToken = refreshToken
 
   await user.save({validateBeforeSave:false})
   return {accessToken,refreshToken}
 
 } catch (error) {
  throw new ApiError(400,"there is some error in accessing the tokens")
 }

}

// send otp


const sendOtp = asyncHandler(async(req,res)=>{
    const{email} = req.body;

   try {
     const checkUserPresent = await User.findOne({email})
    
     if(checkUserPresent){
         throw new ApiError(404,"no such user found")
     }
 
        let otp = otpGenerator.generate(6,{
         upperCaseAlphabets:false,
         lowerCaseAlphabets:false,
         specialChars:false,
        })
 
        const result = await Otp.findOne({otp:otp})
 
        while(result){
         otpGenerator.generate(6,{
             lowerCaseAlphabets:false,
             upperCaseAlphabets:false,
             specialChars:false
         })
       
         const otpPayload = {email,otp};
         const otpBody = await Otp.create(otpPayload);
 
         res.status(200).json(
             {
                 success:true,
             message:`Otp sent successfully`,otpBody,
            }
         )
 
        }
 
   } catch (error) {
    return res.status(500).json({ success: false, error: error.message })
   }
       

})
/// signup

const signup = asyncHandler(async(req,res)=>{
    const{firstName,lastName,email,password,accountType,contactNumber,confirmPassword,otp} = req.body;
try {
    
        if(!firstName || !lastName || !password || !confirmPassword ||!accountType || !contactNumber || !otp){
            throw new ApiError(404,"please fill all the details")
        }
    
        if(password !== confirmPassword){
            throw new ApiError(400,"password does not match")
        }
    
       const existedUser = await User.findOne({
        email:email
       })
    
       if(existedUser){
        throw new ApiError(400,"user already exist")
       }
    
       const response = await Otp.findOne({
          email
       }).sort({createdAt : -1}).limit(1);
    
       if(!response){
        throw new ApiError(500,"there is some problem in getting the response")
       }
         
       if(response.length === 0){
        throw new ApiError(400,"no otp found")
       }
    
       if(response.otp !== otp){
        throw new ApiError(400,"otp invalid")
       }
    
       const hashPassword = await bcrypt.hash(confirmPassword,10)
    
       let approved = "";
       approved === "Instructor" ? (approved = false) : (approved = true)
    
    
      const profileDetails = await Profile.create({
        gender:null,
        DateOfBirth:null,
        about:null,
        PhoneNumber:contactNumber,
      })
    
      if(!profileDetails){
        throw new ApiError(500,"there is some error in creating profile in databse")
      }
    
    
      const user = await User.create({
        firstName,
        lastName,
        email,
        contactNumber,
        password: hashPassword,
        accountType: accountType,
        approved: approved,
        additionalDetails: profileDetails._id,
        image: "",
      })

      const createdUser = await User.findById(user._id).select(
        "-password -refreshTokens"
      )

      if(!createdUser){
        throw new ApiError(500,"there is some error in fetching the user details")
      }
    
      return res
      .status(200)
      .json(new ApiResponse(200,createdUser,"User has been created Successfully"))
} catch (error) {
    throw new ApiError(400,"there is some problem in sighning up the user || error.message")
}
  })

// login

const login =  asyncHandler(async(req,res)=>{
     
 const{email,password} = req.body;

 if(!email || !password){
    throw new ApiError(400,"Please fill all the field")
 }

 const user = await User.findOne({
         email
 })

 if(!user){
  throw new ApiError(400,"please register the user first")
 }

 const passwordCheck = await isPasswordCorrect(password)

 if(!passwordCheck){
  throw new ApiError(400,"password is incorrect")
 }
 
 const{accessToken,refreshToken} = await generateAccessAndRefreshTokens(user._id);

 const loggedInUser = await User.findById(user._id).select("-password -refreshToken")

 const options = {
  httpOnly: true,
  secure:true
}

return res
    .status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshtoken",refreshToken,options)
    .json(new ApiResponse(200,{
        user:accessToken,refreshToken,loggedInUser
    }
      ,"user loggedIn successfully"))


})

//change password

const changePassword = asyncHandler(async(req,res)=>{
   
 try {
   const{password,newPassword} = req.body
 
   const user = await User.findById(req.user?._id);
 
   const isPasswordCorrect = await user.isPasswordCorrect(password);
 
   if(!isPasswordCorrect){
     throw new ApiError(400,"both password does not match")
   }
 
    user.password = newPassword;
    await user.save({validateBeforeSave:false})
 
    return res
    .status(200)
    .json(new ApiResponse(200,{},"password has been successfully changed"))

 } catch (error) {
   throw new ApiError(400,"there is some error in chaging the password || error.message")
 }
   
})

// refreshing accesstokens

const refreshAccessTokens = asyncHandler(async(req,res)=>{
  
})


export {sendOtp,signup,login,changePassword}