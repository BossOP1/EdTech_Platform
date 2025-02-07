import mongoose, { Schema } from "mongoose";

const ratingAndReviewsSchema = new Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    rating:{
        type:Number,
    },

    reviews:{
        type:String,
    }

},{timestamps:true}
)

export const RatingAndReviews = mongoose.model("RatingAndReviews",ratingAndReviewsSchema)