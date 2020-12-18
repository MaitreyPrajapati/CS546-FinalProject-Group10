const express = require("express");
const router = express.Router();
const data = require("../data");
const userdata = data.users;
const gameData = data.games;

router.get("/", async (req, res) => {
  if (req.session.user) {
    const games = await gameData.getGameByUserId(req.session.user._id);
    console.log("Games", games);
    for (i = 0; i < games.length; i++) {
      await gameData.removeGame(games[i]);
      console.log(games[i]);
    }
    await userdata.removeUser(req.session.user._id);
    req.session.destroy();
    res.redirect("/");
  } else {
    res.status(500).redirect("/login");
  }
});

module.exports = router;
