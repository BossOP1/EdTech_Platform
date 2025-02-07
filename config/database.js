const mongoose = require("mongoose")
require("dotenv").config();

exports.connect = () =>{
    mongoose.connecct(process.env.MONGODB_URL,{
        useNewUrlParser:true,
        useUnifiedTopology:true
    })
    .then(()=> console.log("DB connected Successfully"))
    .catch((error)=>{
        console.log("DB connection failed")
        console.error(error)
        process.exit(1);
    })
}