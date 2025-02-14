import mongoose, { isValidObjectId } from "mongoose";
import { Courses } from "../models/courses.model";
import { RatingAndReviews } from "../models/ratingandReviews.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";



const createRatingAndReviews = asyncHandler(async(req,res)=>{

   try {
     const userId = req?.user?._id;
 
     if(userId){
         throw new ApiError(400,"please relogin")
     }
 
     const{rating,reviews} = req.body;
 
     if(!rating || ! reviews){
         throw new ApiError(400,"please rate and give reviews")
     }
 
     const{courseId} = req.params;
 
     if(!isValidObjectId(courseId)){
         throw new ApiError(400,"invalid COurseID")
     }
  
 
     //check user is enrolled or not
     const isCourseEnrolled = await User.findOne({
         _id:courseId,
         studentEnrolled :{
            $elemMatch: {
               $eq:userId
             }
         }
     })
 
     if(!isCourseEnrolled){
         throw new ApiError(400,"student not enrolled")
     }
 
     //checking if the user has already reviewed
 
      const isAlreadyReviewed = await RatingAndReviews.findOne({
         user : userId,
         course : courseId
      })
      if(!isAlreadyReviewed){
         throw new ApiError(400,"user has already reviewd this course")
      }
 
      // creating the review
 
      const createReview = await RatingAndReviews.create({
         rating,
         reviews,
         course: courseId,
         user: userId
      })
 
      if(!createReview){
         throw new ApiError(400,"error in creating the ratings")
      }
 
      //updating the course
 
      const updateCourse = await Courses.findByIdAndUpdate(courseId,
         {
 
             $push:{
                 ratingAndReviews:createReview._id,
             }
      },{new:true}).populate("ratingAndReviews").exec();
 
      if(!updateCourse){
         throw new ApiError(400,"error in updatind the course")
      }
 
      return res
      .status(200)
      .json(new ApiResponse(200,createReview,"rating and review has been given successfully"))
 
 
   } catch (error) {
     throw new ApiError(500,error.message || "there has been some error in create rating")
   }


})

const findAverageRating = asyncHandler(async(req,res)=>{
   try {
     const{courseId} = req.params;
 
     if(!courseId){
         throw new ApiError(400,"invalid courseId")
     }
 
     const result = await RatingAndReviews.aggregate([
         {
             $match:{
                 course:new mongoose.Types.ObjectId(courseId)
             },
         },
         {
             $group:{
                 _id:null,
                 avgRating:{$avg:{$rating}}
             },
         },
     ])
 
     if(!result){
         throw new ApiError(400,"there is some error in aggreagtion pipepline")
     }
        
     if(!result.length >0){
         throw new ApiError(400,"no revies")
     }
     const averageRating = result[0].avgRating
 
     return res
     .status(200)
     .json(new ApiResponse(200,averageRating,"raverage rating found successfully"))
 
   } catch (error) {
    throw new ApiError(500,error.message || "there is error in findinf average rating function")
   }
})

const getAllReviews = asyncHandler(async(req,res)=>{
 

    // TODO: add aggreagte pipeline here with name and all reviews
    const allReviews = await RatingAndReviews.aggregate([
        {
          
        }
    ])
})


export {createRatingAndReviews,findAverageRating,getAllReviews}