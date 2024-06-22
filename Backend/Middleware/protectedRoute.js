import UserModel from "../DB/Models/user.model.js";
import jwt from "jsonwebtoken";
const protectedRoute = async (req, res, next) => {
  try {
    // get token from cookie
    const token = req.cookies.jwt;

    // if token is not provided that means user needs to login
    if (!token) {
      return res.status(401).json({ message: "Login to explore more!" });
    }
    // decode the token using verify
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // if decoded token is invalid or expired token
    if (!decoded) {
      return res.status(401).json({ message: "Invalid token!" });
    }
    // if valid token is decoded that means we have to find a user in database then retrieve the user id from database and exclude the password
    const user = await UserModel.findById(decoded.userId).select("-password");
    // If in case no user
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    // and add it to req body
    // It is a middleware between FE and BE which checks that user is authorized or not , if authorized then send the req object to BE and call next
    req.user = user;
    next();
  } catch (error) {
    return res.status(500).json({ message: "Internal server error!" });
  }
};
export { protectedRoute };
