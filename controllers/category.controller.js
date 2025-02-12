import { Category } from "../models/category.model";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";




const createCategory = asyncHandler(async(req,res)=>{

   try {
     const{name,description} = req.body;
 
     if(!name || !description){
         throw new ApiError(400,"all fields are required")
     }
 
     const category = await Category.create({
         name,
         description
     })
 
     if(!category){
         throw new ApiError(400,"there is some problem in creating the category in db")
     }
 
     return res
     .status(200)
     .json(new ApiResponse(200,category,"category has been created successfully"))
   } catch (error) {
    throw new ApiError(500,error.message || "there is some error in creating category")
   }
})

const showAllCategory = asyncHandler(async(req,res)=>{

    const allCategory = await Category.find({
        _id
    });

    if(!allCategory){
        throw new ApiError(400,"there is some error in finding all categories")
    }

    return res
    .status(200)
    .json(new ApiResponse(200,allCategory,"all category are displayed successfully"))

})

// TODO: create category page details for filtering


export {createCategory,showAllCategory}