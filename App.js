import cookieParser from "cookie-parser";
import express from "express";
import cors from "cors"

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))

app.use(express.json({limit:"16kb"}))

app.use(express.urlencoded({extended:true , limit : "16kb"}))


app.use(express.static("public"))

app.use(cookieParser())


import userRouter from "./routes/user.routes.js"
import courseRouter from "./routes/course.routes.js"
import categoryRouter from "./routes/category.routes.js"

app.use("/api/v2/users",userRouter)
app.use("/api/v2/course",courseRouter)
app.use("/api/v2/category",categoryRouter)

export {app}