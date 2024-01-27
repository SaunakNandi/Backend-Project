//require('dotenv').config({path:})

// we are using dotenv because we want all pur environment variables to be available whenever our applications loads
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
  path: "./.env",
});
connectDB()
  .then(() => {
    app.listen(process.env.PORT || 4200, () => {
      console.log(`Server is running at port:${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongo db Connection Failed!! ", err);
  });

// import express from "express"
// const app=express()
// //ifi
// ;(async()=>{
//     try{
//         await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)
//         app.on("error",()=>{
//             console.log("error")
//             throw error
//         })

//         app.listen(process.env.PORT,()=>{
//             console.log(`App is listening on port ${process.env.PORT}`)
//         })
//     }
//     catch(error)
//     {
//         console.log(error)
//         throw error
//     }
// })()
