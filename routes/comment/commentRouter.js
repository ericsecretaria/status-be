const express = require("express");
const {
  createComment,
  updateComment,
  deleteComment,
} = require("../../controllers/comments/comments");
const isLoggedIn = require("../../middlewares/isLoggedIn");

const commentRouter = express.Router();

//create
commentRouter.post("/:postId", isLoggedIn, createComment);
//update
commentRouter.put("/:id", isLoggedIn, updateComment);
//delete
commentRouter.delete("/:id", isLoggedIn, deleteComment);

// Export
module.exports = commentRouter;
