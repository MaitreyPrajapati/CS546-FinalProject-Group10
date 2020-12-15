const express = require("express");
const router = express.Router();
const data = require("../data");
const userdata = data.users;
const gamedata = data.games;
const rentgamedata =data.rentgames;
var bodyParser = require("body-parser");

router.get("/", async (req, res) => {
    if (req.session.user) {
        const ownerGame = await gamedata.getGameByUserId(req.session.user._id);
        const user = await userdata.getUserById(req.session.user._id);
        const user_info = {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            address: user.address,
            city: user.city,
            state: user.state
        }
        res.render("pages/private", { user: user_info, ownedgames: ownerGame });
    } else {
        res.status(500).redirect("/login");
    }
});

router.get("/addGame", async (req, res) => {
    if (req.session.user) {
        res.render("pages/addGame");
    } else {
        res.status(500).redirect("/login");
    }
});
router.get("/deleteGame/:gameId", async (req, res) => {
    if (req.session.user) {
        try {
            await userdata.removeOwnedGameFromUser(req.session.user._id, req.params.gameId);
            await gamedata.removeGame(req.params.gameId);
        } catch (error) {
            console.log(error);
        }
        res.redirect("/private");
    } else {
        res.status(500).redirect("/login");
    }
});
router.post("/addGame", async (req, res) => {
    let newGame = JSON.parse(JSON.stringify(req.body));

    if (!req.body) {
        res.status(400).json({ error: "You must provide body" });
        return;
    }
    if (!newGame.name) {
        res.status(400).json({ error: "You must provide name" });
        return;
    }
    if (!newGame.genre) {
        res.status(400).json({ error: "You must provide genre" });
        return;
    }
    if (!newGame.platform) {
        res.status(400).json({ error: "You must provide platform" });
        return;
    }
    if (!newGame.releaseDate) {
        res.status(400).json({ error: "You must provide releaseDate" });
        return;
    }
    if (!newGame.gameDetail) {
        res.status(400).json({ error: "You must provide gameDetail" });
        return;
    }

    try {
        let userId = req.session.user._id;
        let gameId = await gamedata.addGame(userId, newGame.name, newGame.genre, newGame.gameDetail, newGame.releaseDate, newGame.platform);
        await userdata.addOwnedGameToUser(userId, gameId);
        res.redirect("/private");
    } catch (e) {
        res.status(500).json({ error: e });
    }
});
router.get("/addRentGame/:gameId",async(req,res) => {
    if (req.session.user) {
        try {
            res.render("pages/addRentGame");
        } catch (error) {
            console.log(error);
        }
    } else {
        res.status(500).redirect("/login");
    }
});
router.post("/addRentGame/:gameId", async (req, res) => {
    let rentGame = JSON.parse(JSON.stringify(req.body));
    console.log(rentGame);
    if (!req.body) {
        res.status(400).json({ error: "You must provide body" });
        return;
    }
    if (!rentGame.rentprice) {
        res.status(400).json({ error: "You must provide rentprice" });
        return;
    }
    if (!rentGame.duration) {
        res.status(400).json({ error: "You must provide duration" });
        return;
    }

    try {
        let gameId = req.params.gameId;
        await rentgamedata.addRentedGame(gameId,rentGame.rentprice,rentGame.duration,req.session.user._id,);
        const rentedgame = await gamedata.getGameById(req.params.gameId);
        rentedgame.available = true;
        await gamedata.updateGame(gameId,rentedgame);
        res.redirect("/private");
    } catch (e) {
        res.status(500).json({ error: e });
    }
});
module.exports = router;