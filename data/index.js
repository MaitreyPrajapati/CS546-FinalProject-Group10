const users = require("./user");
const games = require("./game");
const rentgames = require("./game_rent");

module.exports = {
  users: users,
  games: games,
  rentgames: rentgames,
};
const users = require("./user");
const games = require("./game");
const buy_sell = require("./game_sell");

module.exports = {
  users: users,
  games: games,
  buysell: buy_sell,
};
