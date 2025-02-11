import mongoose, { Schema } from "mongoose";

const profileSchema  = new Schema({

   gender: {
      type:String,
      
    },

    DateOfBirth :{
        type:Date,
      
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
