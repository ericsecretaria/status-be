const express = require("express");
const multer = require("multer");
const {
  register,
  login,
  getProfile,
  blockUser,
  unblockUser,
  profileViewers,
  followingUser,
  unFollowingUser,
  forgotPassword,
  resetPassword,
  accountVerificationEmail,
  verifyAccount,
  getPublicProfile,
  uploadProfilePicture,
  uploadCoverImage,
  updateUserProfile,
} = require("../../controllers/users/usersCtrl");
const isLoggedIn = require("../../middlewares/isLoggedIn");
const storage = require("../../utils/fileUpload");

const usersRouter = express.Router();

//!file upload middleware
const upload = multer({ storage });

//! Register
//usersRouter.post("/register", register);
usersRouter.post("/register", register);
// Login
usersRouter.post("/login", login);
// upload profile image
usersRouter.put(
  "/upload-profile-image",
  isLoggedIn,
  upload.single("file"),
  uploadProfilePicture
);
// upload cover image
usersRouter.put(
  "/upload-cover-image",
  isLoggedIn,
  upload.single("file"),
  uploadCoverImage
);
// Public Profile
usersRouter.get("/public-profile/:userId", getPublicProfile); //profile author of the post
// Profile
usersRouter.get("/profile", isLoggedIn, getProfile); //profile of the login user
// Update Profile
usersRouter.put("/update-profile", isLoggedIn, updateUserProfile);
// Block User
usersRouter.put("/block/:userIdToBlock", isLoggedIn, blockUser);
// Unblock User
usersRouter.put("/unblock/:userIdToUnBlock", isLoggedIn, unblockUser);
// View User
usersRouter.get("/profile-viewer/:userProfileId", isLoggedIn, profileViewers);

// Following User
usersRouter.put("/following/:userToFollowId", isLoggedIn, followingUser);
// UnFollowing User
usersRouter.put("/unfollowing/:userToUnFollowId", isLoggedIn, unFollowingUser);

// Forgot Password
usersRouter.post("/forgot-password", forgotPassword);
// Reset Password
usersRouter.post("/reset-password/:resetToken", resetPassword);

// Send account verification email
usersRouter.put(
  "/account-verification-email",
  isLoggedIn,
  accountVerificationEmail
);
// Verify Email
usersRouter.get(
  "/account-verification/:verifyToken",
  isLoggedIn,
  verifyAccount
);

// Export
module.exports = usersRouter;
