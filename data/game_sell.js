const gameCollection = require("../config/mongoCollection").game;
const userCollection = require("../config/mongoCollection").user;
const games = require("./game");
const users = require("./user");

module.exports = {
  sellGame: async (buyerId, gameId) => {
    try {
      await users.getUserById(buyerId);
    } catch (e) {
      throw `${buyerId} is not a valid buyer's id.`;
    }

    try {
      games.getGameById(gameId);
    } catch (e) {
      throw `${gameId} is not a valid game id.`;
    }
  },
};
