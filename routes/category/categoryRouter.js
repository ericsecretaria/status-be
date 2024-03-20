const express = require("express");
const {
  createCategory,
  getCategories,
  deleteCategory,
  updateCategory,
} = require("../../controllers/categories/category");
const isLoggedIn = require("../../middlewares/isLoggedIn");

const categoryRouter = express.Router();

//create
categoryRouter.post("/", isLoggedIn, createCategory);
//?all
categoryRouter.get("/", getCategories);
//!delete
categoryRouter.delete("/:id", isLoggedIn, deleteCategory);
//!update
categoryRouter.put("/:id", isLoggedIn, updateCategory);

// Export
module.exports = categoryRouter;
