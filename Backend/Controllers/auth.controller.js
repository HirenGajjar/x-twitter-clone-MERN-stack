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
// Sing in controller
const loginController = async (req, res) => {
  try {
    //get username password
    const { username, password } = req.body;

    // Check if user exist or not
    const user = await UserModel.findOne({ username });

    // Check correct password with hashing
    // Here we compare the user entered password to the password being stored in database which is hashed and compare method does it for use
    /* We have to compare the password with existed password in database or with an empty string as if user entered an undefined password then we cannot compare to password so we compare it to "" an empty string */
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );

    // If password or username is wrong
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid username or password!" });
    }
    // if valid username and password then generate token
    generateTokenAndSetCookie(user._id, res);
    //send response
    res.status(200).send({
      _id: user._id,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
      profileImage: user.profileImage,
      coverImage: user.coverImage,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error!" });
  }
};
const logoutController = async (req, res) => {
  try {
    // Make cookie age to 0
    res.cookie("jwt", { maxAge: 0 });
    res.status(200).json({ message: "Logout!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error!" });
  }
};

const getMe = async (req, res) => {
  try {
    // If the protected Route middleware has worked and user is authorized then this route give the user information except password

    const user = await UserModel.findById(req.user._id).select("-password");

    res.status(200).json(user);
  } catch (error) {
    console.log("inside the controller");
    res.status(500).json({ message: "Internal server error!" });
  }
};
export { loginController, signupController, logoutController, getMe };
