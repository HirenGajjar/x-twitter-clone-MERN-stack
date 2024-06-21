import jwt from "jsonwebtoken";

//Function receives two parameters userId and res
const generateTokenAndSetCookie = async (userId, res) => {
  // Sing token with userId and secret from .env which expires in 15 days
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "15d",
  });
  // Send cookie which has name of jwt and token just created
  res.cookie("jwt", token, {
    maxAge: 15 * 24 * 60 * 60 * 100,
    httpOnly: true,
    sameSite: "strict",
  });
};

export { generateTokenAndSetCookie };
