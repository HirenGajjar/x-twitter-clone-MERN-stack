import express from "express";
import authRoutes from "./Routes/auth.route.js";
const app = express();
app.use("/api/auth", authRoutes);
app.listen(3000);
