const express = require("express");
const app = express();

// import the User and Post model
const User = require("../models/user");
const Post = require('../models/post');

// import body-parser middleware
const bodyParser = require("body-parser");

// use the middleware
app.use(bodyParser.json());

const jwt = require("jsonwebtoken");
const JWT_SECRET = require("../config.js")
const isLoggedInMiddleware = require("../auth/isLoggedInMiddleware");

app.post("/login/", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  console.log(req.body);
  console.log(username, password);

  User.verify(username, password, (error, user) => {
    if (error) {
      res.status(500).send();
      return;
    }
    if (user === null) {
      res.status(401).send();
      return;
    }
    const payload = { user_id: user.id };
    jwt.sign(payload, JWT_SECRET, { algorithm: "HS256" }, (error, token) => {
      if (error) {
        console.log(error);
        res.status(401).send();
        return;
      }
      console.log({ token: token });
      res.status(200).send({ token: token, user_id: user.id });
    });
  });
});


//GET /
app.get("/", (req, res) => {
  res.send("Hello World!");
});

//GET /users
app.get("/users/", (req, res, next) => {
  User.findAll((error, users) => {
    if (error) {
      console.log(error);
      res.status(500).send();
    }
    res.status(200).send(users);
  });
});

//GET /users/:userID
app.get("/users/:userID/", (req, res, next) => {
  const userID = parseInt(req.params.userID);
  // if userID is not a number, send a 400.
  if (isNaN(userID)) {
    res.status(400).send();
    return;
  }

  User.findByID(userID, (error, user) => {
    if (error) {
      res.status(500).send();
      return;
    }

    // send a 404 if user is not found.
    if (user === null) {
      res.status(404).send();
      return;
    }
    res.status(200).send(user);
  });
});

//POST /users
app.post("/users/", (req, res, next) => {
  User.insert(req.body, (error, userID) => {
    if (error) {
      console.log(error);
      res.status(500).send();
      return;
    }
    res.status(201).send({
      userID,
    });
  });
});

//PUT /users/:userID
app.put("/users/:userID/", isLoggedInMiddleware, (req, res, next) => {
  const userID = parseInt(req.params.userID);
  if (isNaN(userID)) {
    res.status(400).send();
    return;
  }

  User.edit(userID, req.body, (error) => {
    if (error) {
      console.log(error);
      res.status(500).send();
      return;
    }
    res.status(204).send();
  });
});

//For Post

app.post("/users/:userID/friends/:friendID", isLoggedInMiddleware, (req, res) => {
  const userID = parseInt(req.params.userID);
  const friendID = parseInt(req.params.friendID);

  if (isNaN(userID) || isNaN(friendID)) {
    res.status(400).send();
    return;
  }

  if (userID === friendID) {
    res.status(400).send();
    return;
  }

  // User ID in the request params should be the same as the logged-in user ID
  if (userID !== req.decodedToken.user_id) {
    res.status(403).send();
    return;
  }

  // Rest of the code for handling the post request and logic
  // For example, you can use your User model to add the friend
  User.findByID(userID, (err, user) => {
    if (err) {
      res.status(500).send();
      return;
    }

    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    // Add the friend ID to the user's friend list
    user.friends.push(friendID);

    // Save the updated user object
    user.save((err) => {
      if (err) {
        res.status(500).send();
        return;
      }

      res.status(200).send("Friend added successfully");
    });
  });
});


app.delete("/users/:userID/friends/:friendID/", isLoggedInMiddleware, (req, res) => {
  const userID = parseInt(req.params.userID);
  const friendID = parseInt(req.params.friendID);

  if (isNaN(userID) || isNaN(friendID)) {
    res.status(400).send();
    return;
  }

  // User ID in the request params should be the same as the logged-in user ID
  if (userID !== req.decodedToken.user_id) {
    res.status(403).send();
    return;
  }

  // Rest of the code for handling the delete request and logic
  // For example, you can use your User model to remove the friend
  User.findByID(userID, (err, user) => {
    if (err) {
      res.status(500).send();
      return;
    }

    if (!user) {
      res.status(404).send("User not found");
      return;
    }

    // Check if the friendID exists in the user's friends list
    const friendIndex = user.friends.indexOf(friendID);
    if (friendIndex === -1) {
      res.status(404).send("Friend not found");
      return;
    }

    // Remove the friend from the user's friends list
    user.friends.splice(friendIndex, 1);

    // Save the updated user object
    user.save((err) => {
      if (err) {
        res.status(500).send();
        return;
      }

      res.status(200).send("Friend removed successfully");
    });
  });
});


//GET /posts
app.get("/posts/", (req, res) => {
  Post.findAll((error, posts) => {
    if (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.status(200).json(posts);
  });
});

//POST /posts
app.post("/posts/", isLoggedInMiddleware, (req, res) => {
  const { text_body, fk_poster_id } = req.body;
  const post = { text_body, fk_poster_id };

  // Check if the logged-in user ID matches the fk_poster_id
  if (req.decodedToken.user_id !== fk_poster_id) {
    return res.status(403).json({ error: "Unauthorized" });
  }

  Post.insert(post, (error, postId) => {
    if (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.status(201).json({ postId });
  });
});

//GET /posts/:postID
app.get("/posts/:postID/", (req, res) => {
  const { postID } = req.params;

  Post.findByID(postID, (error, post) => {
    if (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!post) {
      return res.status(404).json({ error: "Post not found" });
    }
    return res.status(200).json(post);
  });
});

//DELETE /posts/:postID
app.delete("/posts/:postID/", isLoggedInMiddleware, (req, res) => {
  const { postID } = req.params;

  Post.findByID(postID, (error, foundPost) => {
    if (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!foundPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the logged-in user ID matches the fk_poster_id of the post
    if (req.decodedToken.user_id !== foundPost.fk_poster_id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    Post.delete(postID, (error) => {
      if (error) {
        return res.status(500).json({ error: "Internal server error" });
      }
      return res.sendStatus(204);
    });
  });
});

//PUT /posts/:postID
app.put("/posts/:postID/", isLoggedInMiddleware, (req, res) => {
  const { postID } = req.params;
  const { text_body } = req.body;
  const post = { text_body };

  Post.findByID(postID, (error, foundPost) => {
    if (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!foundPost) {
      return res.status(404).json({ error: "Post not found" });
    }

    // Check if the logged-in user ID matches the fk_poster_id of the post
    if (req.decodedToken.user_id !== foundPost.fk_poster_id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    Post.edit(postID, post, (error) => {
      if (error) {
        return res.status(500).json({ error: "Internal server error" });
      }
      return res.sendStatus(204);
    });
  });
});

//POST /posts/:postID/likers/:likerID
app.post("/posts/:postID/likers/:likerID", isLoggedInMiddleware, (req, res) => {
  const { postID, likerID } = req.params;

  // Check if likerID matches the logged-in user ID
  if (likerID !== req.decodedToken.user_id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  Post.like(postID, likerID, (error) => {
    if (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.sendStatus(201);
  });
});

//DELETE /posts/:postID/likers/:likerID
app.delete("/posts/:postID/likers/:likerID", isLoggedInMiddleware, (req, res) => {
  const { postID, likerID } = req.params;

  // Check if likerID matches the logged-in user ID
  if (likerID !== req.decodedToken.user_id) {
    return res.status(403).json({ error: "Forbidden" });
  }

  Post.unlike(postID, likerID, (error) => {
    if (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.sendStatus(204);
  });
});


//GET /users/:userID/posts
app.get("/users/:userID/posts", (req, res) => {
  const { userID } = req.params;

  Post.findByUserID(userID, (error, posts) => {
    if (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.status(200).json(posts);
  });
});

//GET /posts/:postID/likers
app.get("/posts/:postID/likers", (req, res) => {
  const { postID } = req.params;

  Post.findLikers(postID, (error, likers) => {
    if (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.status(200).json(likers);
  });
});

module.exports = app;
