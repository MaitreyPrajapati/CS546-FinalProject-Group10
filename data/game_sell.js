const gameCollection = require("../config/mongoCollection").game;
const userCollection = require("../config/mongoCollection").user;
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
  putUpForSale: async (gameId) => {
    try {
      games.getGameById(gameId);
    } catch (e) {
      throw `${gameId} is not a valid game id.`;
    }

    const gameData = await gameCollection();
    const updatePayload = {
      available: true,
      category: "sell",
    };
    const updateCount = await gameData.updateOne(
      { _id: Object(gameId) },
      { $set: updatePayload }
    );

    if (updateCount == 0) throw `Failed to put up game for the sell.`;
  },

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

    const gameData = await gameCollection();
    const oldOwner = gameData.findOne({ _id: ObjectId(gameId) }).ownerId;
    changeOwner(oldOwner, buyerId, gameId);
  },
};
