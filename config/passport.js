require("dotenv").config();
const JwtStrategy = require("passport-jwt").Strategy;
const ExtractJwt = require("passport-jwt").ExtractJwt;
const User = require("../app/models/User");
const passport = require("passport");

const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { generateAccessToken } = require("../app/middleware/authenticated");

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.JWT_SECRET,
};

const jwtLogin = new JwtStrategy(jwtOptions, (payload, done) => {
  console.log("Payload :: " + payload._doc);
  console.log(payload.data.id);
  User.findByPk(payload.data._id, (err, user) => {
    if (err) {
      return done(err, false);
    }
    return !user ? done(null, false) : done(err, user);
  });
});

passport.use(jwtLogin);
