const mongoCollections = require("../config/mongoCollection");
const games = mongoCollections.game;
const rentGameData = mongoCollections.game_rent;
const sellGameData = mongoCollections.game_sell;
// const commentData = require("./comment");
var BSON = require("mongodb");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

let exportedMethods = {
  async getAllGames() {
    const gameCollection = await games();
    const allgames = await gameCollection.find({}).toArray();
    if (!allgames) throw "empty database";
    return allgames;
  },

  async getGameById(id) {
    const gameCollection = await games();
    const game = await gameCollection.findOne({ _id: ObjectId(id) });
    if (!game) throw "Game not found";
    return game;
  },
  async getGameByUserId(id) {
    const gameCollection = await games();
    const game = await gameCollection.find({ ownerId: id }).toArray();
    if (!game) throw "user has no game";
    return game;
  },

  async addGame(ownerId, name, genre, gameDetail, releaseDate, platform) {
    if (!ObjectId.isValid(ownerId)) throw "invalid ownerId";
    if (typeof name != "string") throw "invalid name";
    if (typeof genre != "string") throw "invalid genre";
    if (typeof gameDetail != "string") throw "invalid gameDetail";
    if (typeof releaseDate != "string") throw "invalid releaseDate";
    if (typeof platform != "string") throw "invalid platform";

    const gameCollection = await games();

    let newGame = {
      ownerId: ownerId,
      name: name,
      genre: genre,
      gameDetail: gameDetail,
      releaseDate: releaseDate,
      gamePic: "",
      platform: platform,
      category: "",
      available: false,
      comments: [],
      isBorrowed: false,
    };

    const newInsertInformation = await gameCollection.insertOne(newGame);
    if (newInsertInformation.insertedCount === 0) throw "Insert failed!";
    return newInsertInformation.insertedId;
  },
  async removeGame(id) {
    const gameCollection = await games();
    const rentCollection = await rentGameData();
    const sellCollection = await sellGameData();

    curr_game = await this.getGameById(id);
    comments = curr_game.comments;

    // for (i = 0; i < comments.length; i++) {
    //   commentData.removeComment(comments[i]);
    // }

    const deletedGame = await gameCollection.removeOne({
      _id: ObjectId(id),
    });

    await rentCollection.removeOne({
      gameId: id,
    });

    await sellCollection.removeOne({
      gameId: id,
    });

    if (deletedGame.deletedCount === 0) {
      throw `Could not delete game with id of ${id}`;
    }
    return true;
  },
  async updateGame(id, updatedGame) {
    let updateGame = {
      ownerId: updatedGame.ownerId,
      name: updatedGame.name,
      genre: updatedGame.genre,
      gameDetail: updatedGame.gameDetail,
      releaseDate: updatedGame.releaseDate,
      gamePic: updatedGame.gamePic,
      platform: updatedGame.platform,
      category: updatedGame.category,
      available: updatedGame.available,
      comments: updatedGame.comments,
      isBorrowed: updatedGame.isBorrowed,
    };

    const gameCollection = await games();
    const updatedInfo = await gameCollection.updateOne(
      { _id: ObjectId(id) },
      { $set: updateGame }
    );
    if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount)
      throw "Update failed";

    return;
  },

  // Returns all the available games that are listed for selling and renting.
  async getAllListedGames() {
    const gameCollection = await games();
    const available_games = await gameCollection.find({ available: true });
    return available_games;
  },
};

module.exports = exportedMethods;
