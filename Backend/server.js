import express from "express";

const app = express();
app.get("/", (req, res) => {
  res.send("Hii there");
});
app.listen(3000);
