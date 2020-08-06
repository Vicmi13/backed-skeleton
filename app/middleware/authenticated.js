require("dotenv").config();
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

exports.checkAuthenticated = (req, res, next) => {
  if (req.isAuthenticated) {
    return next();
  }
  console.log("redirect login");
};

exports.checkPasssword = (passwordFromLogin, user) => {
  return new Promise((resolve, reject) => {
    user.comparePassword(passwordFromLogin, (err, isMatch) => {
      if (err) {
        reject({ code: 422, message: err.message });
      }
      if (!isMatch) {
        console.log("NOT match");
        resolve(false);
      }
      console.log("YES match");
      resolve(true);
    });
  });
};

exports.authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  console.log("auth header " + authHeader);
  const token = authHeader && authHeader.split(" ")[1];
  console.log("token " + token);
  if (token === null) return res.sendStatus(401);
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    console.log("user in midd authenticate token " + user);
    req.user = user;
    next();
  });
};

exports.generateAccessToken = (userId) => {
  // Gets expiration time (20 minutes)
  const expiration =
    Math.floor(Date.now() / 1000) + 60 * process.env.JWT_EXPIRATION_IN_MINUTES;
  return jwt.sign({ data: { _id: userId } }, process.env.JWT_SECRET, {
    expiresIn: expiration,
  });
};
