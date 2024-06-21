import express from "express";
import dotenv from "dotenv";
import connectDB from "./DB/connect.db.js";
dotenv.config();
import authRoutes from "./Routes/auth.route.js";
const app = express();
//Middlewares
app.use(express.json());
// Routes
app.use("/api/auth", authRoutes);
// DB Connection
app.listen(process.env.PORT, connectDB());
