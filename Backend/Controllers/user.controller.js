import UserModel from "../DB/Models/user.model.js";

const getUserProfileController = async (req, res) => {
  // If the user is authorized by protected route middleware then here user can get the profile
  // Get username from params
  const { username } = req.params;
  console.log(username);
  try {
    //once we get the username from params here is more info from db except the password for profile page
    const user = await UserModel.findOne({ username }).select("-password");
    // Just in case no user found in database when we check it from params to database
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    //else send user detail
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error!" });
  }
};

const followUnfollowUserController = async (req, res) => {
  try {
  } catch (error) {}
};
const updateUserProfileController = async (req, res) => {};

export {
  getUserProfileController,
  followUnfollowUserController,
  updateUserProfileController,
};
