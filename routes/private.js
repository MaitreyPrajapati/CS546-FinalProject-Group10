const express = require("express");
const router = express.Router();
const data = require("../data");
const userdata = data.users;
const gamedata = data.games;
var bodyParser = require("body-parser");

router.get("/", async (req, res) => {
    if (req.session.user) {
        const ownerGame = await gamedata.getGameByUserId(req.session.user._id);
        res.render("pages/private", { user: req.session.user, ownedgames: ownerGame });
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

module.exports = router;