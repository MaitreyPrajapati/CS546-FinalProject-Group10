const express = require("express");
const router = express.Router();
const data = require("../data");
const userdata = data.users;
const gamedata =data.games;
const rentgamedata = data.rentgames;
var bodyParser = require("body-parser");

router.get("/",async(req,res)=>{
  const allgame = await gamedata.getAllGames();
  res.json(allgame);
})

router.get("/rent", async (req, res) => {
  const rentgames = await rentgamedata.getAllRentGames();
  const showgames = new Array();
  for(let i in rentgames){
    if(rentgames[i].borrowerId==""){
      showgames.push(rentgames[i]);
    }
  }
  res.render("pages/rent",{rentgames:showgames});
});

router.get("/rent/:gameId", async (req, res) => {
  if (req.session.user) {
  const rentgame = await rentgamedata.getRentGameById(req.params.gameId);
  await userdata.addBorrowedGameToUser(req.session.user._id,req.params.gameId);
  await userdata.addlendedGameToUser(rentgame.lenderId,req.params.gameId);
  rentgame.borrowerId = req.session.user._id;
  rentgamedata.updateRentGame(req.params.gameId,rentgame);
  // update rent game borrowerid
  res.redirect("/private");
  }else{
    res.status(500).redirect("/login");
  }
});

module.exports = router;
