const gameCollection = require("../config/mongoCollection").game;
const userCollection = require("../config/mongoCollection").user;
const buyTransactions = require("../config/mongoCollection").game_sell;
const { ObjectId } = require("mongodb");
const games = require("./game");
const users = require("./user");

async function addTransaction(gameId, oldOwner, buyerId, price, date) {
  const buyData = await buyTransactions();
  const insertCount = buyData.insertOne({
    gameId,
    oldOwner,
    buyerId,
    price,
    date,
  });

  if (insertCount != 1) {
    throw `Failed to complete the transaction.`;
  }
}

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
  putUpForSale: async (userId, gameId, price) => {
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
      price: price,
    };

    const updateCount = await gameData.updateOne(
      { _id: ObjectId(gameId) },
      { $set: updatePayload }
    );

    if (updateCount == 0) throw `Failed to put up game for the sell.`;
    console.log("Successfully added to selling list");
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
    const game = gameData.findOne({ _id: ObjectId(gameId) });
    const oldOwner = game.ownerId;

    if (game.available != true) {
      throw `This game is not available for sale.`;
    }

    if (buyerId == oldOwner.toString()) {
      throw `Can not buy your own game.`;
    }
    await changeOwner(oldOwner, buyerId, gameId);
    await addTransaction(gameId, oldOwner, buyerId, game.price, new Date());
  },

  getAllBuyGames: async () => {
    const gameData = await gameCollection();
    const available_games = gameData
      .find({
        available: true,
        category: "sell",
      })
      .toArray();
    if (!available_games) throw "No games available";
    return available_games;
  },

  removeFromListing: async (gameId) => {
    const gameData = await gameCollection;
    try {
      await games.getGameById(gameId);
    } catch (e) {
      throw `${gameId} is not a valid game id.`;
    }
  },
};
