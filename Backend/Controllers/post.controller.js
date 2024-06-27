import PostModel from "../DB/Models/post.model.js";
import UserModel from "../DB/Models/user.model.js";
import { v2 } from "cloudinary";
const createPostController = async (req, res) => {
  try {
    // Get the text for post
    const { text } = req.body;
    // Get the image if provided
    let { img } = req.body;
    // Get the user Id
    const userId = req.user._id.toString();
    // Check user exist or not
    const user = await UserModel.findById(userId);
    // If user not exist
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    // Check for empty post
    if (!text && !img) {
      return res.status(400).json({ message: "Empty post!" });
    }
    // Upload an image to cloudinary if provided
    if (img) {
      // Cloudinary sends the url for image
      const newPostImage = await v2.uploader.upload(img);
      // Assign uploaded image to image variable in DB
      img = newPostImage.secure_url;
    }
    // If everything is fine then create new post
    const newPost = new PostModel({ user: userId, text, img });
    // Save the post
    await newPost.save();
    res.status(200).json({ message: `New post created! ${newPost.text}` });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error!" });
  }
};
const deletePostController = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
const likeUnlikePostController = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
const commentPostController = async (req, res) => {
  try {
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
export {
  createPostController,
  deletePostController,
  likeUnlikePostController,
  commentPostController,
};
