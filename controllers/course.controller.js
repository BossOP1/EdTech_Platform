import { isValidObjectId } from "mongoose";
import { Category } from "../models/category.model.js";
import { Courses } from "../models/courses.model.js";
import { Section } from "../models/section.model.js";
import { SubSection } from "../models/subSection.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import convertSecondsToDuration from "../utils/convertSeconds.js";



const createCourse = asyncHandler(async(req,res)=>{
   try {
      
     const{courseName,courseDescription,whatYouWillLearn,price,tag:_tags , instructions:_instructions} = req.body
    // console.log("courseName",courseName)
     const {categoryId} = req.params
 
     if(!isValidObjectId(categoryId)){
         throw new ApiError(400,"invalid category id")
     }
 
     if(!courseName || !courseDescription || !whatYouWillLearn || !price || !_tags.length || !_instructions.length){
         throw new ApiError(400,"please fill all the fields")
     }
 
      const thumbnailLocalPath = req?.files?.thumbnail[0].path;
      //console.log("thumbnailLocalPath",thumbnailLocalPath)
      
 
      if(!thumbnailLocalPath){
         throw new ApiError(400,"thumbnailLocalPath does not exist")
      }
 
     const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
 
     if(!thumbnail){
         throw new ApiError(400,"some error in uploading thumbnail")
     }
 
     const tagData = JSON.parse(_tags);
   // console.log("tagData",tagData)
 

     const instructionsData = JSON.parse(_instructions);
    // console.log("instructionsData",instructionsData)
 
     if(!tagData || !tagData){
         throw new ApiError(400,"there is some error in parsing in tag or instrutcuons")
     }
 
     const userId  = req?.user?._id  
 
     console.log("userId",userId)
     if(!userId){
        throw new ApiError(400,"invalid userID")
     }
 
     const isInstructor =  await User.findById(userId,{
         
         accountType:"Instructor"
     })
     if(!isInstructor){
         throw new ApiError(400,"only user can create course")
     }
 
     const isCategoryValid = await Category.findById(
         categoryId
)

//console.log("isCategoryValid",isCategoryValid)
     if(!isCategoryValid){
         throw new ApiError(400,"no such category exist")
     }
 
     const course = await Courses.create({
         courseName,
         courseDescription,
         whatYouWillLearn,
         price,
         instructor:isInstructor._id,
         category:isCategoryValid._id,
         tag:tagData,
         instructions:instructionsData,
         thumbnail:thumbnail?.url || "",
     })
 
     if(!course){
         throw new ApiError(400,"course not created")
     }

    // console.log("===>",course)
 
     // adding course to user(instructor)
 
     const instructorUser = await User.findByIdAndUpdate(isInstructor._id,{
            $push:{
             courses :course._id
            }
     },{new:true})

    // console.log("!!!!!!!!!",instructorUser)
 
     if(!instructorUser){
         throw new ApiError(400,"error in updating instuctor user with course")
     }
 
     // adding course to category id
     //console.log("**********")
 
     const updateCategoryCourse = await Category.findByIdAndUpdate(categoryId,{
         $push:{
             course:course._id
         }
     },{
         new:true
     })

    
 
     if(!updateCategoryCourse){
         throw new ApiError(400,"error in updating course to the category")
     }

     res
     .status(200)
     .json(new ApiResponse(200,course,"course has been created successfully"))
 
   } catch (error) {
    throw new ApiError(500,error.message || "errror in create course function")
   }

})

const editCourse = asyncHandler(async(req,res)=>{
    try {
        const{courseId} = req.params;
        if(!isValidObjectId(courseId)){
            throw new ApiError(400,"invalid CourseId")
        }
        const updates = req.body;
    
        if(!updates){
            throw new ApiError(400,"no updates found")
        }
        const findCourse = await Courses.findById(courseId);
        if(!findCourse){
            throw new ApiError(400,"no course found")
        }
        if(req.files){
            const updateThumbnailLocalPath =  req?.files?.thumbnail[0].path;
            if(!updateThumbnailLocalPath){
                throw new ApiError(400,"no avatar found")
            }
            
    
            const updatedThumbnail = await uploadOnCloudinary(updateThumbnailLocalPath)
    
            if(!updatedThumbnail){
                throw new ApiError(400,"thumbnail not uploaded")
            }
    
            findCourse.thumbnail = updatedThumbnail.url;
    
    
        }
    
        for (const key in updates){
    
            if(updates.hasOwnProperty(key)){
            if(key == tag || key == instructions){
               findCourse[key] = JSON.parse(updates[key])
            }
            else{
                findCourse[key] = updates[key]
            }
        }
        }
    
        const finalCourse = await findCourse.save()
         // Some changes 
        if(!finalCourse){
           throw new ApiError(400,"error in saving finalcourse")
        }
         
        res
        .status(200)
        .json(new ApiResponse(200,finalCourse,"course has been updated successfully"))
        
    } catch (error) {
        throw new ApiError(500,error.message || "error in edit Course")
    }
})

const getAllCourses = asyncHandler(async(req,res)=>{
   
    try {
        const findAllCourses = await Courses.find({},
            {
                courseName: 1,
            price: 1,
            thumbnail: 1,
            instructor: 1,
            ratingAndReviews: 1,
            studentsEnrolled: 1,
            })
            .populate("instructor").exec()
    
            if(!findAllCourses){
                throw new ApiError(400,"error in find all courses")
            }
            
            return res
                   .status(200)
                   .json(new ApiResponse(200,findAllCourses,"all courses has been fetched successfully"))
    } catch (error) {
        throw new ApiError(500,error.message || "error in getallcourses function")
    }
})

const getCourseDetails = asyncHandler(async(req,res)=>{
    try {
        const courseId = req.params;
    
        if(!isValidObjectId(courseId)){
            throw new ApiError(500,"invalid CourseID")
        }
    
        const courseDetails = await Courses.findById(courseId)
        .populate({
            path:"Instructor",
            populate:{
                path:"additionalDetails"
            }
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path:"courseContent",
            populate:{
                path:"subSections",
                select:"-videoUrl"
            }
        }).exec()
    
        let totalDurationInSeconds = 0;
    
        courseDetails.courseContent.forEach((content)=>{
          if(content.subSections && Array.isArray(content.subSections)){
            content.subSections.forEach((subSection)=>{
               const timeDurationInSeconds = parseInt(subSection.totalDuration) || 0;
                 totalDurationInSeconds += timeDurationInSeconds;
            })
          }
        })
    
        const totalDuration = convertSecondsToDuration(totalDurationInSeconds)
         
        if(!totalDuration){
            throw new ApiError(400,"error in calculating Total Duration")
        }
        
    
        return res
        .status(200)
        .json(new ApiResponse(200,{courseDetails , totalDuration},"course details has been fetched successfilly"))
    } catch (error) {
        throw new ApiError(500,error.message || "error in getting course details")
    }
})

const getFullCourseDetails = asyncHandler(async(req,res)=>{

    const courseId = req.params;
    const userId = req.user?._id;

    if(!isValidObjectId(courseId)){
        throw new ApiError(500,"invalid CourseID")
    }

     const courseDetails = await Courses.findById(courseId)
        .populate({
            path:"Instructor",
            populate:{
                path:"additionalDetails"
            }
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate({
            path:"courseContent",
            populate:{
                path:"subSections",
                select:"-videoUrl"
            }
        }).exec()

        // waste
     
})


const getInstructorCourse = asyncHandler(async(req,res)=>{

   try {
     const instructorId = req.params;
 
     if(!isValidObjectId(instructorId)){
         throw new ApiError(400,"invalid Instructor id")
     }
 
     const isInstructor = await Courses.find({
         instructor: instructorId
     }).sort({createdAt :-1})
 
     if(!isInstructor){
         throw new ApiError(400,"error in getting instructor courses")
     }
 
     return res
     .status(200)
     .json(new ApiResponse(200,isInstructor,"instructor courses fetched successfully"))

   } catch (error) {
    throw new ApiError(500,error.message || "error in getInstructorCourse")
   }
})

const deleteCourse = asyncHandler(async(req,res)=>{
   try {
     const{courseId} = req.params
 
     if(!isValidObjectId(courseId)){
         throw new ApiError(400,"invalid object id")
     }
 
     const findDeleteCourse = await Courses.findById(courseId);
 
     if(!findDeleteCourse){
         throw new ApiError(400,"course couldnt found")
     }
 
 
    // to delete CourseContent (section and subsections)
     const courseSections  =  findDeleteCourse.courseContent;
 
     const section = await Section.find(
         {_id:
             {$in:courseSections}
     }
     )
 
     if(!section){
         throw new ApiError(400,"no section found to delete")
     }
 
     const subSectionsIds = section.flatMap(section => section.subSections)
 
     if(!subSectionsIds){
         throw new ApiError(400,"no subsections found to delete")
     }
 
     if(subSectionsIds.length > 0){
         await SubSection.deleteMany(
             {
                 $in:{
                     $in:subSectionsIds
                 }
             }
         )
     }
 
     if (courseSections.length > 0) {
       await Section.deleteMany({ _id: { $in: courseSections } });
       }
 
     // deleting student enrolled   in thr course
       const deleteStudentEnrolled = findDeleteCourse.studentsEnrolled;
 
       if (deleteStudentEnrolled.length > 0) {
         await User.deleteMany({
           _id: { $in: deleteStudentEnrolled }
         });
       }
 
       await Courses.findByIdAndDelete(findDeleteCourse._id);

       res
       .status(200)
       .json(new ApiResponse(200,{},"course has been deleted successfully"))
 
   } catch (error) {
    throw new ApiError(500,error.message ||"some error in deleteing course")
   }
   

})




export{createCourse,editCourse,getAllCourses,getInstructorCourse,deleteCourse,getCourseDetails}