import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"800kb"}))      //16kb
app.use(express.urlencoded({extended: true, limit: "800kb"}))   //16kb
app.use(express.static("public"))
app.use(cookieParser())


//routes import
import userRouter from "./routes/user.routes.js"
import subjectRouter from "./routes/subject.routes.js"
import postRouter from "./routes/post.routes.js"
import resourceRouter from "./routes/resource.routes.js"
import attendenceRouter from "./routes/attendence.routes.js"

//routes declaration
app.use("/api/v1/users",userRouter)
app.use("/api/v1/subjects",subjectRouter)
app.use("/api/v1/posts",postRouter)
app.use("/api/v1/resources",resourceRouter)
app.use("/api/v1/attendences",attendenceRouter)


export {app}