import express from "express";
import {
  getMe,
  signupController,
  logoutController,
  loginController,
} from "../Controllers/auth.controller.js";
import { protectedRoute } from "../Middleware/protectedRoute.js";
const router = express.Router();
// The /me route is a route that gives the current route if user is logged in and it is protected with middleware which checks it with jwt
router.get("/me", protectedRoute, getMe);
router.post("/signup", signupController);
router.post("/login", loginController);
router.post("/logout", logoutController);
export default router;
