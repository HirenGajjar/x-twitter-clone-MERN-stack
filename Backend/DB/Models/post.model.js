import mongoose from "mongoose";

const PostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    text: {
      type: String,
    },
    img: {
      type: String,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserModel",
      },
    ],
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "UserModel",
          required: true,
        },
      },
    ],
  },
  { timestamps: true }
);

const PostModel = mongoose.model("Post", PostSchema);

export default PostModel;
