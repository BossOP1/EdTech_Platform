import { isValidObjectId } from "mongoose";
import { Section } from "../models/section.model";
import { SubSection } from "../models/subSection.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";



const createSection = asyncHandler(async(req,res)=>{

    try {
        const{sectionName} = req.body;
        const{courseId} = req.params;
    
        if(!isValidObjectId(courseId)){
            throw new ApiError(400,"invalid course ID")
        }
    
        if(!sectionName){
            throw new ApiError(400,"please provide title for section")
        }
    
        const section = await Section.create({
            sectionName,
        })
    
        if(!section){
            throw new ApiError(400,"error in Section Database")
        }
    
        // TODO: to add this section to course
    
        return res
        .status(200)
        .json(new ApiResponse(200,section,"new section has been created successfully"))
    } catch (error) {
        throw new ApiError(500,error.message || "there is some error in createSection")
    }


})

const updateSection = asyncHandler(async(req,res)=>{

   try {
     const{sectionName} = req.body;
     const{courseId} = req.params;
     const{sectionId} = req.params;
 
     if(!sectionName){
         throw new ApiError(400,"please provide details required")
     }
 
     if(!isValidObjectId(courseId)){
         throw new ApiError(400,"incalid courseID")
     }
 
     if(!isValidObjectId(sectionId)){
         throw new ApiError(400,"invalid Section ID")
     }
 
     // TODO: update course
 
     const updateSection = await Section.findByIdAndUpdate(sectionId,{
         $set:{
             sectionName,
         }
     },{new:true}
     )
 
     if(!updateSection){
         throw new ApiError(400,"error in updating file in DB")
     }
 
     return res
     .status(200)
     .json(new ApiResponse(200,updateSection,"section has been updated successfully"))
 
   } catch (error) {
      throw new ApiError(500,error.message || "error in updateSection")
   }

})

const deleteSection = asyncHandler(async(req,res)=>{
   try {
     const{courseId,sectionId} = req.params;
 
     if(!isValidObjectId(courseId)){
         throw new ApiError(400,"incalid courseID")
     }
 
     if(!isValidObjectId(sectionId)){
         throw new ApiError(400,"invalid Section ID")
     }
 
     //TODO to delete it from course
 
     const section = await Section.findById(sectionId);
 
     if(!section){
         throw new ApiError(400,"there is some error in deleting the section")
     }
 
     await SubSection.deleteMany({_id:{$in: section.subSection}})
     await Section.findByIdAndDelete(sectionId)
 
     return res
     .status(200)
     .json(new ApiResponse(200,{},"section has been deleted successfully"))
 
 
   } catch (error) {
    throw new ApiError(500,error.message || "some error in delete section")
   }
})


export {createSection,updateSection,deleteSection}