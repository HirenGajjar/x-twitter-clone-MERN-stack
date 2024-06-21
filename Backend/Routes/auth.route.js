import express from "express";
const router = express.Router();
router.get("/signup", (req, res) => {
  res.json({ msg: "Hii there route" });
});
export default router;
