const express = require("express");
const router = express.Router();
const data = require("../data");
const userdata = data.users;
const gamedata = data.games;
const rentgamedata = data.rentgames;
const sellgamedata = data.sellgames;
const buy_sell = data.buysell;

router.get("/", async (req, res) => {
  const allgame = await gamedata.getAllGames();
  res.json(allgame);
});

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

// game rent part
router.get("/rent", async (req, res) => {
  const rentgames = await rentgamedata.getAllRentGames();
  const showgames = new Array();
  for (let i in rentgames) {
    if (rentgames[i].borrowerId == "") {
      showgames.push(rentgames[i]);
    }
    const game = await gamedata.getGameById(rentgames[i].gameId);
    const platform = game.platform;
    if (platform == "ps4" || platform == "ps5") {
      rentgames[i].pas = "ps.png";
    } else if (platform == "xbox") {
      rentgames[i].pas = "xbox.png";
    } else {
      rentgames[i].pas = "pc.png";
    }
  }
  res.render("pages/rent", { rentgames: showgames });
});

router.get("/rent/:gameId", async (req, res) => {
  if (req.session.user) {
    const rentgame = await rentgamedata.getRentGameById(req.params.gameId);
    const gameDetail = await gamedata.getGameById(rentgame.gameId);
    const curr_user = req.session.user._id;

    // If the user already owns the game he/she can't rent it.
    if (gameDetail.ownerId == curr_user) {
      res.render("errors/common_error", {
        error: { message: "You already own the book" },
      });
    } else {
      await userdata.addBorrowedGameToUser(
        req.session.user._id,
        req.params.gameId
      );
      await userdata.addlendedGameToUser(rentgame.lenderId, req.params.gameId);
      rentgame.borrowerId = req.session.user._id;
      //update game.isBorrowed -> ture   &&   game.available -> false

      gameDetail.isBorrowed = true;
      gameDetail.available = false;
      await gamedata.updateGame(rentgame.gameId, gameDetail);
      const date = new Date();
      rentgame.dateOfTransaction = date.toLocaleString();
      await rentgamedata.updateRentGame(req.params.gameId, rentgame);
      // update rent game borrowerid
      res.redirect("/private");
    }
  } else {
    res.status(500).redirect("/login");
  }
});

router.get("/return/:gameId", async (req, res) => {
  if (req.session.user) {
    const returngame = await rentgamedata.getRentGameById(req.params.gameId);
    await userdata.removeBorrowedGameFromUser(
      req.session.user._id,
      req.params.gameId
    );
    await userdata.removeLendedGameFromUser(
      returngame.lenderId,
      req.params.gameId
    );
    returngame.borrowerId = "";
    returngame.dateOfTransaction = "";
    //update game.isBorrowed -> false   &&   game.available -> true
    const gameDetail = await gamedata.getGameById(returngame.gameId);
    gameDetail.isBorrowed = false;
    gameDetail.available = true;
    await gamedata.updateGame(returngame.gameId, gameDetail);
    await rentgamedata.updateRentGame(req.params.gameId, returngame);
    res.redirect("/private");
  } else {
    res.status(500).redirect("/login");
  }
});

// game purchase part
router.get("/purchase", async (req, res) => {
  const sellgames = await sellgamedata.getAllSellGames();
  let showgames = new Array();
  for (let i in sellgames) {
    if (sellgames[i].buyerId == "") {
      showgames.push(sellgames[i]);
    }
    const game = await gamedata.getGameById(sellgames[i].gameId);
    const platform = game.platform;
    if (platform == "ps4" || platform == "ps5") {
      sellgames[i].pas = "ps.png";
    } else if (platform == "xbox") {
      sellgames[i].pas = "xbox.png";
    } else {
      sellgames[i].pas = "pc.png";
    }
  }
  res.render("pages/purchase", { sellgames: showgames });
});
router.get("/purchase/:gameId", async (req, res) => {
  if (req.session.user) {
    const curr_user = req.session.user._id;
    const sellgame = await sellgamedata.getSellGameById(req.params.gameId);
    const gameDetail = await gamedata.getGameById(sellgame.gameId);

    if (curr_user == gameDetail.ownerId) {
      res.render("errors/common_error", {
        error: { message: "Can not buy your own book." },
      });
    } else {
      await userdata.addOwnedGameToUser(req.session.user._id, gameDetail._id);
      await userdata.removeOwnedGameFromUser(sellgame.sellerId, gameDetail._id);
      sellgame.buyerId = req.session.user._id;
      //game.available -> false game.ownerId -> buyer
      gameDetail.available = false;
      gameDetail.ownerId = req.session.user._id;
      await gamedata.updateGame(sellgame.gameId, gameDetail);
      const date = new Date();
      sellgame.dateOfTransaction = date.toLocaleString();
      sellgame.buyerId = req.session.user._id;
      await sellgamedata.updateSellGame(req.params.gameId, sellgame);
      // update rent game borrowerid
      res.redirect("/private");
    }
  } else {
    res.status(500).redirect("/login");
  }
});

router.use("*", async (req, res) => {
  res.render("errors/404pageNotFound");
});
module.exports = router;
