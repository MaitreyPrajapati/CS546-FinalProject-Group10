const mongoCollections = require("../config/mongoCollection");
const rentGameCollection = mongoCollections.game_rent;
const gameCollection = mongoCollections.game;
const { ObjectId } = require("mongodb");
const games = require("./game");
const users = require("./user");
const { mongo } = require("mongoose");

let exportedMethods = {
    async getRentGameById(id) {
        const gameCollection = await rentGameCollection();
        const rentgame = await gameCollection.findOne({ _id: ObjectId(id) });
        if (!rentgame) throw "Game not found";
        return rentgame;
    },
    async getAllRentGames() {
        const gameCollection = await rentGameCollection();
        const allrentgames = await gameCollection.find({}).toArray();
        if (!allrentgames) throw "empty database";
        return allrentgames;
    },
    async getAllRentGamesById(id) {
        const gameCollection = await rentGameCollection();
        const game = await gameCollection.find({ borrowerId: id }).toArray();
        if (!game) throw "user has no rented game";
        return game;
    },
    async addRentedGame(gameId, rentPrice, duration, lenderId) {
        const rentGameCollections = await rentGameCollection();
        //error check
        if (!ObjectId.isValid(gameId)) throw "Input a valid objectid";
        if (typeof (rentPrice) != "string") throw "invalid rentPrice";
        if (typeof (duration) != "string") throw "invalid duration";
        // if (typeof (penalty) != "string") throw "invalid penalty";
        if (!ObjectId.isValid(lenderId)) throw "Input a valid objectid";
        // if(!ObjectId.isValid(borrowerId)) throw "Input a valid objectid";
        // if (typeof (dateOfTransaction) != "string") throw "invalid dateOfTransaction";
        const gamename = await games.getGameById(gameId);
        let rentGame = {
            name: gamename.name,
            gameId: gameId,
            rentPrice: rentPrice,
            duration: duration,
            penalty: 1,
            lenderId: lenderId,
            borrowerId: '',
            dateOfTransaction: ''
        };

        const newInsertRentGame = await rentGameCollections.insertOne(rentGame);
        if (newInsertRentGame.insertedCount === 0) throw 'Insert failed!';
        return;
    },
    async borrowGame(userId, gameId) {
        const rentGameCollections = await rentGameCollection();
        const rentGame = await rentGameCollections.findOne({ _id: gameId });
        const gameCollections = await gameCollection();
        const updategame = await gameCollections.findOne({ _id: rentGame.gameId });  //  game{isBorrowed:false ->true}
        updategame.isBorrowed = true;
        await games.updateGame(rentGame.gameId, updategame);

        await users.addBorrowedGameToUser(userId, gameId);
    },
    async returnGame(userId, gameId) {
        const rentGameCollection = await rentGameCollection();
        const deletedRentedGame = await rentGameCollection.removeOne({ _id: id });
        if (deletedRentedGame.deletedCount === 0) {
            throw `Could not return game with id of ${gameId}`;
        }
        const gameCollections = await gameCollection();
        const updategame = await gameCollections.findOne({ _id: rentGame.gameId });  //  game{isBorrowed:true ->false}
        updategame.isBorrowed = false;
        await games.updateGame(rentGame.gameId, updategame);
        await users.removeLendedGameFromUser(userId, gameId);
    },
    async updateRentGame(id, updatedGame) {

        let updateGame = {
            name: updatedGame.name,
            gameId: updatedGame.gameId,
            rentPrice: updatedGame.rentPrice,
            duration: updatedGame.duration,
            penalty: updatedGame.penalty,
            lenderId: updatedGame.lenderId,
            borrowerId: updatedGame.borrowerId,
            dateOfTransaction: updatedGame.dateOfTransaction
        };
        const gameCollection = await rentGameCollection();
        const updatedInfo = await gameCollection.updateOne(
            { _id: ObjectId(id) },
            { $set: updateGame }
        );
        if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount)
            throw 'Update failed';

        return;
    }
};
module.exports = exportedMethods;