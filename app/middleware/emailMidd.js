const User = require("../models/User");
const { buildErrObject, itemAlreadyExists } = require("./utils");

exports.emailExists = async (email) => {
  console.log("enter email");
  return new Promise((resolve, reject) => {
    User.findOne({ where: { email } })
      .then((user) => {
        if (user) {
          itemAlreadyExists(
            user,
            reject,
            "El email ya esta asociado a un usuario"
          );
        } else resolve(false);
      })
      .catch((err) => {
        reject(buildErrObject(400, err.message));
      });
  });
};

exports.sendEmail = () => {
  console.log("CALLING SEND EMAIL");
  return "something";
};
