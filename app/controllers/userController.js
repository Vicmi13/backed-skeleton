const model = require("../models/User");
const bcrypt = require("bcrypt");
const { matchedData } = require("express-validator");
const { sendEmail, emailExists } = require("../middleware/emailMidd");
const { handleError } = require("../middleware/utils");

const GEN_SALT = 8;

exports.getAllUsers = async (req, res, next) => {
  model
    .findAll()
    .then((users) => {
      return res.status(200).json(users);
    })
    .catch((err) => {
      console.log("error getAll users");
      console.log(err);
    });
};

exports.createUser = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;
    await emailExists(email);
    const hash = await bcrypt.hash(password, GEN_SALT);
    console.log("BCRYPT password " + hash);

    model.sync().then(() => {
      model
        .create({
          nombre,
          email,
          password: hash,
        })
        .then((userCreated) => {
          if (userCreated && userCreated.dataValues) {
            return res.status(201).json(userCreated.dataValues);
          }
        })
        .catch((err) => {
          console.log("error create user " + err);
          return res.status(422).json({ message: err.message });
        });
    });
  } catch (err) {
    console.log("error catched in EMAIL MIDD ====> ");
    console.log(err);
    handleError(res, err);
  }
};
