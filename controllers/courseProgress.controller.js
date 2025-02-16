import { application } from "express";
import { CourseProgress } from "../models/courseProgress";
import { SubSection } from "../models/subSection.model";
import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";



const updateCourseProgress = asyncHandler(async(req,res)=>{
     
    try {
         const{courseId,subSectionId} = req.params;
    
         const userId = req.user?._id
    
         const subSection = await SubSection.findById(subSectionId);
    
          if(!subSection){
            throw new ApiError(400,"subsection not found");
          }
         
          const progress = await CourseProgress.findOne({
            userId : userId,
            courseId:courseId
          })
    
          if(!progress){
            throw new ApiError(400,"progress not found")
          }
    
          if(progress.completedVideos.includes(subSectionId)){
            throw new ApiError(400,"already subsections pushed")
          }
    
          progress.completedVideos.push(subSectionId)
    
          await progress.save();
    
          return res
          .status(200)
          .json(200,{},"courseprogress has been pushed successfully")
    
    } catch (error) {
        throw new ApiError(500,error.message || "error in upgrading progress")
    }


})

export {updateCourseProgress}