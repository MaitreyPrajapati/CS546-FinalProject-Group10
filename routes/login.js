const express = require("express");
const router = express.Router();
const data = require("../data");
const userdata = data.users;

router.get("/", async (req, res) => {
  if (req.session) {
    req.session.destroy();
  }
  res.render("pages/login");
});

router.post("/", async (req, res) => {
  let User = JSON.parse(JSON.stringify(req.body));

  if (!req.body) {
    res.status(400).json({ error: "You must provide body" });
    return;
  }
  if (!User.email) {
    res.status(400).json({ error: "Email cant be empty" });
    return;
  }
  if (!User.password) {
    res.status(400).json({ error: "Password cant be empty" });
    return;
  }
  try {
    User.email = User.email.toLowerCase();
    if (await userdata.checkUser(User.email, User.password)) {
      req.session.user = await userdata.getUserByEmail(User.email);
      res.cookie("name", "auth_cookie");
      res.redirect("/private");
    } else {
      res.redirect("/login");
    }
  } catch (e) {
    console.log(e);
    res.status(500).json({ error: e });
  }
});

module.exports = router;
