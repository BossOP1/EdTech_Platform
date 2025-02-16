import mongoose, { Schema } from "mongoose";


const courseProgressSchema = new Schema({

    courseId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Courses"
    },

    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    completeVideos : [{
        type:mongoose.Schema.Types.ObjectId,
        ref:"SubSection"
    }],


})

export const CourseProgress = mongoose.model("CourseProgress",courseProgressSchema)