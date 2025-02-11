import dotenv from "dotenv"
import { app } from "./App.js"
import connectDB from "./config/database.js"

dotenv.config({
    path:'./.env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 9000,()=>{
        console.log(`Server is runnning at port : ${process.env.PORT}`)
    })
})
.catch((e)=>{
    console.log("DB connection failed",e)
})
