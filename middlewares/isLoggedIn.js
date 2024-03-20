const jwt = require("jsonwebtoken");
const User = require("../model/User/User");

// Get token from header (1)
//? Verify the token     (2)
//! save the user        (3)
//* send the user        (4)

const isLoggedIn = (req, res, next) => {
  //console.log("Login middleware");
  //  (1)
  const token = req.headers.authorization?.split(" ")[1];
  //? (2)
  jwt.verify(token, process.env.JWT_KEY, async (err, decoded) => {
    //? console.log(decoded);
    //? Add user to req object. Get the user id
    const userId = decoded?.user?.id;
    const user = await User.findById(userId).select("username email role _id");

    //? save user into req object.
    //? console.log(user);
    req.userAuth = user;

    if (err) {
      const err = new Error("Token expired/Invalid");
      next(err);
    } else {
      //! (3)
      //* (4)
      next();
    }
  });
};

module.exports = isLoggedIn;
