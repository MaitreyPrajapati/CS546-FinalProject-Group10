const mongoCollections = require('../config/mongoCollections');
const game = mongoCollections.game;

let exportedMethods = {
    async getAllGames() {
        const gameCollection = await game();
        const games = await userCollection.find({}).toArray();
        if (!games) throw 'empty database';
        return gameCollection;
    },

    async getGameById(id) {
        const gameCollection = await game();
        const game = await gameCollection.findOne({ _id: id });
        if (!user) throw 'User not found';
        return user;
    },

    async addUser(email, password, firstName, lastName, city, state, country, zip) {
        const userCollection = await users();
        //bcrypt the password
        let newpass = await bcrypt.hash(password, saltRounds);

        let newUser = {
            email: email,
            password: newpass,
            firstName: firstName,
            lastName: lastName,
            address:address,
            city: city,
            state: state,
            country: country,
            ZIP: zip,
            LendedGamesID: {},
            OwnedGamesID: {},
            BorrowedGamesID: {}
        };

        const newInsertInformation = await userCollection.insertOne(newUser);
        if (newInsertInformation.insertedCount === 0) throw 'Insert failed!';
        return await this.getUserById(newInsertInformation.insertedId);
    }
};

module.exports = exportedMethods;