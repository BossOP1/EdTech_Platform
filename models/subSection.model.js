import mongoose, { Schema } from "mongoose";

const subSectionSchema = new Schema({
    
   title:{
    type:String,
    required:true,
    trim:true,
   },
  timeDuration:{
    type:String,
  },

  description:{
    type:String,
  },

  videoUrl:{
    type:String,
  }
})

export const SubSection = mongoose.model("SubSection",subSectionSchema)


