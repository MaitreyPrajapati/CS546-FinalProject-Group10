const users = require('./user');
const games = require('./game');
const rentgames = require('./game_rent');
const sellgames = require("./game_sell");

module.exports = {
    users: users,
    games: games,
    rentgames: rentgames,
    sellgames: sellgames
};