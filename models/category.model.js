import mongoose, { Schema } from "mongoose";

const categorySchema = new Schema({

    name:{
        type:String,
        required:true,
        trim:true,
    },

    description:{
        type:String,
        required:true,
    },
    course:[{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Courses"
    }]
})

export const Category = mongoose.model("Category",categorySchema)