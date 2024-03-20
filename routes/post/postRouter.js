const express = require("express");
const multer = require("multer");

const isLoggedIn = require("../../middlewares/isLoggedIn");
const checkAccountVerification = require("../../middlewares/isAccountVerified");
const {
  createPost,
  getPost,
  getPosts,
  updatePost,
  deletePost,
  getPublicPosts,
  likePost,
  dislikePost,
  claps,
  schedule,
  postViewCount,
} = require("../../controllers/posts/posts");
const storage = require("../../utils/fileUpload");

const postRouter = express.Router();
//!file upload middleware
const upload = multer({ storage });

//create
//postRouter.post("/", isLoggedIn, checkAccountVerification, createPost);
postRouter.post("/", isLoggedIn, upload.single("file"), createPost);
//getting all posts
postRouter.get("/", isLoggedIn, getPosts);
//getting show 4 public posts OR all
postRouter.get("/public", getPublicPosts);
//like post
postRouter.put("/likes/:id", isLoggedIn, likePost);
//schedule post
postRouter.put("/schedule/:postId", isLoggedIn, schedule);
//dislike post
postRouter.put("/dislikes/:id", isLoggedIn, dislikePost);
//clap post
postRouter.put("/claps/:id", isLoggedIn, claps);
//post view count
postRouter.put("/:id/post-view-count", isLoggedIn, postViewCount);
//get single post
postRouter.get("/:id", getPost);
//update post
postRouter.put("/:id", isLoggedIn, upload.single("file"), updatePost);

//delete post
postRouter.delete("/:id", isLoggedIn, deletePost);

// Export
module.exports = postRouter;
