const mongoCollections = require("../config/mongoCollection");
const rentGameCollection = mongoCollections.game_rent;
const gameCollection = mongoCollections.game;
const { ObjectId } = require("mongodb");
const games = require("./game");
const users = require("./user");
const { mongo } = require("mongoose");

let exportedMethods = {
    async addRentedGame(gameId,rentPrice,duration,penalty,lenderId,borrowerId,dateOfTransaction) {
        const rentGameCollections = await rentGameCollection();

        //error check
        if(!ObjectId.isValid(gameId)) throw "Input a valid objectid";
        if (typeof (rentPrice) != "string") throw "invalid rentPrice";
        if (typeof (duration) != "string") throw "invalid duration";
        // if (typeof (penalty) != "string") throw "invalid penalty";
        if(!ObjectId.isValid(lenderId)) throw "Input a valid objectid";
        if(!ObjectId.isValid(borrowerId)) throw "Input a valid objectid";
        if (typeof (dateOfTransaction) != "string") throw "invalid dateOfTransaction";

        let rentGame = {
            gameId: gameId,
            rentPrice: rentPrice,
            duration: duration,
            penalty: 1,
            lenderId: lenderId,
            borrowerId: borrowerId,
            dateOfTransaction: dateOfTransaction
        };

        const newInsertRentGame = await rentGameCollections.insertOne(rentGame);
        if (newInsertRentGame.insertedCount === 0) throw 'Insert failed!';
        return;
    },
    async borrowGame(userId,gameId){
        const rentGameCollections = await rentGameCollection();
        const rentGame =await rentGameCollections.findOne({ _id: gameId });
        const gameCollections = await gameCollection();
        const updategame =await gameCollections.findOne({ _id: rentGame.gameId});  //  game{isBorrowed:false ->true}
        updategame.isBorrowed = true;
        await games.updateGame(rentGame.gameId,updategame);

        await users.addBorrowedGameToUser(userId,gameId);
    },
    async returnGame(userId, gameId){
        const rentGameCollection = await rentGameCollection();
        const deletedRentedGame = await rentGameCollection.removeOne({ _id: id });
        if (deletedRentedGame.deletedCount === 0) {
            throw `Could not return game with id of ${gameId}`;
        }
        const gameCollections = await gameCollection();
        const updategame =await gameCollections.findOne({ _id: rentGame.gameId});  //  game{isBorrowed:true ->false}
        updategame.isBorrowed = false;
        await games.updateGame(rentGame.gameId,updategame);
        await users.removeLendedGameFromUser(userId,gameId);
    }
};
module.exports = exportedMethods;