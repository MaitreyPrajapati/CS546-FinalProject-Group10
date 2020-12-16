const gameCollection = require("../config/mongoCollection").game;
const userCollection = require("../config/mongoCollection").user;
const sellgameCollection = require("../config/mongoCollection").game_sell;
const { ObjectId } = require("mongodb");
const games = require("./game");
const users = require("./user");

// Removes the game from the old user's owned game array
async function removeGameFromUserOwned(oldOwner, gameId) {
  const userData = await userCollection();
  var oldUserGames = await userData.findOne({ _id: ObjectId(oldOwner) })
    .OwnedGamesID;
  oldUserGames.filter((entry) => {
    if (entry.toString() != gameId) {
      return true;
    }
  });
  const oldUserNewGamesPayload = {
    OwnedGamesId: oldUserGames,
  };
  const oldUserUpdateCount = await userData.updateOne(
    { _id: ObjectId(oldOwner) },
    { $set: oldUserNewGamesPayload }
  );
  if (oldUserUpdateCount == 0)
    throw `Couldn't remove game from old user's owned games.`;
}

// Adds gameid to new users owned game array
async function addGameToUserOwned(newOwner, gameId) {
  const userData = await userCollection();
  var newUserGames = await userData.findOne({ _id: ObjectId(newOwner) })
    .OwnedGamesID;
  newUserGames.push(ObjectId(gameId));
  const newUserUpdatePayload = {
    OwnedGamesID: newUserGames,
  };
  const newUserUpdateCount = await userData.updateOne(
    { _id: ObjectId(newOwner) },
    { $set: newUserUpdatePayload }
  );
  if (newUserUpdateCount == 0)
    throw `Couldn't add game in the new user's owned game.`;
}

// Changes owner of the game from oldOwner to newOwner, performs all required operations
async function changeOwner(oldOwner, newOwner, gameId) {
  const gameData = await gameCollection();

  // Changes the game owner in the actual game
  const updatePayload = {
    available: false,
    ownerId: newOwner,
  };
  const updateCount = await gameData.updateOne(
    { _id: ObjectId(gameId) },
    { $set: updatePayload }
  );
  if (updateCount == 0) throw `Failed to change the owner of the game.`;

  await removeGameFromUserOwned(oldOwner, gameId);
  await addGameToUserOwned(newOwner, gameId);
}

module.exports = {
  putUpForSale: async (userId, gameId) => {
    try {
      await games.getGameById(gameId);
    } catch (e) {
      throw `${gameId} is not a valid game id.`;
    }

    const gameData = await gameCollection();

    const curr_game = gameData.findOne({ _id: ObjectId(gameId) });
    if (curr_game.ownerId != userId) throw `You do not own this game.`;

    const updatePayload = {
      available: true,
      category: "sell",
    };
    const updateCount = await gameData.updateOne(
      { _id: ObjectId(gameId) },
      { $set: updatePayload }
    );

    if (updateCount == 0) throw `Failed to put up game for the sell.`;
  },
  buyGame: async (buyerId, gameId) => {
    try {
      await users.getUserById(buyerId);
    } catch (e) {
      throw `${buyerId} is not a valid buyer's id.`;
    }

    try {
      await games.getGameById(gameId);
    } catch (e) {
      throw `${gameId} is not a valid game id.`;
    }

    const gameData = await gameCollection();
    const oldOwner = gameData.findOne({ _id: ObjectId(gameId) }).ownerId;
    changeOwner(oldOwner, buyerId, gameId);
  },
  async getSellGameById(id) {
    const gameCollection = await sellgameCollection();
    const sellgame = await gameCollection.findOne({ _id: ObjectId(id) });
    if (!sellgame) throw "Game not found";
    return sellgame;
},
  async getAllSellGames() {
    const gameCollection = await sellgameCollection();
    const allsellgames = await gameCollection.find({}).toArray();
    if (!allsellgames) throw "empty database";
    return allsellgames;
  },
  async addSellGame(gameId, price,sellerId) {
    const sellGameCollections = await sellgameCollection();
    //error check
    if (!ObjectId.isValid(gameId)) throw "Input a valid objectid";
    if (typeof (price) != "string") throw "invalid price";
    if (!ObjectId.isValid(sellerId)) throw "Input a valid objectid";
    const gamename = await games.getGameById(gameId);
    let rentGame = {
      name: gamename.name,
      gameId: gameId,
      price: price,
      sellerId: sellerId,
      buyerId: '',
      dateOfTransaction: ''
    };

    const newInsertRentGame = await sellGameCollections.insertOne(rentGame);
    if (newInsertRentGame.insertedCount === 0) throw 'Insert failed!';
    return;
  },
  async updateSellGame(id, updatedGame) {

    let updateGame = {
        name: updatedGame.name,
        gameId: updatedGame.gameId,
        rentPrice: updatedGame.price,
        sellerId: updatedGame.sellerId,
        buyerId:updatedGame.buyerId,
        dateOfTransaction: updatedGame.dateOfTransaction
    };
    const gameCollection = await sellgameCollection();
    const updatedInfo = await gameCollection.updateOne(
        { _id: ObjectId(id) },
        { $set: updateGame }
    );
    if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount)
        throw 'Update failed';

    return;
}
};
