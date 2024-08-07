import PostModel from "../DB/Models/post.model.js";
import UserModel from "../DB/Models/user.model.js";
import NotificationModel from "../DB/Models/notification.model.js";
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
    // We get the id of the post from params which we first look at the DB if it exist or not
    const post = await PostModel.findById(req.params.id);

    // If post does not exist
    if (!post) {
      return res.status(400).json({ message: "Invalid post!" });
    }
    // Check if the logged in user is not the owner of post
    if (post.user.toString() !== req.user._id.toString()) {
      // User is not authorized to delete the post
      return res.status(400).json({ message: "Unable to delete!" });
    }
    // If user is authorized and if post has an image, then delete the image from cloudinary
    if (post.img) {
      // Get the image id
      const imgId = post.img.split("/").pop().split(".")[0];
      // Delete the image
      await v2.uploader.destroy(imgId);
    }
    // Then find the post id and delete from Database
    await PostModel.findByIdAndDelete(req.params.id);
    res.status(202).json({ message: "Post deleted!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
const likeUnlikePostController = async (req, res) => {
  try {
    // get user id
    const userId = req.user._id;

    // get post id, here we are getting id as a request param and we are renaming it to postId
    const { id: postId } = req.params;

    // check if post exist or not
    const post = await PostModel.findById(postId);

    // If no post exist
    if (!post) {
      return res.status(400).json({ message: "Invalid operation!" });
    }
    // If post exist
    // Then check if user already had liked it or not
    const userLikedPost = post.likes.includes(userId);
    // If yes then unlike the post
    if (userLikedPost) {
      // unlike the post
      await PostModel.updateOne({ _id: postId }, { $pull: { $likes: userId } });

      res.status(200).json({ message: "Uniked post!" });
    }
    // if not then like the post
    else {
      // Add like in DB
      post.likes.push(userId);
      // Save changes
      await post.save();
      // Make notification
      // from, to and type
      const notification = new NotificationModel({
        from: userId,
        to: post.user,
        type: "like",
      });
      // Save notification
      await notification.save();
      res.status(200).json({ message: "Post liked!" });
    }
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
const commentPostController = async (req, res) => {
  try {
    // get text from body
    const { text } = req.body;
    // Get the post id
    const postId = req.params.id;
    // Get the user id
    const user = req.user._id;
    // Check if text is empty or not
    if (!text) {
      return res.status(400).json({ message: "Empty text field!" });
    }
    // Check if post is in DB or not
    const post = await PostModel.findById(postId);
    if (!post) {
      return res.status(400).json({ message: "Invalid action!" });
    }
    // Create comment
    const comment = { user: user._id, text };
    // ADd comment to array
    post.comments.push(comment);
    // Save comment to DB
    await post.save();
    res.status(200).json({ message: "Commented!" });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error!" });
  }
};
// Get all posts controller
const getAllPostsController = async (req, res) => {
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
  getAllPostsController,
};
