import mongoose, { Schema } from "mongoose";

const profileSchema  = new Schema({

   gender: {
      type:String,
      required:true,
    },

    DateOfBirth :{
        type:Date,
        required:true,
    },

    about:{
        type:String,
        trim:true,
    },
    PhoneNumber:{
        type:Number,
        trim:true,
    }
});

 export const Profile = mongoose.model('Profile',profileSchema);
