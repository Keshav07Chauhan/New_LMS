import dotenv from "dotenv"
import connectDB from "./db/index.js";
import { app } from "./app.js";

//it should be on the top of the index file as early as possible, .env file should be accessed by all files.
dotenv.config({          
    path: './.env'
})

connectDB()
.then(()=>{
    app.on("error",(error)=>{
        console.log("Err: App is not listening",error);
        throw error;
    })
    app.listen(process.env.PORT,()=>{
        console.log(`Server is running at port : ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("mongoDB connection failed: ",err);
    throw err;
})