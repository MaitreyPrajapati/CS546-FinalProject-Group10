const users = require("./user");
const games = require("./game");
const rentgames = require("./game_rent");
const buy_sell = require("./game_sell");

module.exports = {
  users: users,
  games: games,
  rentgames: rentgames,
  buysell: buy_sell,
};
