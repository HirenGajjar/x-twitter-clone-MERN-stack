import UserModel from "../DB/Models/user.model.js";
import NotificationModel from "../DB/Models/notification.model.js";
import bcrypt from "bcryptjs";
import { v2 } from "cloudinary";
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
      // We created a model for notification, which has from, to, type and read properties
      // First in case of following type is follow and to and from as appropriate
      const newNotification = new NotificationModel({
        type: "follow",
        to: req.user._id,
        from: modifyUser._id,
      });
      // Save to the database
      await newNotification.save();
      res.status(200).json({ message: "Following!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error!" });
  }
};
/*
The suggested user are the users that will be shown on side bars, so the current user should not see it self in side bar / as suggestion 
and the users which are already in following list of current user should not be present in side bar as a suggestions
*/
const getSuggestedUserController = async (req, res) => {
  try {
    // Get user id
    const userId = req.user._id;

    // get the following array of user
    const userFollowedByMe = await UserModel.findById(userId).select(
      "following"
    );
    // Aggregate function
    const users = await UserModel.aggregate([
      {
        $match: {
          _id: { $ne: userId },
        },
      },
      { $sample: { size: 10 } },
    ]);

    // Out of all the user list from current logged in user, filter out those who are already being present in following list
    const filteredUsers = users.filter(
      (user) => !userFollowedByMe.following.includes(user._id)
    );

    // slice the filtered users to only 5 at the time
    const suggestedUsers = filteredUsers.slice(0, 4);

    // Set the password to null for the suggested users
    suggestedUsers.forEach((user) => {
      user.password = null;
    });
    // send the final list of suggested users
    res.status(200).send(suggestedUsers);
    /*Even though we get the 10 size from the backend, it will still have all the users that current user follows too, so we first filter that out and then slice it down to 4 to show on the screen*/
  } catch (error) {
    res.status(500).json({ message: "Internal server error!" });
  }
};

// To update the profile user need to send few values like email, fullname,bio,link  or username and to update password user needs to send current password, and new password
const updateUserProfileController = async (req, res) => {
  try {
    const {
      email,
      username,
      bio,
      link,
      fullname,
      currentPassword,
      newPassword,
      password,
    } = req.body;
    let { profileImage, coverImage } = req.body;
    let userId = req.user._id;

    // Check if plain password is included in the request
    if (password) {
      return res
        .status(400)
        .json({ message: "Password should not be sent directly! " });
    }
    // now check if this user exist or not
    const user = await UserModel.findById(userId);
    // If no user found
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }
    // If user found and user want to update the password
    /*To update the password user needs to enter the current password as well as new password*/
    // If user try to enter empty fields for both password, we can use XOR operator
    /*if((!newPassword && currentPassword) || (!currentPassword && newPassword))*/
    if (
      (currentPassword && !newPassword) ||
      (!currentPassword && newPassword)
    ) {
      return res.status(400).json({ message: "Both passwords are required!" });
    }
    // If both password fields are given

    if (currentPassword && newPassword) {
      // As we save password with bcrypt , we need to compare the current entered password with bcrypted saved password
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      // If invalid current  password
      if (!isMatch) {
        return res.status(400).json({ message: "Incorrect current password!" });
      }
      // Check new password ,length > 6
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ message: "Password must have at least 6 characters!" });
      }
      // If both of the passwords, current and new password are valid then hash the new password and update to DB
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    }

    // Update profile image
    if (profileImage) {
      // To update the profile image we need to delete the old one otherwise cloudinary object will be run out of the storage soon
      if (user.profileImage) {
        /*every image being stored in cloudinary will have an image id which we will use to delete the old image and upload new one*/
        await v2.uploader.destroy(
          user.profileImage.split("/").pop().split(".")[0]
        );
      }
      // First upload the new image
      const newProfileImage = await v2.uploader.upload(profileImage);
      // We get the secure url from cloudinary, replace current image to new url
      profileImage = newProfileImage.secure_url;
    }
    if (coverImage) {
      await v2.uploader.destroy(user.coverImage.split("/").pop().split(".")[0]);
      const newCoverImage = await v2.uploader.upload(coverImage);
      coverImage = newCoverImage.secure_url;
    }
    // Here we just have added the images to cloudinary and not to our DB, now we will save the image changes to DB
    /*T update the images we gonna use the username , if user gives new username then update it first otherwise use same one , same with email ,and all other fields*/
    user.fullname = fullname || user.fullname;
    user.email = email || user.email;
    user.bio = bio || user.bio;
    user.username = username || user.username;
    user.link = link || user.link;
    user.profileImage = profileImage || user.profileImage;
    user.coverImage = coverImage || user.coverImage;
    // save changes to DB
    await user.save();
    /* Because we need to give response to the user as they changes the values, we will make password null and send to user, here we are not storing null password in DB , we are just sending it to user, that is why we save the changes first and then make password null to send only user */

    user.password = null;
    // Send updated data to user
    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal server error!" });
  }
};

export {
  getUserProfileController,
  followUnfollowUserController,
  updateUserProfileController,
  getSuggestedUserController,
};
