import { isValidObjectId } from "mongoose";
import { Category } from "../models/category.model";
import { Courses } from "../models/courses.model";
import { User } from "../models/user.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import { uploadOnCloudinary } from "../utils/Cloudinary";




const createCourse = asyncHandler(async(req,res)=>{
   try {
      
     const{courseName,courseDescription,whatYouWillLearn,price,tag:_tag , instructions:_instructions} = req.body
 
     const {categoryId} = req.params
 
     if(!isValidObjectId(categoryId)){
         throw new ApiError(400,"invalid category id")
     }
 
     if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tag.length || ! instructions.length || !category){
         throw new ApiError(400,"please fill all the fields")
     }
 
      const thumbnailLocalPath = req?.files?.thumbnail[0].path;
 
      if(thumbnailLocalPath){
         throw new ApiError(400,"thumbnail does not exist")
      }
 
     const thumbnail = await uploadOnCloudinary(thumbnailLocalPath);
 
     if(!thumbnail){
         throw new ApiError(400,"some error in uploading thumbnail")
     }
 
     const tag = JSON.parse(_tag);
     const instructions = JSON.parse(_instructions);
 
     if(!tag || !instructions){
         throw new ApiError(400,"there is some error in parsing in tag or instrutcuons")
     }
 
     const userId  = req?.user?._id;
 
     if(!userId){
        throw new ApiError(400,"invalid userID")
     }
 
     const isInstructor =  await User.findById(userId,{
         
         accountType:"Instructor"
     })
     if(!isInstructor){
         throw new ApiError(400,"only user can create course")
     }
 
     const isCategoryValid = await Category.findById({
         categoryId
     })
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
         tag,
         instructions,
         thumbnail:thumbnail?.url || "",
     })
 
     if(!course){
         throw new ApiError(400,"course not created")
     }
 
     // adding course to user(instructor)
 
     const instructorUser = await User.findByIdAndUpdate(isInstructor._id,{
            $push:{
             courses :course._id
            }
     },{new:true})
 
     if(!instructorUser){
         throw new ApiError(400,"error in updating instuctor user with course")
     }
 
     // adding course to category id
 
     const updateCategoryCourse = await Category.findById(categoryId,{
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
    const courseId = req.params;

    if(!isValidObjectId(courseId)){
        throw new ApiError(500,"invalid CourseID")
    }


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
    const{courseId} = req.params

    if(!isValidObjectId(courseId)){
        throw new ApiError(400,"invalid object id")
    }

    const findDeleteCourse = await Courses.findById(courseId);

    if(!findDeleteCourse){
        throw new ApiError(400,"course couldnt found")
    }

    
})




export{createCourse,editCourse,getAllCourses,getInstructorCourse}