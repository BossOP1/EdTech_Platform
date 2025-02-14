import { isValidObjectId } from "mongoose";
import { Section } from "../models/section.model";
import { SubSection } from "../models/subSection.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/Cloudinary";



const createSubSection = asyncHandler(async(req,res)=>{

    try {
         const{title,description} = req.body;
         const{sectionId} = req.params;
    
    
         if(!sectionId|| !title || !description || !video){
            throw new ApiError(400,"please provide all details")
         }
         
         const videofileLocalPath = await req.files?.video[0]?.path;
    
         if(!videofileLocalPath){
            throw new ApiError(400,"video file not found")
         }
    
         const uploadVideo = await uploadOnCloudinary(videofileLocalPath);
         
         if(!uploadVideo){
            throw new ApiError(400,"there is some error in oploading video file to cloudinary")
         }
    
         const subSection = await SubSection.create({
            title,
            description,
            videoUrl : video?.url || "",
    
         })
    
         if(!subSection){
            throw new ApiError(400,"there is some error in creating subSection db")
         }
              
         const updateSection = await Section.findByIdAndUpdate(sectionId,
            {
                $push:{
                  subSection: subSection._id 
                },
            },
            {new :true}
            ).populate("subSection").exec();

            if(!updateSection){
                throw new ApiError(400,"there is an error in updating the section")
            }

    
         return res
         .status(200)
         .json(new ApiResponse(200,subSection,"subSection has been created successfully"))
    
    } catch (error) {
        throw new ApiError(500,error.message || "there has been some error in createSubsection")
    }
})

const updateSubSection = asyncHandler(async(req,res)=>{

    try {
        const{sectionId , subSectionId } = req.params;
         const{title , description} = req.body;
    
        if(!isValidObjectId(sectionId)){
            throw new ApiError(400,"please enter valid sectionID")
        }
    
        if(!isValidObjectId(subSectionId)){
            throw new ApiError(400,"please enter valid SUb-sectionID")
    
        }
             
        let updatedVideoUrl = null;
        if (req?.files?.video?.[0]?.path) {
            const uploadedVideo = await uploadOnCloudinary(req.files.video[0].path);
            if (!uploadedVideo) {
                throw new ApiError(400, "Error uploading video");
            }
            updatedVideoUrl = uploadedVideo.url;
        }
    
        if(!title || !description){
       throw new ApiError(400,"please fill all required values")
        }
    
        const updateSubSection = await SubSection.findByIdAndUpdate(subSectionId,{
              
            $set:{
                title: title ?? "$title",  // Keep old title if not provided
                description: description ?? "$description",  // Keep old description if not provided
                ...(updatedVideoUrl && { videoUrl: updatedVideoUrl })  // Update video URL only if a new video is uploaded
    
            },
           
        },
        { new: true }
        )
    
        if(!updateSubSection){
            throw new ApiError(400,"Subsection to be updated does not found or some error in updating")
        }
    
   

        const updateSection = await Section.findById(sectionId).populate(
            "updateSubSection"
          ).exec()

          if(!updateSection){
          throw new ApiError(400,"section cant be updated")
          }

    
        return res
        .status(200)
        .json(new ApiResponse(200,updateSubSection,"the subsection has been updated successfully"))
    
    } catch (error) {
        throw new ApiError(500,error.message || "there is some error in updatins sunsection")
    }
})

const deletedSubSection = asyncHandler(async(req,res)=>{
   
    try {
        const{sectionId,subSectionId} = req.params;
    
        if(!isValidObjectId(sectionId)){
            throw new ApiError(400,"invalid Section ID")
        }
    
        if(!isValidObjectId(subSectionId)){
            throw new ApiError(400,"invalid SubsectionID")
        }
    

       const deleteSubSectionFromSection = await Section.findByIdAndUpdate(sectionId,
        {
            $pull:{
                subSection : subSection._id
            }
        }
        ).exec()

        if(!deleteSubSectionFromSection){
            throw new ApiError(400,"deleteSubsection fromsection error")
        }
    
        const subSection  = await SubSection.findByIdAndDelete(subSectionId);
    
        if(!subSection){
            throw new ApiError(400,"no subsection found")
        }
    
        return res
        .status(200)
        .json(new ApiResponse(500,{},"subsection has been deleted successfully"))
    
    } catch (error) {
        throw new ApiError(500,error.message || "there is some error in deleting subsection")
    }
})

export {createSubSection,updateSubSection,deletedSubSection}