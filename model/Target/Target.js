const mongoose = require("mongoose");

// Schema
const targetSchema = new mongoose.Schema(
  {
    renter: {
      type: String,
      required: true,
    },
    rentAmount: {
      type: Number,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compile schema to model

const Target = mongoose.model("Target", targetSchema);

module.exports = Target;
