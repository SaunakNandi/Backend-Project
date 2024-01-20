import mongoose from "mongoose";
import {DB_NAME} from "../constants.js"

const connectDB=async()=>{
    try {
        // catching responses after connection is done
        const connectionInstance= await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`)

        // connection.host tell us in which database we are connected (dev,prod or testing)
        console.log(`\n mongodb connected !! db host:${connectionInstance.connection.host}`)  
    } catch (error) {
        console.log("Mongodb connection error",error)

        // the current application is running on a process and this process is a reference of it which comes
        //  from nodejs
        process.exit(1) // [node process failure exit code 1]
    }
}
export  default connectDB