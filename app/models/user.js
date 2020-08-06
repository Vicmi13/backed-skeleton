const bcrypt = require("bcrypt");
const { Sequelize, DataTypes } = require("sequelize");
const sequelizeConnection = require("../../config/sequalize");

const User = sequelizeConnection.define("user", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notNull: { args: true, msg: "Nombre obligatorio" },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      name: "email",
      msg: "Una cuenta asociada a este email ya existe",
    },
    len: [2, 50],
    trim: true,
    validate: {
      notNull: { args: true, msg: "Email obligatorio" },
    },
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    enum: ["user", "admin"],
    defaultValue: "user",
  },
  verification: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  loginAttempts: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
  },
  blockExpires: {
    type: Sequelize.DATE,
    defaultValue: Sequelize.NOW,
  },
});

/*
User.beforeCreate( (user, options) => {
  console.log("before create");
  const SALT_FACTOR = 8;
  console.log("password changed " + user.changed("password"));
  if (!user.changed("password")) {
    console.log("Password NOT changed");
    return;
  } else {
    bcrypt.hash(user.password, SALT_FACTOR)
    .then( hash => {
    user.password = hash;
    return user;
    })
    .catch(err => {
      console.log('err')
      return err
    })
    
  }
});
*/

User.prototype.comparePassword = function (passwordAttempt, cb) {
  console.log("IN MODEL compare password");
  bcrypt.compare(passwordAttempt, this.password, (err, isMatch) =>
    err ? cb(err) : cb(null, isMatch)
  );
};

module.exports = User;
