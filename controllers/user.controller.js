import otpGenerator from "otp-generator"
import { Otp } from "../models/otp.models.js";
import { Profile } from "../models/profile.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mailSender from "../utils/mailSender.js";


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


// const sendOtp = asyncHandler(async(req,res)=>{
//     const{email} = req.body;

//    try {
//      const checkUserPresent = await User.findOne({email})
    
//      if(!checkUserPresent){
//          throw new ApiError(404,"no such user found")
//      }
 
//         let otp = otpGenerator.generate(6,{
//          upperCaseAlphabets:false,
//          lowerCaseAlphabets:false,
//          specialChars:false,
//         })
 
//         const result = await Otp.findOne({otp:otp})
 
//         while(result){
//          otpGenerator.generate(6,{
//              lowerCaseAlphabets:false,
//              upperCaseAlphabets:false,
//              specialChars:false
//          })
       
//          const otpPayload = {email,otp};
//          const otpBody = await Otp.create(otpPayload);
 
//          res.status(200).json(
//              {
//                  success:true,
//              message:`Otp sent successfully`,otpBody,
//             }
//          )
 
//         }
 
//    } catch (error) {
//     throw new ApiError(500,error.message || "there is some problem in sendotp")
//    }
       

// })

const sendOtp = asyncHandler(async (req, res) => {
  const { email } = req.body;

  try {
    // Check if the user already exists
    const checkUserPresent = await User.findOne({ email });
    if (checkUserPresent) {
      throw new ApiError(409, "User already exists");
    }

    // Generate unique 6-digit OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    // Create OTP entry in DB
    const otpBody = await Otp.create({
      email,
      otp,
    });

    // Send success response without exposing OTP details
    return res
      .status(200)
      .json(new ApiResponse(200, { email,otp }, "OTP sent successfully"));

  } catch (error) {
    throw new ApiError(500, error.message || "Some problem in sending OTP");
  }
});


/// signup

const signup = asyncHandler(async (req, res) => {
  const { firstName, lastName, email, password, accountType, contactNumber, confirmPassword, otp } = req.body;

  try {
    if (!firstName || !lastName || !password || !confirmPassword || !accountType || !contactNumber || !otp) {
      throw new ApiError(404, "Please fill all the details");
    }

    if (password !== confirmPassword) {
      throw new ApiError(400, "Password does not match");
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
      throw new ApiError(400, "User already exists");
    }

    const response = await Otp.findOne({ email }).sort({ createdAt: -1 });
    if (!response) {
      throw new ApiError(400, "There is a problem in getting the OTP");
    }

    if (String(response.otp).trim() !== String(otp).trim()) {
      throw new ApiError(400, "Invalid OTP");
    }

    // Determine approval status based on account type
    let approved;
    if (accountType === "Instructor") {
      approved = false; // Instructors require manual approval
    } else if (accountType === "Admin") {
      approved = true; // Admins are auto-approved
    } else if (accountType === "Student") {
      approved = true; // Students are auto-approved
    } else {
      throw new ApiError(400, "Invalid account type");
    }

    const profileDetails = await Profile.create({
      gender: null,
      DateOfBirth: null,
      about: null,
      PhoneNumber: contactNumber,
    });

    if (!profileDetails) {
      throw new ApiError(500, "There was an error creating the profile in the database");
    }

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password, // Password will be hashed by the pre-save hook in the User model
      accountType,
      approved,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
      
    });

    if (!user) {
      throw new ApiError(400, "Cannot create user in the database");
    }

    const createdUser = await User.findById(user._id).select("-password -refreshTokens");

    if (!createdUser) {
      throw new ApiError(500, "There was an error fetching the user details");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, createdUser, "User has been created successfully"));

  } catch (error) {
    throw new ApiError(500, error.message || "There was a problem signing up the user");
  }
});


// login

const login =  asyncHandler(async(req,res)=>{
     
 try {
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
 
  const passwordCheck = await user.isPasswordCorrect(password)
 
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
         accessToken,refreshToken,loggedInUser
     }
       ,"user loggedIn successfully"))
 } catch (error) {
    throw new ApiError(500,error.message || "error in login")
 }


})

//change password

const changePassword = asyncHandler(async(req,res)=>{
   
 try {
   const{password,newPassword} = req.body
   console.log(req.user)
 
   const user = await User.findById(req.user?._id);

   if(!user){
    throw new ApiError(400,"user not found")
   }
 
   const isPasswordCorrect = await user.isPasswordCorrect(password);
 
   if(!isPasswordCorrect){
     throw new ApiError(400,"both password does not match")
   }
 
    user.password = newPassword;
    await user.save({validateBeforeSave:false})

    //const mailResponse = await mailSender(user.email,"password changes mail",)
 
    return res
    .status(200)
    .json(new ApiResponse(200,{},"password has been successfully changed"))

 } catch (error) {
   throw new ApiError(400,error.message || "there is some error in chaging the password ")
 }
   
})

const logout = asyncHandler(async(req,res)=>{
  await  User.findByIdAndUpdate(
    req.user._id,{
        $unset:{
            refreshToken:1
        }
    },
        {
        new:true,
        }
 )

 const options = {
    httpOnly: true,
    secure:true
}

return res.status(202)
.clearCookie("accessToken",options)
.clearCookie("refreshToken",options)
.json(new ApiResponse(200,
    {},
    "user loggedout successfully"
    ))
})

// refreshing accesstokens

const refreshAccessTokens = asyncHandler(async (req,res)=>{

  // incomingfreshtoken sent by user
  const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
   console.log("refresh token is--->",incomingRefreshToken)
  if(!incomingRefreshToken){
      throw new ApiError(401,"user unauthorized")
  }

  try {
      const decodedToken = jwt.verify(
          incomingRefreshToken,
          process.env.REFRESH_TOKEN_SECRET,
      )

      console.log("%%%%%%%%%",decodedToken)
       
      const user = await User.findById(decodedToken?._id)
      if (!decodedToken?._id) {
          throw new ApiError(401, "Invalid token or missing user ID");
        }
        
      console.log("user  is---->",user)

      console.log("id from the user is--&&7",user._id)
      if(!user){
          throw new ApiError(401,"invalid refresh token")
      }
       console.log("hbcskbckhdbvbhd--->",user?.refreshToken)
      if(incomingRefreshToken !== user?.refreshToken){
          throw new ApiError(500,"refresh token is expired or used")
      }
  
      const options = {
          httpOnly:true,
          secure:true
      }
      
      const {accessToken,newRefreshToken} = 
      await generateAccessAndRefreshTokens(user._id)
      
      return res.status(202)
      .cookie("accessToken",accessToken,options)
      .cookie("refreshToken",newRefreshToken,options)
      .json(
          new ApiResponse(
              200,
              {accessToken,refreshToken: newRefreshToken},
              "accesss token refreshed successfully"
          )
      )
  
  
  } catch (error) {
      throw  new ApiError(error,error?.message || "invalid refresh token")
  }
})


export {sendOtp,signup,login,changePassword,logout,refreshAccessTokens}