const bcrypt = require("bcrypt");
const saltRounds = 16;

const mongoCollections = require("../config/mongoCollections");
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
    async checkuserByEmail(email) {
        if (typeof email != "string") {
            throw "email type is error.";
        }
        const usersCollection = await users();
        const repe = await usersCollection.findOne({ email: email });
        if (repe != null) {
            return false;
        }
        return true;
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
        const deletedUser = await userCollection.removeOne({ _id: id });
        if (deletedUser.deletedCount === 0) {
            throw `Could not delete user with id of ${id}`;
        }
        return true;
    },
    async updateUser(id, updatedUser) {
        let newpass = updatedUser.password;

        let updateUser = {
            email: updatedUser.email,
            password: newpass,
            firstName: updatedUser.firstName,
            lastName: updatedUser.lastName,
            profilePicture: updatedUser.profilePicture,
            address: updatedUser.address,
            city: updatedUser.city,
            state: updatedUser.state,
            country: updatedUser.country,
            ZIP: updatedUser.zip
        };

        const userCollection = await users();
        const updatedInfo = await userCollection.updateOne(
            { _id: id },
            { $set: updateUser }
        );
        if (!updatedInfo.matchedCount && !updatedInfo.modifiedCount)
            throw 'Update failed';

        return await this.getUserById(id);
    },

    // user interactive with game (add games)
    async addOwnedGameToUser(userId, gameId) {
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: userId },
            { $addToSet: { OwnedGamesID: { id: gameId } } }
        );

        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Add OwnedGame failed';

        return await this.getUserById(userId);
    },
    async addlendedGameToUser(userId, gameId) {
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: userId },
            { $addToSet: { LenedGamesID: { id: gameId } } }
        );

        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Add LenedGame failed';

        return await this.getUserById(userId);
    },
    async addBorrowedGameToUser(userId, gameId) {
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: userId },
            { $addToSet: { BorrowedGamesID: { id: gameId } } }
        );

        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Add BorrowedGame failed';

        return await this.getUserById(userId);
    },

    // user interactive with game (remove games)
    async removeOwnedGameFromUser(userId, gameId) {
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: userId },
            { $pull: { OwnedGamesID: { id: gameId } } }
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Update failed';

        return await this.getUserById(userId);
    },
    async removeLendedGameFromUser(userId, gameId) {
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: userId },
            { $pull: { LenedGamesID: { id: gameId } } }
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Update failed';

        return await this.getUserById(userId);
    },
    async removeBorrowedGameFromUser(userId, gameId) {
        const userCollection = await users();
        const updateInfo = await userCollection.updateOne(
            { _id: userId },
            { $pull: { BorrowedGamesID: { id: gameId } } }
        );
        if (!updateInfo.matchedCount && !updateInfo.modifiedCount)
            throw 'Update failed';

        return await this.getUserById(userId);
    }

};

module.exports = exportedMethods;
