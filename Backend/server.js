import express from "express";
import dotenv from "dotenv";
import connectDB from "./DB/connect.db.js";
dotenv.config();
import authRoutes from "./Routes/auth.route.js";
import userRoutes from "./Routes/user.route.js";
import cookieParser from "cookie-parser";
import { v2 } from "cloudinary";
const app = express();
//Cloudinary Configuration
v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware which is useful for authorization
app.use(cookieParser());
// Routes
//Auth routes
app.use("/api/auth/", authRoutes);
// users routes
app.use("/api/users/", userRoutes);

// DB Connection
app.listen(process.env.PORT, connectDB());
