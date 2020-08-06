const jwt = require("jsonwebtoken");
const {
  generateAccessToken,
  checkPasssword,
} = require("../middleware/authenticated");
const { addHours } = require("date-fns");
const { matchedData } = require("express-validator");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const UserAccess = require("../models/userAccess");
const utils = require("../middleware/utils");
const { sendEmail } = require("../middleware/emailMidd");

const LOGIN_ATTEMPTS = 5;
const BLOCK_HOURS = 5;

require("dotenv").config();

exports.postToken = (req, res) => {
  const refreshToken = req.body.postToken;
  if (refreshToken === null) return res.sendStatus(403);
  // TODO validate refreshToken VS tokenArray or some similiar where is allocated the token with login
  // if(!refreshTokensArray.includes(refreshToken)) return res.sendStatus(403)
  jwt.verify(refreshToken, process.env.REFRESH_JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    const accessToken = generateAccessToken({ name: user.name });
    res.json({ accessToken });
  });
};

/**
 * Login function
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.login = async (req, res) => {
  try {
    sendEmail();
    const findUser = await findUserByEmail(req.body.email);
    const user = User.build(findUser.dataValues);
    await userIsBlocked(user);
    await checkLoginAttemptsAndBlockExpires(user);
    const isPasswordMatch = await checkPasssword(req.body.password, user);
    if (!isPasswordMatch) {
      // Increment +1 login attempts
      utils.handleError(res, await passwordDoNotmatch(user));
    } else {
      // normal flow, login access OK and return JWT token
      user.loginAttempts = 0;
      await saveLoginAttemptsUser(user);
      res.status(200).json(await saveUserAccessAndReturnToken(req, user));
    }
  } catch (err) {
    console.log("error catched in LOGIN ====> ");
    console.log(err);
    utils.handleError(res, err);
  }
};

const findUserByEmail = async (email) => {
  return new Promise((resolve, reject) => {
    User.findOne({ where: { email } })
      .then((user) => {
        if (user) {
          // delete user.dataValues.id;
          delete user.dataValues.updatedAt;
          delete user.dataValues.createdAt;
          resolve(user);
        }
        reject({
          code: 422,
          message: "No existe un usuario asociado a ese correo",
        });
      })
      .catch((err) => {
        reject({ code: 400, message: err.message });
      });
  });
};

const userIsBlocked = async (user) => {
  return new Promise((resolve, reject) => {
    if (user.blockExpires > new Date()) {
      reject({ code: 409, message: "Usuario Bloqueado" });
    }
    resolve(true);
  });
};

const userBlockTimeIsExpired = (user) => {
  user.loginAttempts > LOGIN_ATTEMPTS && user.blockExpires <= new Date();
};

const checkLoginAttemptsAndBlockExpires = async (user) => {
  return new Promise((resolve, reject) => {
    if (userBlockTimeIsExpired(user)) {
      user.loginAttempts = 0;
      User.update(
        { loginAttempts: user.loginAttempts },
        { where: { _id: user.id } }
      ).then((res) => {
        res
          ? resolve(true)
          : reject({ code: 422, message: "Error al actualizar usuario" });
      });
    } else {
      //User not blocked
      resolve(true);
    }
  });
};

const passwordDoNotmatch = async (user) => {
  user.loginAttempts += 1;
  console.log("intentos " + user.loginAttempts);
  await saveLoginAttemptsUser(user);
  return new Promise((resolve, reject) => {
    if (user.loginAttempts < LOGIN_ATTEMPTS) {
      console.log("intentos no excedidos");
      resolve(utils.buildErrObject(409, "Contraseña incorrecta"));
    } else {
      resolve(blockUser(user));
    }
    reject(
      utils.buildErrObject(422, "Error en el servidor, intentar mas tarde")
    );
  });
};

const saveLoginAttemptsUser = async (user) => {
  console.log("saveLoginAttemptsUser function ");
  return new Promise((resolve, reject) => {
    User.update(
      { loginAttempts: user.loginAttempts },
      { where: { id: user.id } }
    )
      .then((resp) => {
        console.log(`${resp} intento actualizados exitosamente`);
        resolve(true);
      })
      .catch((err) => {
        console.log("error update attempts " + err);
        reject(err);
      });
  });
};

/**Block user for some time */
const blockUser = (user) => {
  console.log("user>BLocked>time  " + user.blockExpires);
  return new Promise((resolve, reject) => {
    user.blockExpires = addHours(new Date(), BLOCK_HOURS);
    console.log("blocked time " + addHours(new Date(), BLOCK_HOURS));

    User.update({ blockExpires: user.blockExpires }, { where: { id: user.id } })
      .then((resp) => {
        console.log(resp);
        resolve(utils.buildErrObject(409, "Usuario bloqueado"));
      })
      .catch((err) => {
        console.log("error al bloquear usuario");
        reject(utils.buildErrObject(422, err.message));
      });
  });
};

const saveUserAccessAndReturnToken = async (req, user) => {
  const email = user.email;
  const browser = utils.getBrowserInfo(req);

  return new Promise((resolve, reject) => {
    UserAccess.sync().then(() => {
      UserAccess.create({ email, browser })
        .then((userAcessCreated) => {
          if (userAcessCreated && userAcessCreated.dataValues) {
            const userInfo = setUserInfoForToken(user);
            resolve({ token: generateAccessToken(user.id), user: userInfo });
          }
        })
        .catch((err) => {
          reject(utils.buildErrObject(422, err.message));
        });
    });
  });
};

/**
 * Creates an object with user info for Token
 * @param {Object} user - user object
 */
const setUserInfoForToken = (user) => {
  const { id, nombre, email, role, verified } = user;
  const userInfo = {
    id,
    nombre,
    email,
    role,
    verified,
  };
  return userInfo;
};
