const express = require("express");
const router = express.Router();
const data = require("../data");
const userdata = data.users;
const gamedata = data.games;
const rentgamedata = data.rentgames;
const sellgamedata = data.sellgames;
var bodyParser = require("body-parser");

router.get("/", async (req, res) => {
  const allgame = await gamedata.getAllGames();
  res.json(allgame);
})

// game rent part
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
    await userdata.addBorrowedGameToUser(req.session.user._id, req.params.gameId);
    await userdata.addlendedGameToUser(rentgame.lenderId, req.params.gameId);
    rentgame.borrowerId = req.session.user._id;
    //update game.isBorrowed -> ture   &&   game.available -> false
    const gameDetail = await gamedata.getGameById(rentgame.gameId);
    gameDetail.isBorrowed = true;
    gameDetail.available = false;
    await gamedata.updateGame(rentgame.gameId,gameDetail);
    const date = new Date();
    rentgame.dateOfTransaction = date.toLocaleString();
    await rentgamedata.updateRentGame(req.params.gameId, rentgame);
    // update rent game borrowerid
    res.redirect("/private");
  } else {
    res.status(500).redirect("/login");
  }
});

router.get("/return/:gameId", async (req, res) => {
  if (req.session.user) {
    const returngame = await rentgamedata.getRentGameById(req.params.gameId);
    await userdata.removeBorrowedGameFromUser(req.session.user._id, req.params.gameId);
    await userdata.removeLendedGameFromUser(returngame.lenderId, req.params.gameId);
    returngame.borrowerId = "";
    returngame.dateOfTransaction = "";
    //update game.isBorrowed -> false   &&   game.available -> true
    const gameDetail = await gamedata.getGameById(returngame.gameId);
    gameDetail.isBorrowed = false;
    gameDetail.available = true;
    await gamedata.updateGame(returngame.gameId,gameDetail);
    await rentgamedata.updateRentGame(req.params.gameId, returngame);
    res.redirect("/private");
  } else {
    res.status(500).redirect("/login");
  }
});


// game purchase part
router.get("/purchase", async (req, res) => {
  const sellgames = await sellgamedata.getAllSellGames();
  const showgames = new Array();
  for (let i in sellgames) {
    if (sellgames[i].buyerId == "") {
      showgames.push(sellgames[i]);
    }
  }
  res.render("pages/purchase", { sellgames: showgames });
});
router.get("/purchase/:gameId", async (req, res) => {
  if (req.session.user) {
    const sellgame = await sellgamedata.getSellGameById(req.params.gameId);
    const gameDetail = await gamedata.getGameById(sellgame.gameId);
    await userdata.addOwnedGameToUser(req.session.user._id, gameDetail._id);
    await userdata.removeOwnedGameFromUser(sellgame.sellerId, gameDetail._id);
    sellgame.buyerId = req.session.user._id;
    //game.available -> false game.ownerId -> buyer
    gameDetail.available = false;
    gameDetail.ownerId = req.session.user._id;
    await gamedata.updateGame(sellgame.gameId,gameDetail);
    const date = new Date();
    sellgame.dateOfTransaction = date.toLocaleString();
    sellgame.buyerId = req.session.user._id;
    await sellgamedata.updateSellGame(req.params.gameId, sellgame);
    // update rent game borrowerid
    res.redirect("/private");
  } else {
    res.status(500).redirect("/login");
  }
});

module.exports = router;
