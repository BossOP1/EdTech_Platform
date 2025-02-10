import { Tag } from "../models/tag.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";



const createTag = asyncHandler(async(req,res)=>{

   try {
     const{name,description} = req.body;
 
     if(!name || !description){
        throw new ApiError(400,"please fill the required details")
     }
 
     const tag = await Tag.create({
         name,
         description
     })
 
     if(!tag){
         throw new ApiError(500,"there is problem in createing tag in DB")
     }
 
     return res
     .status(200)
     .json(new ApiResponse(200,tag,"tag created suceessfully"))
 
   } catch (error) {
    throw new ApiError(400,error.message || "there is some error in creating the tag")
   }


})

const showAllTags = asyncHandler(async(req,res)=>{
      
     try {
         const allTags = await Tag.find({},{name:true , description:true})
   
         if(!allTags){
           throw new ApiError(400,"tags not found")
         }
   
         return res
         .status(200)
         .json(new ApiResponse(200,allTags,"all tags has been fetched successfully"))

     } catch (error) {
        throw new ApiError(500,"there is some problem in show all tags")
     }

})


export {createTag,showAllTags}