const express = require("express");
const router = express.Router();
const data = require("../data");
const userdata = data.users;
var bodyParser = require("body-parser");
const { ObjectId } = require("mongodb");

router.get("/", async (req, res) => {
    if (req.session.user) {
        await userdata.removeUser(req.session.user._id);
        req.session.destroy();
        res.redirect("/");
    } else {
        res.status(500).redirect("/login");
    }

});

module.exports = router;