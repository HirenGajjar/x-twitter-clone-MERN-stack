import UserModel from "../DB/Models/user.model.js";

const getUserProfileController = async (req, res) => {
  // If the user is authorized by protected route middleware then here user can get the profile
  // Get username from params
  const { username } = req.params;

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
    // here first we get the id of user we want to follow or un-follow and we call it modifyUser
    const { id } = req.params;

    // THe user we want to follow or un-follow
    const modifyUser = await UserModel.findById(id);

    // The current logged in user and req.user._id comes from the protectedRoute middleware as an object
    const currentUser = await UserModel.findById(req.user._id);

    // here we don't want user to follow or un-follow them selves
    // here we convert the id to string from an object first to make comparison
    if (id === req.user._id.toString()) {
      return res
        .status(400)
        .json({ message: "Cannot follow/un-follow same profile!" });
    }
    // If user is not trying to follow own self then check wether the current user and modify user are correct or not such cases are rare but good practice for security
    if (!currentUser || !modifyUser) {
      return res.status(400).json({ message: "User not found!" });
    }
    // If everything is good so far then user can follow or un-follow
    // Here the current user has a following as an array in database and array have a includes method, if user already exist in following array then user can un-follow
    const isFollowing = currentUser.following.includes(id);
    if (isFollowing) {
      // un-follow user
      // When person A un-follows person B , we need to remove the id of person B from A's following array
      // At the same time in user B, the following array will be updated and person A's followers array will be changed
      await UserModel.findByIdAndUpdate(id, {
        $pull: { followers: req.user._id },
      });
      await UserModel.findByIdAndUpdate(req.user._id, {
        $pull: { following: id },
      });
      res.status(200).json({ message: "User un-followed!" });
      //Send notification
    } else {
      // follow user
      // Here is something good to know, when person A follows person B , A get one following and B get one follower
      // So we push id of person B into the person A's following array and at the same time person B's follower array get the id of person A
      // A good explanation at 1:18:00
      // And we send notification to both of the users
      await UserModel.findByIdAndUpdate(id, {
        $push: { followers: req.user._id },
      });
      await UserModel.findByIdAndUpdate(req.user._id, {
        $push: { following: id },
      });
      res.status(200).json({ message: "Following!" });
    }
  } catch (error) {}
};
const updateUserProfileController = async (req, res) => {};

export {
  getUserProfileController,
  followUnfollowUserController,
  updateUserProfileController,
};
