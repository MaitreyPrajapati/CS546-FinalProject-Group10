const express = require("express");
const router = express.Router();
const data = require("../data");
const userdata = data.users;
const gamedata = data.games;
const rentgamedata = data.rentgames;
var bodyParser = require("body-parser");

router.get("/", async (req, res) => {
  const allgame = await gamedata.getAllGames();
  res.json(allgame);
});
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
  const rentgames = await rentgamedata.getAllRentGames();
  const showgames = new Array();
  for (let i in rentgames) {
    if (rentgames[i].borrowerId == "") {
      showgames.push(rentgames[i]);
    }
  }
  res.render("pages/rent", { rentgames: showgames });
});

router.get("/rent/:gameId", async (req, res) => {
  if (req.session.user) {
    const rentgame = await rentgamedata.getRentGameById(req.params.gameId);
    await userdata.addBorrowedGameToUser(
      req.session.user._id,
      req.params.gameId
    );
    await userdata.addlendedGameToUser(rentgame.lenderId, req.params.gameId);
    rentgame.borrowerId = req.session.user._id;
    rentgamedata.updateRentGame(req.params.gameId, rentgame);
    // update rent game borrowerid
    res.redirect("/private");
  } else {
    res.status(500).redirect("/login");
  }
});

router.use("*", async (req, res) => {
  res.render("errors/404pageNotFound");
});
module.exports = router;
