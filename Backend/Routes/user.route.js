import express from "express";
import {
  getUserProfileController,
  updateUserProfileController,
  getSuggestedUserController,
  followUnfollowUserController,
} from "../Controllers/user.controller.js";
import { protectedRoute } from "../Middleware/protectedRoute.js";
const router = express.Router();

//Routes
router.get("/profile/:username", protectedRoute, getUserProfileController);
router.get("/suggested", protectedRoute, getSuggestedUserController);
router.post("/follow/:id", protectedRoute, followUnfollowUserController);
// router.post("/update", protectedRoute, updateUserProfileController);
export default router;
