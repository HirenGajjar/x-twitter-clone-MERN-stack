import express from "express";
import dotenv from "dotenv";
import connectDB from "./DB/connect.db.js";
dotenv.config();
import authRoutes from "./Routes/auth.route.js";
import cookieParser from "cookie-parser";
const app = express();
//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cookie parser middleware which is useful for authorization
app.use(cookieParser());
// Routes

app.use("/api/auth/", authRoutes);
// DB Connection
app.listen(process.env.PORT, connectDB());
