// we can rename connection as db or anything we choose.
const db = require("./databaseConfig");

const user = {
  findByID: function (userID, callback) {
    var dbConn = db.getConnection();
    dbConn.connect(function (err) {
      if (err) {
        //database connection got an issue!
        console.log(err);
        return callback(err, null);
      } else {
        // We can use "?" as a placeholder for user provided data.
        // The userID is passed in through the second parameter of the query method.
        // This is done instead of using string templates to prevent SQL injections.
        // https://github.com/mysqljs/mysql#escaping-query-values
        const findUserByIDQuery = "SELECT id, full_name, username, bio, date_of_birth, created_at FROM user WHERE id = ?;";
        dbConn.query(findUserByIDQuery, [userID], (error, results) => {
          dbConn.end();
          if (error) {
            return callback(error, null);
          }
          console.log(results);

          if (results.length === 0) {
            // No user found with the given ID
            return callback(null, null);
          }

          return callback(null, results[0]);
        });
      }
    });
  },

  findAll: function (callback) {
    //add in connection related code...
    var dbConn = db.getConnection();
    dbConn.connect(function (err) {
      if (err) {
        //database connection got an issue!
        console.log(err);
        return callback(err, null);
      } else {
        const findAllUsersQuery = "SELECT id, full_name, username, bio, date_of_birth, created_at FROM user;";
        dbConn.query(findAllUsersQuery, (error, results) => {
          dbConn.end();
          if (error) {
            return callback(error, null);
          }
          console.log(results);
          return callback(null, results);
        });
      }
    });
  },

  insert: function (user, callback) {
    //add in connection related code...
    var dbConn = db.getConnection();
    dbConn.connect(function (err) {
      if (err) {
        //database connection got an issue!
        console.log(err);
        return callback(err, null);
      } else {
        const insertUserQuery = `INSERT INTO user (username, full_name, bio, date_of_birth) VALUES (?, ?, ?, ?);`;
        dbConn.query(
          insertUserQuery,
          [user.username, user.full_name, user.bio, user.date_of_birth],
          (error, results) => {
            dbConn.end();
            if (error) {
              return callback(error, null);
            }
            return callback(null, results.insertId);
          }
        );
      }
    });
  },

  edit: function (userID, user, callback) {
    //add in connection related code...
    var dbConn = db.getConnection();
    dbConn.connect(function (err) {
      if (err) {
        //database connection got an issue!
        console.log(err);
        return callback(err, null);
      } else {
        const editUserQuery = `UPDATE user SET full_name = ?,username = ?, bio = ?, date_of_birth = ? WHERE id = ?`;
        dbConn.query(
          editUserQuery,
          [user.full_name, user.username, user.bio, user.date_of_birth, userID],
          (error, results) => {
            dbConn.end();
            if (error) {
              return callback(error);
            }
            return callback(null);
          }
        );
      }
    });
  },

  addFriend: function (userIDOne, userIDTwo, callback) {
    var dbConn = db.getConnection();
    dbConn.connect(function (err) {
      if (err) {
        console.log(err);
        return callback(err);
      } else {
        const addFriendQuery = "INSERT INTO friendship (fk_friend_one_id, fk_friend_two_id, created_at) VALUES (?, ?, NOW())";
        dbConn.query(addFriendQuery, [userIDOne, userIDTwo], function (error, results) {
          dbConn.end();
          if (error) {
            return callback(error);
          }
          return callback(null);
        });
      }
    });
  },

  removeFriend: function (userIDOne, userIDTwo, callback) {
    var dbConn = db.getConnection();
    dbConn.connect(function (err) {
      if (err) {
        console.log(err);
        return callback(err);
      } else {
        const removeFriendQuery = "DELETE FROM friendship WHERE (fk_friend_one_id = ? AND fk_friend_two_id = ?) OR (fk_friend_one_id = ? AND fk_friend_two_id = ?)";
        dbConn.query(removeFriendQuery, [userIDOne, userIDTwo, userIDTwo, userIDOne], function (error, results) {
          dbConn.end();
          if (error) {
            return callback(error);
          }
          return callback(null);
        });
      }
    });
  },

  showFriends: function (userID, callback) {
    var dbConn = db.getConnection();
    dbConn.connect(function (err) {
      if (err) {
        console.log(err);
        return callback(err, null);
      } else {
        const showFriendsQuery = "SELECT user.id, user.full_name, user.username, user.bio, user.date_of_birth, user.created_at FROM user, friendship WHERE user.id = friendship.fk_friend_one_id AND friendship.fk_friend_two_id = ?;";
        dbConn.query(showFriendsQuery, [userID, userID, userID], function (error, results) {
          dbConn.end();
          if (error) {
            return callback(error, null);
          }
          return callback(null, results);
        });
      }
    });
  },

  verify: function (username, password, callback) {
    console.log(`Verifying username and password: ${username} ${password}`)
    var dbConn = db.getConnection();
    dbConn.connect(function (err) {
      if (err) {
        console.log(err);
        return callback(err, null);
      } else {
        const query = "SELECT * FROM user WHERE username = ? and password = ?";
        dbConn.query(query, [username, password], (error, results) => {
          if (error) {
            console.log(error);
            callback(error, null);
            return;
          }
          if (results.length === 0) {
            console.log("results empty")
            return callback(null, null);
          } else {
            console.log(results)
            const user = results[0];
            return callback(null, user);
          }
        });
      }
    });
  }

};

module.exports = user;