import mongoose, { Schema } from "mongoose";

const ratingAndReviewsSchema = new Schema({

    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },

    rating:{
        type:Number,
        required:true,
    },

    reviews:{
        type:String,
        required:true,
    }

},{timestamps:true}
)
ratingAndReviewsSchema.plugin(aggregatePaginate);

export const RatingAndReviews = mongoose.model("RatingAndReviews",ratingAndReviewsSchema)