const asyncHandler = require("express-async-handler");
const Target = require("../../model/Target/Target");
const Post = require("../../model/Post/Post");

//@desc Create a target
//@route POST /api/v1/targets/:postId
//@access  Private
exports.createTarget = asyncHandler(async (req, res) => {
  // get the payload
  const { renter, rentAmount, author } = req.body;
  // get postId from params
  const postId = req.params.postId;
  //* Create target
  const target = await Target.create({
    renter,
    rentAmount,
    author: req.userAuth._id,
    postId,
  });
  // Associate target to the post
  await Post.findByIdAndUpdate(
    postId,
    {
      $push: { targets: target._id },
    },
    { new: true }
  );
  // send the response
  res.json({
    status: "success",
    message: "Target created successfully",
    target,
  });
});

//@desc Delete target
//@route DELETE /api/v1/targets/:id    --> id of the comment
//@access  Private
exports.deleteTarget = asyncHandler(async (req, res) => {
  //! Find the target
  const targetFound = await Target.findById(req.params.id);
  //! Check if logged in user is the creator
  const isAuthor =
    req.userAuth?._id?.toString() === targetFound?.author?._id?.toString();

  if (!isAuthor) {
    throw new Error("Action denied, you are not the creator of this post");
  }

  await Target.findByIdAndDelete(req.params.id);

  res.status(201).json({
    status: "success",
    message: "Target successfully deleted",
  });
});

//@desc Update target
//@route PUT /api/v1/targets/:id    --> id of the comment
//@access  Private
exports.updateTarget = asyncHandler(async (req, res) => {
  const target = await Target.findByIdAndUpdate(
    req.params.id,
    {
      renter: req.body.renter,
      rentAmount: req.body.rentAmount,
    },
    { new: true, runValidators: true }
  );

  res.status(201).json({
    status: "success",
    message: "Target successfully updated",
    target,
  });
});
