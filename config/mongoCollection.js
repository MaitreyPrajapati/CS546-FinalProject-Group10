const dbConnection = require('./mongoConnection');

const getCollectionFn = (collection) => {
  let _col = undefined;

  return async () => {
    if (!_col) {
      const db = await dbConnection();
      _col = await db.collection(collection);
    }

    return _col;
  };
};

module.exports = {
    user:getCollectionFn('user'),
    game:getCollectionFn('game'),
    game_rent:getCollectionFn('game_rent'),
    game_sell:getCollectionFn('game_sell'),
    comment:getCollectionFn('comment')
};