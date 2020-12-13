const express = require("express");
const router = express.Router();
const data = require("../data");
const userdata = data.users;
const { ObjectId } = require("mongodb");

router.get("/", async (req, res) => {
    if (req.session.user) {
        res.render("pages/userUpdate");
      } else {
        res.status(500).redirect("/login");
    }
    
});

router.post("/", async (req, res) => {
    let newUser = JSON.parse(JSON.stringify(req.body));
    try {
        await userdata.updateUser(ObjectId(req.session.user._id),newUser);
        req.session.user = await userdata.getUserById(ObjectId(req.session.user._id));
        res.cookie("name", "auth_cookie");
        res.redirect("/private");
    } catch (e) {
        res.status(500).json({ error: e });
    }
});

module.exports = router;