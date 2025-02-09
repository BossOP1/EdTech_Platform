import mongoose,{Schema} from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";

const userSchema = new Schema({
       
    firstName:{
        type:String,
        required :true,
        trim:true,
    },
    lastName:{
        type:String,
        required :true,
        trim:true,
    },
    password:{
      type:String,
      required:true,
    },
    accountType:{
      type:String,
      enum:["Admin","Student","Instructor"],
      required:true,

    },
    additionalDetails:{
        type:  mongoose.Schema.Types.ObjectId,
        required: true,
        ref:"Profile"
    },
    courses:[
        {
            type:  mongoose.Schema.Types.ObjectId,
            ref:"Courses"
        }
    ],
    image:{
        type:String,
        required:true,
    },
    courseProgress:[
        {
          type: mongoose.Schema.Types.ObjectId,
          ref:"CourseProgress", 
        }
    ],
    token: {
        type: String,
    },
    resetPasswordExpires: {
        type: Date,
    },
    approved: {
        type: Boolean,
        default: true,
    },
    active: {
        type: Boolean,
        default: true,
    },
    contactNumber:{
        type:Number,
        required:true,
        trim:true
    },
    refreshToken:{
        type:String,
    }


    


},
{
    timestamps:true
});

userSchema.pre("save",async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password,10)
    next()
})
userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password , this.password)
   }

userSchema.methods.generateAccessToken = function(){
    return jwt.sign(
        {
            _id:this._id,
            email:this.email,
        },
            process.env.ACCESS_TOKEN_SECRET,
            {
                expiresIn : process.env.ACCESS_TOKEN_EXPIRY
            }
        
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id:this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}



export const User = mongoose.model("User",userSchema)