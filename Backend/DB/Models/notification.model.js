import mongoose from "mongoose";
const NotificationSchema = new mongoose.Schema(
  {
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "UserModel",
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["follow", "like"],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);
const NotificationModel = mongoose.model("Notification", NotificationSchema);
export default NotificationModel;
