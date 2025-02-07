import mongoose, { Schema } from "mongoose";
import mailSender from "../utils/mailSender";

const otpSchema = new Schema({

   email:{
    type:String,
    req:true,
   },

   createdAt:{
    type:String,
    default:Date.now(),
    expire:3*60,
   },

   otp:{
    type:Number,
    req:true,
   }



},
{timeStamps:true})

//function to send mail

async function sendVerificationEmail(email,otp){

    try {
        
  const mailResponse = await mailSender(email,"Verification Email from EdTEch",otp)
   console.log("email sent successfully:",mailResponse)

    } catch (error) {
        console.log("error occured while sending mails:",error.message);
        throw error;
    }

}

otpSchema.pre("save",async function(next){
    await sendVerificationEmail(this.email,this.otp);
    next();
})



export const Otp = mongoose.model("Otp",otpSchema)