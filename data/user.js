const bcrypt = require("bcrypt");
const saltRounds = 8;
var BSON = require('mongodb');
const mongoose = require('mongoose');
const { ObjectId } = mongoose.Types;
const mongoCollections = require("../config/mongoCollection");
const users = mongoCollections.user;

let exportedMethods = {
    async getAllUsers() {
        const userCollection = await users();
        const allusers = await userCollection.find({}).toArray();
        if (!allusers) throw "empty database";
        return allusers;
    },

    async getUserById(id) {
        const userCollection = await users();
        const user = await userCollection.findOne({ _id: id });
        if (!user) throw 'User not found';
        return user;
    },
    async getUserByEmail(email) {
        const userCollection = await users();
        const user = await userCollection.findOne({ email: email });
        if (!user) throw 'User not found hahah';
        const cookie = {
            _id: user._id,
            email:user.email,
            firstName:user.firstName,
            lastName:user.lastName
        };
        return cookie;
    },
    async checkuserByEmail(email) {
        if (typeof email != "string") {
            throw "email type is error.";
        }
        const usersCollection = await users();
        const repe = await usersCollection.findOne({ email: email });
        if (repe != null) {
            return false;
        } else {
            return true;
        }

    },
    async checkUser(email, password) {
        if (typeof email != "string") {
            throw "email type is error.";
        }
        const usersCollection = await users();
        const repe = await usersCollection.findOne({ email: email });
        if (repe == null) {
            return false;
        }
        const db_password = repe.password;
        let authenticated = await bcrypt.compare(password, db_password);
        if (authenticated) {
            return true;
        } else {
            return false;
        }

    },
    async addUser(email, password, firstName, lastName, profilePicture, address, city, state, country, zip) {
        const userCollection = await users();

        //error check
        if (typeof (email) != "string") throw "invalid email";
        if (typeof (password) != "string") throw "invalid password";
        if (typeof (firstName) != "string") throw "invalid firstname";
        if (typeof (lastName) != "string") throw "invalid lastName";
        if (typeof (address) != "string") throw "invalid address";
        if (typeof (city) != "string") throw "invalid city";
        if (typeof (state) != "string") throw "invalid state";
        if (typeof (country) != "string") throw "invalid country";
        if (typeof (zip) != "string") throw "invalid zip";

        //bcrypt the password
        let newpass = await bcrypt.hash(password, saltRounds);

        let newUser = {
            email: email,
            password: newpass,
            firstName: firstName,
            lastName: lastName,
            profilePicture: profilePicture,
            address: address,
            city: city,
            state: state,
            country: country,
            zip: zip,
            LendedGamesID: [],
            OwnedGamesID: [],
            BorrowedGamesID: []
        };

        const newInsertUser = await userCollection.insertOne(newUser);
        if (newInsertUser.insertedCount === 0) throw 'Insert failed!';
        return await this.getUserById(newInsertUser.insertedId);
    },
    async removeUser(id) {
        const userCollection = await users();
        const deletedUser = await userCollection.removeOne({ _id: BSON.ObjectID.createFromHexString(id) });
        if (deletedUser.deletedCount === 0) {
            throw `Could not delete user with id of ${id}`;
        }
        return true;
    },
    async updateUser(id, updatedUser) {
        let oldUser = await this.getUserById(id);
        let updateUser = {
            email: oldUser.email,
            password: oldUser.password,
            firstName: oldUser.firstName,
            lastName: oldUser.lastName,
            profilePicture: oldUser.profilePicture,
            address: oldUser.address,
            city: oldUser.city,
            state: oldUser.state,
            country: oldUser.country,
            ZIP: oldUser.zip,
            LendedGamesID: oldUser.LendedGamesID,
            OwnedGamesID: oldUser.OwnedGamesID,
            BorrowedGame: oldUser.BorrowedGamesID
        };
        if (updatedUser.email != '' && typeof (updatedUser.email) == "string") {
            updateUser.email = updatedUser.email;
        }
        if (updatedUser.password != '' && typeof (updatedUser.password) == "string") {
            let newpass = await bcrypt.hash(updatedUser.password, saltRounds);;
            updateUser.password = newpass;
        }
        if (updatedUser.firstname != '' && typeof (updatedUser.firstname) == "string") {
            updateUser.firstName = updatedUser.firstname;
        }
        if (updatedUser.lastname != '' && typeof (updatedUser.lastname) == "string") {
            updateUser.lastName = updatedUser.lastname;
        }
        if (updatedUser.address != '' && typeof (updateUser.address) == "string") {
            updateUser.address = updatedUser.address;
        }
        if (updatedUser.city != '' && typeof (updateUser.city) == "string") {
            updateUser.city = updatedUser.city;
        }
        if (updatedUser.state != '' && typeof (updateUser.state) == "string") {
            updateUser.state = updatedUser.state;
        }
        if (updatedUser.country != '' && typeof (updateUser.country) == "string") {
            updateUser.country = updatedUser.country;
        }
        if (updatedUser.zip != '' && typeof (updateUser.zip) == "string") {
            updateUser.zip = updatedUser.zip;
        }

        const userCollection = await users();

        const updatedInfo = await userCollection.updateOne(
            { _id: id },
            { $set: updateUser }
        );


        if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount)
            throw 'Update failed';
        return;
    },

    // user interactive with game (add games)
    async addOwnedGameToUser(userId, gameId) {
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: ObjectId(userId) },
            { $addToSet: { OwnedGamesID: { id: ObjectId(gameId) } } }
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Add OwnedGame failed';

        return;
    },
    async addlendedGameToUser(userId, gameId) {
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: ObjectId(userId) },
            { $addToSet: { LenedGamesID: { id: ObjectId(gameId) } } }
        );

        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Add LenedGame failed';

        return;
    },
    async addBorrowedGameToUser(userId, gameId) {
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: ObjectId(userId) },
            { $addToSet: { BorrowedGamesID: { id: ObjectId(gameId) } } }
        );

        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Add BorrowedGame failed';

        return;
    },
    // user interactive with game (remove games)
    async removeOwnedGameFromUser(userId, gameId) {
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: ObjectId(userId) },
            { $pull: { OwnedGamesID: { id: ObjectId(gameId) } } }
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Update failed';

        return;
    },
    async removeLendedGameFromUser(userId, gameId) {
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: ObjectId(userId) },
            { $pull: { LenedGamesID: { id: ObjectId(gameId) } } }
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Update failed';

        return;
    },
    async removeBorrowedGameFromUser(userId, gameId) {
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: ObjectId(userId) },
            { $pull: { BorrowedGamesID: { id: ObjectId(gameId) } } }
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Update failed';

        return;
    }

};

module.exports = exportedMethods;
