import jwt from "jsonwebtoken";

//Function receives two parameters userId and res
const generateTokenAndSetCookie = async (userId, res) => {
  // Sing token with userId and secret from .env which expires in 15 days
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  // Send cookie which has name of jwt and token just created
  res.cookie("jwt", token, {
    // Here are few other things to send with token
    // Max age is same as expires in 15 days and 15 * 24 * 60 * 60 * 100 makes it is in milliseconds
    maxAge: 15 * 24 * 60 * 60 * 100,
    // It prevents the XSS attacks cross site scripting
    httpOnly: true,
    // Controls when cookies are sent with cross-site requests
    //It helps mitigate Cross-Site Request Forgery (CSRF) attacks by ensuring that the cookie is only sent in requests originating from the same site.
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });
};

export { generateTokenAndSetCookie };
