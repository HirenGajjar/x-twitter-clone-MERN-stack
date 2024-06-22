import UserModel from "../DB/Models/user.model.js";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../Lib/Utils/generateToken.js";
// Signup controller
const signupController = async (req, res) => {
  try {
    // Get all the values
    const { fullname, username, email, password } = req.body;
    // Regex for email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    //Email validation
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email!" });
    }
    //Check for existing user
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username not available!" });
    }
    // Check for existing email
    const existingEmail = await UserModel.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email already exist!" });
    }
    //Check password length
    if (password.length < 6) {
      res
        .status(400)
        .json({ error: "Password must be at least 6 character long!" });
    }
    // Hash password
    // Salt
    const salt = await bcrypt.genSalt(10);
    // Hash password
    const hashPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = new UserModel({
      fullname,
      username,
      password: hashPassword,
      email,
    });
    // once new user is signed up generate jsonwebtoken
    if (newUser) {
      // This function creates the token
      generateTokenAndSetCookie(newUser._id, res);
      // Save new user to DB
      await newUser.save();
      res.status(201).json({
        _id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        followers: newUser.followers,
        following: newUser.following,
        profileImage: newUser.profileImage,
        coverImage: newUser.coverImage,
      });
    } else {
      res.status(400).json({ message: "Invalid user data" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error!" });
  }
};
const signinController = async (req, res) => {
  try {
  } catch (error) {}
};
const loginController = async (req, res) => {
  try {
  } catch (error) {}
};

export { signinController, signupController, loginController };
