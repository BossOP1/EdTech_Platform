import { Router } from "express"
import { createCategory, showAllCategory } from "../controllers/category.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";



const router = Router();

router.route("/create").post(verifyJWT,createCategory);
router.route("/show-all").get(verifyJWT,showAllCategory);

export default router;
