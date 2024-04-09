const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();
const http = require("http");
const express = require("express");
const usersRouter = require("./routes/users/usersRouter");
const connectDB = require("./config/database");
const {
  notFound,
  globalErrHandler,
} = require("./middlewares/globalErrorHandler");
const postRouter = require("./routes/post/postRouter");
const commentRouter = require("./routes/comment/commentRouter");
const targetRouter = require("./routes/target/targetRouter");
const sendEmail = require("./utils/sendEmail");
//sendEmail("ejsecretaria@gmail.com", "Some message");
//! Server
const app = express();
// db connect
connectDB();

//== MIDDLEWARES
app.use(express.json()); //pass incoming data
// cors middleware
app.use(cors());
//= Routes
app.use("/api/v1/users", usersRouter);
app.use("/api/v1/posts", postRouter);
app.use("/api/v1/comments", commentRouter);
app.use("/api/v1/targets", targetRouter);

//= Not Found middleware
app.use(notFound);
//= Error middleware
app.use(globalErrHandler);

const server = http.createServer(app);

//? Start the server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

// .env  -- don't forget to npm install
// MONGO_URL=mongodb+srv://ejsecretaria:qFHzAwTqPNejaif6@cluster0.82jzfru.mongodb.net/mern-blog?retryWrites=true&w=majority
// JWT_KEY=anykey
// GMAIL_PASS=lufhbswyhzmvcmro
// GMAIL_USER=ejsecretariawork@gmail.com
// CLOUDINARY_CLOUD_NAME=ddth7hxte
// CLOUDINARY_APIKEY=665946565716959
// CLOUDINARY_API_SECRET=g-OlpsYz-Q54-cHU_sRuXli6z_I
