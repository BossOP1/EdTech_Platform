
import mongoose, { Schema } from "mongoose";

const coursesSchema = new Schema({

    courseName:{
        type:String,
        trim:true,
    },

    courseDescription:{
        type:String,
        trim:true,
    },

     instructor:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
     },
     whatYouWillLearn:{
        type:String,
        required:true,
        trim:true,
     },
     courseContent:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Section"
     }],

     ratingAndReviews:[{
        type: mongoose.Schema.Types.ObjectId,
        ref:"RatingAndReviews",
     }],
     price:{
        type:Number,
        required:true,
     },
     thumbnail:{
        type:String,
        required:true,
     },
     tag:{
        type:String,
        req:true
     },
     studentEnrolled:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
     },
     category:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Category"
     }
},
{
    timestamps:true,
})

export const Courses = mongoose.model("Courses",coursesSchema)