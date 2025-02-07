import mongoose, { Schema } from "mongoose";

const tagSchema = new Schema({

    name:{
        type:String,
        required:true,
        trim:true,
    },

    description:{
        type:String,
        required:true,
    },
    course:{
      type:mongoose.Schema.Types.ObjectId,
      ref:"Courses"
    }
})

export const Tag = mongoose.model("Tag",tagSchema)