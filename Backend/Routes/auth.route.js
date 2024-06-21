import express from "express";
import {
  signinController,
  signupController,
  loginController,
} from "../Controllers/auth.controller.js";
const router = express.Router();
router.post("/signup", signupController);

router.post("/login", loginController);
router.post("/logout", signinController);
export default router;
