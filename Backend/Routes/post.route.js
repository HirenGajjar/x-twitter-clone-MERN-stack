import express from "express";
const router = express.Router();
import {
  createPostController,
  deletePostController,
  likeUnlikePostController,
  commentPostController,
} from "../Controllers/post.controller.js";
import { protectedRoute } from "../Middleware/protectedRoute.js";

// To create post
router.post("/create", protectedRoute, createPostController);
// Delete post
router.delete("/:id", protectedRoute, deletePostController);
// Like post
// router.post("/like/:id", protectedRoute, likeUnlikePostController);
// comment post
// router.post("/comment/:id", protectedRoute, commentPostController);
export default router;
