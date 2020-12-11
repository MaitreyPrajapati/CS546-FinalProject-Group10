const mongoCollections = require("../config/mongoCollections");
const games = mongoCollections.game;

let exportedMethods = {
  async getAllGames() {
    const gameCollection = await games();
    const allgames = await gameCollection.find({}).toArray();
    if (!allgames) throw "empty database";
    return allgames;
  },

  async getGameById(id) {
    const gameCollection = await games();
    const game = await gameCollection.findOne({ _id: id });
    if (!game) throw "Game not found";
    return game;
  },

  async addGame(
    ownerId,
    name,
    genra,
    gameDetail,
    releaseDate,
    gamePic,
    platform,
    category,
    comments
  ) {
    const gameCollection = await games();

    let newGame = {
      ownerId: ownerId,
      name: name,
      genre: genre,
      gameDetail: gameDetail,
      releaseDate: releaseDate,
      gamePic: gamePic,
      platform: platform,
      category: category,
      available: false,
      comments: [],
      isBorrowed: false,
    };

    const newInsertInformation = await gameCollection.insertOne(newGame);
    if (newInsertInformation.insertedCount === 0) throw "Insert failed!";
    return await this.getGameById(newInsertInformation.insertedId);
  },
  async updateGame(id, updatedGame) {

    let updateGame = {
      ownerId: updatedGame.ownerId,
      name: updatedGame.name,
      genre: updatedGame.genre,
      gameDetail:updatedGame.gameDetail,
      releaseDate: updatedGame.releaseDate,
      gamePic: updatedGame.gamePic,
      platform: updatedGame.platform,
      category: updatedGame.category,
      available: updatedGame.available,
      comments: updatedGame.comments,
      isBorrowed: updatedGame.isBorrowed
    };

    const gameCollection = await games();
    const updatedInfo = await gameCollection.updateOne(
      { _id: id },
      { $set: updateGame }
    );
    if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount)
      throw 'Update failed';

    return;
  },
};

module.exports = exportedMethods;
