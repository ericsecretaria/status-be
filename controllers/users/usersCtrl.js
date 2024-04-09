const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const asyncHandler = require("express-async-handler");
const User = require("../../model/User/User");
const generateToken = require("../../utils/generateToken");
const expressAsyncHandler = require("express-async-handler");
const sendEmail = require("../../utils/sendEmail");
const sendAccVerificationEmail = require("../../utils/sendAccVerificationEmail");

//? @desc Register a new user
//? @route POST /api/v1/users/register
//? @access  Public
exports.register = asyncHandler(async (req, res) => {
  //get the details
  const { username, password, email } = req.body;
  //! Check if exists
  const user = await User.findOne({ username });
  if (user) {
    throw new Error("User Already Exists");
  }
  // Register new user
  const newUser = new User({
    username,
    email,
    password,
  });
  //! has passowrd
  const salt = await bcrypt.genSalt(10);
  newUser.password = await bcrypt.hash(password, salt);
  // Save
  await newUser.save();
  res.status(201).json({
    status: "success",
    message: "User Registered Successfully",
    // _id: newUser?._id,
    // username: newUser?.username,
    // email: newUser?.email,
    // role: newUser?.role,
    newUser,
  });
});

//? @desc Login user
//? @route POST /api/v1/users/login
//? @access  Public
exports.login = asyncHandler(async (req, res) => {
  //? get the login details
  const { username, password } = req.body;
  //! Check if exists
  const user = await User.findOne({ username });
  if (!user) {
    throw new Error("Invalid login credentials");
  }
  // conpare hased password with the one on the request
  const isMatched = await bcrypt.compare(password, user?.password);
  if (!isMatched) {
    throw new Error("Invalid login credentials");
  }
  // Update the last login
  user.lastLogin = new Date();
  // Save
  // await newUser.save();
  res.json({
    status: "success",
    email: user?.email,
    _id: user?._id,
    username: user?.username,
    role: user?.role,
    token: generateToken(user),
    profilePicture: user?.profilePicture,
    isVerified: user?.isVerified,
  });
});

//? @desc Get Profile
//? @route GET /api/v1/users/user-profile
//? @access  Private
exports.getProfile = asyncHandler(async (req, res, next) => {
  // console.log(req.userAuth);
  //! get user id from params
  //const id = req.params.id;
  const id = req.userAuth._id;
  const user = await User.findById(id)
    .populate({
      path: "posts",
      model: "Post",
    })
    .populate({
      path: "following",
      model: "User",
    })
    .populate({
      path: "followers",
      model: "User",
    })
    .populate({
      path: "blockedUsers",
      model: "User",
    })
    .populate({
      path: "profileViewers",
      model: "User",
    });
  //console.log(user);
  res.json({
    status: "success",
    message: "Profile fetched",
    user,
  });
});

//? @desc Get Public Profile
//? @route GET /api/v1/users/public-profile/:userId
//? @access  Public
exports.getPublicProfile = asyncHandler(async (req, res, next) => {
  // console.log(req.userAuth);
  //! get user id from params
  //const id = req.params.id;
  const userId = req.params.userId;
  const user = await User.findById(userId).select("-password").populate({
    path: "posts",
  });
  res.json({
    status: "success",
    message: "Public Profile fetched",
    user,
  });
});

//? @desc Block User
//? @route POST /api/v1/users/block/:userIdToBlock
//? @access  Private
exports.blockUser = asyncHandler(async (req, res) => {
  //* Find user to block
  const userIdToBlock = req.params.userIdToBlock;
  const userToBlock = await User.findById(userIdToBlock);
  if (!userToBlock) {
    throw new Error("User to block not found");
  }
  //! user who is blocking
  const userBlocking = req.userAuth._id;

  // Check if user is blocking himself/herself
  if (userIdToBlock.toString() === userBlocking.toString()) {
    throw new Error("Cannot block yourself");
  }
  // Find the current user
  const currentUser = await User.findById(userBlocking);
  //? Check if user already blocked
  if (currentUser?.blockedUsers?.includes(userIdToBlock)) {
    throw new Error("User already blocked");
  }
  //push the user to be blocked into the array of current user
  currentUser?.blockedUsers.push(userIdToBlock);
  await currentUser.save();
  res.json({
    message: "User blocked successfully",
    status: "success",
  });
});

//? @desc Unblock User
//? @route PUT /api/v1/users/unblock/:userIdToUnBlock
//? @access  Private
exports.unblockUser = asyncHandler(async (req, res) => {
  //* Find user to be Unblock
  const userIdToUnBlock = req.params.userIdToUnBlock;
  const userToUnBlock = await User.findById(userIdToUnBlock);
  if (!userToUnBlock) {
    throw new Error("User to be unblock is not found");
  }
  // Find the current user
  const userUnBlocking = req.userAuth._id;
  const currentUser = await User.findById(userUnBlocking);

  // Check if user is block so we can unblock
  if (!currentUser.blockedUsers.includes(userIdToUnBlock)) {
    throw new Error("User not block");
  }
  // remove the user from the current user blocked users array
  currentUser.blockedUsers = currentUser.blockedUsers.filter(
    (id) => id.toString() !== userIdToUnBlock.toString()
  );
  //resave the current user
  await currentUser.save();
  res.json({
    status: "success",
    message: "User unblocked successfully",
  });
});

//? @desc who view my profile
//? @route GET /api/v1/users/profile-viewer/:userProfileId
//? @access  Private
exports.profileViewers = asyncHandler(async (req, res) => {
  //* Find that we want to view his profile
  const userProfileId = req.params.userProfileId;

  const userProfile = await User.findById(userProfileId);
  if (!userProfile) {
    throw new Error("User to view not found");
  }

  // Find the current user
  const currentUserId = req.userAuth._id;

  //? Check if user already viewed the profile
  if (userProfile?.profileViewers?.includes(currentUserId)) {
    throw new Error("You have already viewed this profile");
  }
  //push the current user id into the user user profile
  userProfile?.profileViewers.push(currentUserId);
  await userProfile.save();
  res.json({
    message: "You have successfully viewed his profile",
    status: "success",
  });
});

//? @desc Following user
//? @route PUT /api/v1/users/following/:userToFollowId
//? @access  Private
exports.followingUser = asyncHandler(async (req, res) => {
  // Find the current user
  const currentUserId = req.userAuth._id;
  //! Find the user to follow
  const userToFollowId = req.params.userToFollowId;
  // Avoid user following itself
  if (currentUserId.toString() === userToFollowId.toString()) {
    throw new Error("You cannot follow yourself");
  }
  // Push the userToFollowId into the current user folling field
  await User.findByIdAndUpdate(
    currentUserId,
    {
      $addToSet: { following: userToFollowId },
    },
    { new: true }
  );
  // Push the currentUserId into the user to follow followers field
  await User.findByIdAndUpdate(
    userToFollowId,
    {
      $addToSet: { followers: currentUserId },
    },
    { new: true }
  );
  // send the response
  res.json({
    status: "success",
    message: "You have followed the user successfully",
  });
});

//? @desc UnFollowing user
//? @route PUT /api/v1/users/unfollowing/:userToUnFollowId
//? @access  Private
exports.unFollowingUser = asyncHandler(async (req, res) => {
  // Find the current user
  const currentUserId = req.userAuth._id;
  //! Find the user to Unfollow
  const userToUnFollowId = req.params.userToUnFollowId;
  // Avoid user unfollowing itself
  if (currentUserId.toString() === userToUnFollowId.toString()) {
    throw new Error("You cannot unfollow yourself");
  }
  // Remove the userToUnFollowId from the current user following field
  await User.findByIdAndUpdate(
    currentUserId,
    {
      $pull: { following: userToUnFollowId },
    },
    { new: true }
  );
  // Remove the currentUserId into the user to unfollow followers field
  await User.findByIdAndUpdate(
    userToUnFollowId,
    {
      $pull: { followers: currentUserId },
    },
    { new: true }
  );
  // send the response
  res.json({
    status: "success",
    message: "You have unfollowed the user successfully",
  });
});

//? @desc Forgot password
//? @route POST /api/v1/users/forgot-password
//? @access  Public
exports.forgotPassword = expressAsyncHandler(async (req, res) => {
  const { email } = req.body;
  //Find the email in our db
  const userFound = await User.findOne({ email });
  if (!userFound) {
    throw new Error("There's no email in our system");
  }
  // Create token
  const resetToken = await userFound.generatePasswordResetToken();
  // resave the user
  await userFound.save();
  //send email
  sendEmail(email, resetToken);
  res.status(200).json({ message: "Password reset email sent", resetToken });
});

//? @desc Reset password
//? @route POST /api/v1/users/reset-password/:resetToken
//? @access  Public
exports.resetPassword = expressAsyncHandler(async (req, res) => {
  //get the id/token from email/ params
  const { resetToken } = req.params;
  const { password } = req.body;
  // Convert the token to actual token that has been saved in the db
  const cryptoToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  //console.log(cryptoToken);
  // Find the user by the crypto token
  const userFound = await User.findOne({
    passwordResetToken: cryptoToken,
    passwordResetExpires: { $gt: Date.now() },
  });
  if (!userFound) {
    throw new Error("Password reset token is invalid or has expired");
  }
  //Update the user password
  const salt = await bcrypt.genSalt(10);
  userFound.password = await bcrypt.hash(password, salt);
  userFound.passwordResetExpires = undefined;
  userFound.passwordResetToken = undefined;
  // resave the user
  await userFound.save();
  // res.json({
  //   message: "User found",
  //   userFound,
  // });
  res.status(200).json({ message: "Password reset successfully" });
});

//? @desc Send Account Verification Email
//? @route PUT /api/v1/users/account-verification-email
//? @access  Private
exports.accountVerificationEmail = expressAsyncHandler(async (req, res) => {
  //find the login user email
  const user = await User.findById(req?.userAuth?._id);
  if (!user) {
    throw new Error("User not found");
  }
  // send the token.
  const token = await user.generateAccVerificationToken();
  // resave
  await user.save();
  //send the email
  sendAccVerificationEmail(user?.email, token);
  res.status(200).json({
    message: `Account verification sent  ${user?.email}`,
  });
});

//? @desc Verify token
//? @route PUT /api/v1/users/account-verification/:verifyToken
//? @access  Private
exports.verifyAccount = expressAsyncHandler(async (req, res) => {
  //get the id/token from params
  const { verifyToken } = req.params;
  // Convert the token to actual token that has been saved in the db
  const cryptoToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");
  //console.log(cryptoToken);
  // Find the user by the crypto token
  const userFound = await User.findOne({
    accountVerificationToken: cryptoToken,
    accountVerificationExpires: { $gt: Date.now() },
  });
  if (!userFound) {
    throw new Error("Account verification token is invalid or has expired");
  }
  //Update user account
  userFound.isVerified = true;
  userFound.accountVerificationExpires = undefined;
  userFound.accountVerificationToken = undefined;
  // resave the user
  await userFound.save();
  // res.json({
  //   message: "User found",
  //   userFound,
  // });
  res.status(200).json({ message: "Account successfully verified" });
});

//?@desc Upload profile image
//?@route PUT /api/users/upload-profile-image
//?@access  Private
exports.uploadProfilePicture = asyncHandler(async (req, res) => {
  // Find the user
  const userFound = await User.findById(req?.userAuth?._id);
  if (!userFound) {
    throw new Error("User not found");
  }
  const user = await User.findByIdAndUpdate(
    req?.userAuth?._id,
    {
      $set: { profilePicture: req?.file?.path },
    },
    { new: true }
  );

  //? Send the response
  res.json({
    status: "success",
    message: "User profile image updated successfully",
    user,
  });
});

//?@desc Upload cover image
//?@route PUT /api/users/upload-cover-image
//?@access  Private
exports.uploadCoverImage = asyncHandler(async (req, res) => {
  // Find the user
  const userFound = await User.findById(req?.userAuth?._id);
  if (!userFound) {
    throw new Error("User not found");
  }

  const user = await User.findByIdAndUpdate(
    req?.userAuth?._id,
    {
      $set: { coverImage: req?.file?.path },
    },
    { new: true }
  );

  //? Send the response
  res.json({
    status: "success",
    message: "User cover image updated successfully",
    user,
  });
});

//?@desc Update username or email
//?@route PUT /api/users/update-profile
//?@access  Private
exports.updateUserProfile = asyncHandler(async (req, res) => {
  //!Check if the post exists
  const userId = req.userAuth?._id;
  const userFound = await User.findById(userId);
  if (!userFound) {
    throw new Error("User not found");
  }
  //! image update
  const { username, email } = req.body;
  const updatedUser = await User.findByIdAndUpdate(
    userId,
    {
      email: email ? email : userFound?.email,
      username: username ? username : userFound?.username,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(201).json({
    status: "success",
    message: "User successfully updated",
    updatedUser,
  });
});
