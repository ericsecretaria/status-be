const express = require("express");
const multer = require("multer");

const {
  createTarget,
  updateTarget,
  deleteTarget,
} = require("../../controllers/targets/targets");
const isLoggedIn = require("../../middlewares/isLoggedIn");

const targetRouter = express.Router();
const storage = require("../../utils/fileUpload");
//!file upload middleware
const upload = multer({ storage });

//create
targetRouter.post("/:postId", isLoggedIn, upload.single("file"), createTarget);
//update
targetRouter.put("/:id", isLoggedIn, updateTarget);
//delete
targetRouter.delete("/:id", isLoggedIn, deleteTarget);

// Export
module.exports = targetRouter;
