import { Router } from "express";
import { changePassword, login, logout, sendOtp, signup } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";





const router = Router();
// router.use(verifyJWT);

router.route("/otp").post(sendOtp);
router.route("/register").post(signup);
router.route("/login").post(login);
router.route("/logout").post(verifyJWT,logout);
router.route("/change-Password").post(verifyJWT,changePassword);


export default router;