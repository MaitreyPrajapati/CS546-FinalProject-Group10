const mongoCollection = require("../config/mongoCollection");
const comments = mongoCollection.comment;
const gameCollection = require("../config/mongoCollection").game;
const userData = require("./user");
const { ObjectId } = require("mongodb");
const games = require("./game");

let exportedMethods = {
  async createComment(userId, gameId, body) {
    if (!body) throw "Comment should be of type string and not empty";
    if (!ObjectId.isValid(userId)) throw "ID for user is not valid";
    if (!ObjectId.isValid(gameId)) throw "ID for game is not valid";
    const commentCollection = await comments();
    const gameData = await gameCollection();

<<<<<<< HEAD
        const commentCollection = await comments();

=======
    let dateOfComment = new Date();
    let newComment = {
      body: body,
      userID: userId,
      gameID: gameId,
      dateOfComment: dateOfComment,
    };
>>>>>>> bug-fix

    const insertNewComment = await commentCollection.insertOne(newComment);
    if (insertNewComment.insertedCount == 0) throw "New comment was not added";

    gameComments = await games.getGameById(gameId);
    gameComments = gameComments.comments;
    gameComments.push(insertNewComment.insertedId);
    const newGameComment = {
      comments: gameComments,
    };
    const newGameCommentCount = await gameData.updateOne(
      { _id: ObjectId(gameId) },
      { $set: newGameComment }
    );

<<<<<<< HEAD
        addCommentToGame(insertNewComment.insertedId,gameId);
        
        return await getComment(insertNewComment.insertedId);
    },
    
    async addCommentToGame(id,gameId){
        const gameData = await gameCollection();
        let gameComments = await games.getGameById(gameId).comments;
        gameComments.push(id);
        const newGameComment = {
            comments:gameComments
        };
        const newGameCommentCount = await gameData.updateOne(
            {_id:gameId},
            {$set:newGameComment}
        );
        

        if(newGameCommentCount == 0) throw 'Comment was not added to the game';
        return;
    },
=======
    if (newGameCommentCount == 0) throw "Comment was not added to the game";

    return await this.getComment(insertNewComment.insertedId);
  },
>>>>>>> bug-fix

  async getComment(id) {
    const commentCollection = await comments();
    const one_comment = await commentCollection.findOne({ _id: ObjectId(id) });
    if (!one_comment) throw "comment not found";
    return one_comment;
  },

  async removeComment(id) {
    const commentCollection = await comments();
    const deletedComment = await commentCollection.removeOne({
      _id: ObjectId(id),
    });
    if (deletedComment.deletedCount == 0) throw "Game was not deleted";
    return;
  },

  async updateComment(id, newComment) {
    let comment = {
      body: newComment.body,
      userID: newComment.userID,
      gameID: newComment.gameID,
      dateOfComment: newComment.dateOfComment,
    };
    const commentCollection = comments();
    const updatedComment = await commentCollection.updatedOne(
      { _id: ObjectId(id) },
      { $set: comment }
    );
    if (!updatedComment.matchedCount && !updatedComment.modifiedCount)
      throw "Comment did not update";

    return;
  },

  async getCommentsByGameID(gameId) {
    try {
      const curr_game = await games.getGameById(gameId);
      curr_game_comments = curr_game.comments;
      comments_arr = [];
      for (i = 0; i < curr_game_comments.length; i++) {
        commentId = curr_game_comments[i];
        commentData = await this.getComment(commentId);
        author = await userData.getUserById(commentData.userID);
        author_name = author.firstName + " " + author.lastName;
        comments_arr.push({ author: author_name, message: commentData.body });
      }
      return comments_arr;
    } catch (e) {
      throw e;
    }
  },
};

module.exports = exportedMethods;
