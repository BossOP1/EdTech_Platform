import mongoose,{Schema} from "mongoose";

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
    ]
    


});

export const User = mongoose.model("User",userSchema)