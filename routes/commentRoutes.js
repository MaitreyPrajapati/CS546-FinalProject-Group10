const express = require("express");
const router = express.Router();
const xss = require("xss");
const commentData = require("../data/comment");
const gameData = require("../data/game");

router.post("/:game_id", async (req, res) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const game_id = req.params.game_id;
  //   const message = JSON.parse(JSON.stringify(req.body));
  const message = req.body.message;
  const author = req.session.user._id;

  try {
    await gameData.getGameById(game_id);
  } catch (e) {
    return res
      .status(400)
      .render("errors/common_error", { error: { message: e } });
  }

  try {
    commentData.createComment(author, game_id, xss(message));
    res.status(200).redirect(`/games/${game_id}`);
  } catch (e) {
    return res
      .status(400)
      .render("errors/common_error", { error: { message: e } });
  }
});

router.use("*", async (req, res) => {
  return res.status(404).render("errors/404pageNotFound");
});

module.exports = router;
