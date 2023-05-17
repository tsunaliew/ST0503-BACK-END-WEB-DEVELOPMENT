const express = require("express");
const app = express();

// import the User and Post model
const User = require("../models/user");
const Post = require('../models/post');

// import body-parser middleware
const bodyParser = require("body-parser");

// use the middleware
app.use(bodyParser.json());

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
app.put("/users/:userID/", (req, res, next) => {
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
app.post("/posts/", (req, res) => {
  const { text_body, fk_poster_id } = req.body;
  const post = { text_body, fk_poster_id };

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
app.delete("/posts/:postID/", (req, res) => {
  const { postID } = req.params;

  Post.delete(postID, (error) => {
    if (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.sendStatus(204);
  });
});

//PUT /posts/:postID
app.put("/posts/:postID/", (req, res) => {
  const { postID } = req.params;
  const { text_body } = req.body;
  const post = { text_body };

  Post.edit(postID, post, (error) => {
    if (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.sendStatus(204);
  });
});

//POST /posts/:postID/likers/:likerID
app.post("/posts/:postID/likers/:likerID", (req, res) => {
  const { postID, likerID } = req.params;

  Post.like(postID, likerID, (error) => {
    if (error) {
      return res.status(500).json({ error: "Internal server error" });
    }
    return res.sendStatus(201);
  });
});

//DELETE /posts/:postID/likers/:likerID
app.delete("/posts/:postID/likers/:likerID", (req, res) => {
  const { postID, likerID } = req.params;

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
