const express = require("express");
const router = express.Router();
const data = require("../data");
const userdata = data.users;
const gameData = data.games;
const buy_sell = data.buysell;
var bodyParser = require("body-parser");

// Gets all the available games for buy and sell.
router.get("/listings", async (req, res) => {
  // gameData.getAllListedGames();
});

// User lists the game for selling
router.get("/sell/:game_id", async (req, res) => {
  const user = req.seesion.user;
  const game_id = req.params.game_id;
  if (!user) res.redirect("/login");
  else {
    // const username = user.username;
    // buy_sell.putUpForSale(username, game_id)
  }
});

// User buys the game listed for selling
router.get("/buy/:game_id", async (req, res) => {
  const user = req.seesion.user;
  const game_id = req.params.game_id;
  if (!user) res.redirect("/login");
  else {
    // const username = user.username;
    // buy_sell.buyGame(username, game_id)
  }
});

// User borrows the game listed for renting
router.get("borrow/:game_id", async (req, res) => {
  const user = req.session.user;
  const game_id = req.params.game_id;
});

router.get("/rent", async (req, res) => {
  res.render("pages/rent");
});

router.use("*", async (req, res) => {
  res.render("errors/404pageNotFound");
});
module.exports = router;
