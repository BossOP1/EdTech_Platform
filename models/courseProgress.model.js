import mongoose, { Schema } from "mongoose";

const courseProgressSchema = new Schema({

    courseId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Courses"
    },

    completeVideos : {
        type:mongoose.Schema.Types.ObjectId,
        ref:"SubSection",
    }

});

export const CourseProgress = mongoose.model("CourseProgress",courseProgressSchema);