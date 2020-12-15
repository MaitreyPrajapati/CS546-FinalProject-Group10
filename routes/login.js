const express = require("express");
const router = express.Router();
const data = require("../data");
const userdata = data.users;
var bodyParser = require("body-parser");

router.get("/", async (req, res) => {
  req.session.destroy();
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
    if (await userdata.checkUser(User.email, User.password)) {
      req.session.user = await userdata.getUserByEmail(User.email);
      res.cookie("name", "auth_cookie");
      console.log(res);
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
