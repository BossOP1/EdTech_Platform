import { Router } from "express";
import { createCourse, editCourse } from "../controllers/course.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";




const router = Router();

router.route("/create-course/c/:categoryId").post(
    upload.fields([{
        name:"thumbnail",
        maxCount:1,
    }]),
    verifyJWT,createCourse);
router.route("/edit-course").post(editCourse)

export default router;