const mongoCollection = require("../config/mongoCollection");
const comments = mongoCollection.comment;
const gameCollection = require("../config/mongoCollection").game;
const { ObjectId } = require("mongodb");
const games = require("./game");

let exportedMethods = {
    async createComment(userId,gameId,body){
        if (typeof body != string || !body || body == undefined) throw 'Body is supposed to take in a string';
        if(!ObjectId.isValid(userId)) throw 'ID for user is not valid';
        if(!ObjectId.isValid(gameId)) throw 'ID for game is not valid';

        const commentCollection = await comments();
        const gameData = await gameCollection();

        let date = new Date();
        let dateOfComment = date.getFullYear + '/' + (date.getMonth()+1) + '/' + date.getDate();
        let newComment= {
            body: body,
            userID: userId,
            gameID: gameId,
            dateOfComment:dateOfComment
        };

        const insertNewComment = await commentCollection.insertOne(newComment);
        if(insertNewComment.insertedCount == 0) throw 'New comment was not added';

        let gameComments = await games.getGameById(gameId).comments;
        gameComments.push(insertNewComment.insertedId);
        const newGameComment = {
            comments:gameComments
        };
        const newGameCommentCount = await gameData.updateOne(
            {_id:gameId},
            {$set:newGameComment}
        );
        

        if(newGameCommentCount == 0) throw 'Comment was not added to the game'
        
        return await this.getComment(insertNewComment.insertedId);
    },

    async getComment(id){
        const commentCollection = await comments();
        const comment = await commentCollection.findOne({_id:ObjectId(id)});
        if(!comment) throw 'comment not found';
        return comment;
    },

    async removeComment(id){
        const commentCollection = await comments();
        const deletedComment = await commentCollection.removeOne({_id:ObjectId(id)});
        if (deletedComment.deletedCount == 0) throw 'Game was not deleted';
        return;
    },

    async updateComment(id,newComment){
        let comment = {
            body: newComment.body,
            userID: newComment.userID,
            gameID: newComment.gameID,
            dateOfComment:newComment.dateOfComment
        };
        const commentCollection = comments();
        const updatedComment = await commentCollection.updatedOne(
            {_id:ObjectId(id)},
            {$set:comment}
        );
        if(!updatedComment.matchedCount && !updatedComment.modifiedCount) throw 'Comment did not update'

        return;
    },

}

module.exports = exportedMethods;