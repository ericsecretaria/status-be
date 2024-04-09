const asyncHandler = require("express-async-handler");
const Post = require("../../model/Post/Post");
const User = require("../../model/User/User");
const expressAsyncHandler = require("express-async-handler");

//@desc Get only 4 posts
//@route GET /api/v1/posts
//@access  Public
exports.getPublicPosts = asyncHandler(async (req, res) => {
  //const posts = await Post.find({}); //-- this is to show all
  //const posts = await Post.find({}).sort({ createdAt: -1 }).limit(4);
  const posts = await Post.find({}).sort({ createdAt: -1 }).limit(4);

  res.status(201).json({
    status: "success",
    message: "Posts successfully fetched",
    posts,
  });
});

//@desc liking a Post
//@route PUT /api/v1/posts/likes/:id
//@access  Private
exports.likePost = expressAsyncHandler(async (req, res) => {
  //Get the id of the post
  const { id } = req.params;
  //get the login user
  const userId = req.userAuth._id;
  //Find the post
  const post = await Post.findById(id);
  if (!post) {
    throw new Error("Post not found");
  }
  // Push user into post likes
  await Post.findByIdAndUpdate(
    id,
    {
      $addToSet: { likes: userId },
    },
    { new: true }
  );
  // Remove the user from the dislikes array if present
  post.dislikes = post.dislikes.filter(
    (dislike) => dislike.toString() !== userId.toString()
  );
  //resave the post
  await post.save();
  res.status(200).json({ message: "Post liked succesfully", post });
});

//@desc Disliking a Post
//@route PUT /api/v1/posts/dislikes/:id
//@access  Private
exports.dislikePost = expressAsyncHandler(async (req, res) => {
  //Get the id of the post
  const { id } = req.params;
  //get the login user
  const userId = req.userAuth._id;
  //Find the post
  const post = await Post.findById(id);
  if (!post) {
    throw new Error("Post not found");
  }
  // Push user into post dislikes
  await Post.findByIdAndUpdate(
    id,
    {
      $addToSet: { dislikes: userId },
    },
    { new: true }
  );
  // Remove the user from the likes array if present
  post.likes = post.likes.filter(
    (like) => like.toString() !== userId.toString()
  );
  //resave the post
  await post.save();
  res.status(200).json({ message: "Post disliked succesfully", post });
});

//@desc clapping a Post
//@route PUT /api/v1/posts/claps/:id
//@access  Private
exports.claps = expressAsyncHandler(async (req, res) => {
  //Get the id of the post
  const { id } = req.params;
  //Find the post
  const post = await Post.findById(id);
  if (!post) {
    throw new Error("Post not found");
  }
  //implement the claps
  const updatedPost = await Post.findByIdAndUpdate(
    id,
    {
      $inc: { claps: 1 },
    },
    { new: true }
  );
  res.status(200).json({ message: "Post clapped successfully", updatedPost });
});

//@desc Schedule a Post
//@route PUT /api/v1/posts/schedule/:postId
//@access  Private
exports.schedule = expressAsyncHandler(async (req, res) => {
  //get the payload
  const { scheduledPublish } = req.body;
  const { postId } = req.params;

  //check if postid and schedulePublished found
  if (!postId || !scheduledPublish) {
    throw new Error("PostID and schedule date are required");
  }
  //Find the post
  const post = await Post.findById(postId);
  if (!post) {
    throw new Error("Post not found");
  }
  //Check if the user is the author of the post
  if (post.author.toString() !== req.userAuth._id.toString()) {
    throw new Error("You can only schedule your own post");
  }
  //Check if the schedulePublished is in the past
  const scheduleDate = new Date(scheduledPublish);
  const currentDate = new Date();

  if (scheduleDate < currentDate) {
    throw new Error("The scheduled published date cannot be in the past");
  }
  //update the post
  post.scheduledPublished = scheduleDate;
  await post.save();
  res.json({
    status: "success",
    message: "Post scheduled successfully",
    post,
  });
});

//@desc post view count
//@route PUT /api/v1/posts/:id/post-view-count
//@access  Private
exports.postViewCount = expressAsyncHandler(async (req, res) => {
  //Get the id of the post
  const { id } = req.params;
  //get the login user
  const userId = req.userAuth._id;
  //Find the post
  const post = await Post.findById(id);
  if (!post) {
    throw new Error("Post not found");
  }
  // Push user into post likes
  await Post.findByIdAndUpdate(
    id,
    {
      $addToSet: { postViews: userId },
    },
    { new: true }
  ).populate("author");
  await post.save();
  res.status(200).json({ message: "Post viewed succesfully", post });
});

//? ================================================================
//@desc Create a post
//@route POST /api/v1/posts
//@access  Private
exports.createPost = asyncHandler(async (req, res) => {
  //! Find the user/check if user account is verified.
  const userFound = await User.findById(req.userAuth._id);
  if (!userFound) {
    throw new Error("User not Found.");
  }
  if (!userFound?.isVerified) {
    throw new Error("Action denied, your account is not verified");
  }
  // Get the payload
  const { title, released, targetAmount, trackMonth } = req.body;
  //check if post exists
  const postFound = await Post.findOne({ title });
  if (postFound) {
    throw new Error("Post already exist.");
  }
  // Create post
  const post = await Post.create({
    title,
    released,
    targetAmount,
    trackMonth,
    author: req?.userAuth?._id,
    image: req?.file?.path,
  });
  //! Associcate post to user
  await User.findByIdAndUpdate(
    req?.userAuth?._id,
    {
      $push: { posts: post._id },
    },
    { new: true }
  );
  //? Send the response
  res.json({
    status: "success",
    message: "Post sucessfully created",
    post,
  });
});

//? ================================================================
//@desc Get all posts
//@route GET /api/v1/posts
//@access  Private
exports.getPosts = asyncHandler(async (req, res) => {
  //! find all users who have blocked the logged in user
  const loggedInUserId = req.userAuth?._id;
  // get current time
  const currentTime = new Date();
  const usersBlockingLoggedInUser = await User.find({
    blockedUsers: loggedInUserId,
  });
  // Extract the IDs of users who have blocked the logged in user
  const blockingUsersId = usersBlockingLoggedInUser?.map((user) => user?._id);

  //query
  const query = {
    author: { $nin: blockingUsersId },
    $or: [
      {
        scheduledPublished: { $lte: currentTime },
        scheduledPublished: null,
      },
    ],
  };

  //const posts = await Post.find(query).populate("author");
  const posts = await Post.find(query).populate({
    path: "author",
    model: "User",
    select: "email role username",
  });

  res.status(201).json({
    status: "success",
    message: "Posts successfully fetched",
    posts,
  });
});

//? ================================================================
//@desc Get single post
//@route GET /api/v1/posts/:id
//@access  Public
exports.getPost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)

    .populate("author")
    .populate({
      path: "comments",
      model: "Comment",
      populate: {
        path: "author",
        select: "username",
      },
    })
    .populate({
      path: "targets",
      model: "Target",
      populate: {
        path: "author",
        select: "username",
      },
    });

  res.status(201).json({
    status: "success",
    message: "Post successfully fetched",
    post,
  });
});

//? ================================================================
//@desc Update post
//@route PUT /api/v1/posts/:id
//@access  Private
exports.updatePost = asyncHandler(async (req, res) => {
  //!Check if the post exists
  const { id } = req.params;
  const postFound = await Post.findById(id);
  if (!postFound) {
    throw new Error("Post not found");
  }
  //! image update
  const { title, released, targetAmount, trackMonth } = req.body;
  const post = await Post.findByIdAndUpdate(
    id,
    {
      image: req?.file?.path ? req?.file?.path : postFound?.image,
      title: title ? title : postFound?.title,
      released: released ? released : postFound?.released,
      targetAmount: targetAmount ? targetAmount : postFound?.targetAmount,
      trackMonth: trackMonth ? trackMonth : trackMonth?.trackMonth,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    status: "success",
    message: "post successfully updated",
    post,
  });
});

//? ================================================================
//@desc Delete post
//@route DELETE /api/v1/posts/:id
//@access  Private
exports.deletePost = asyncHandler(async (req, res) => {
  //! Find the post
  const postFound = await Post.findById(req.params.id);
  //! Check if logged in user is the creator
  const isAuthor =
    req.userAuth?._id?.toString() === postFound?.author?._id?.toString();

  if (!isAuthor) {
    throw new Error("Action denied, you are not the creator of this post");
  }

  await Post.findByIdAndDelete(req.params.id);
  res.status(201).json({
    status: "success",
    message: "Post successfully deleted",
  });
});
