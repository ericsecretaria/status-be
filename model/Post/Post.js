const mongoose = require("mongoose");

// Schema
const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    released: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    targetAmount: {
      type: Number,
      default: 0,
    },
    trackMonth: {
      type: String,
      required: true,
    },
    currentTotal: {
      type: Number,
      default: 0,
    },
    behindTotal: {
      type: Number,
      default: 0,
    },
    claps: {
      type: Number,
      default: 0,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    shares: {
      type: Number,
      default: 0,
    },
    postViews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    scheduledPublished: {
      type: Date,
      default: null,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    dislikes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
    targets: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Target",
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
    },
    toObject: {
      virtuals: true,
    },
  }
);

// Compile schema to model

const Post = mongoose.model("Post", postSchema);

module.exports = Post;
