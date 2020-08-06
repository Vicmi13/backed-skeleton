const { Sequelize, DataTypes } = require("sequelize");
const sequelizeConnection = require("../../config/sequalize");

const UserAccess = sequelizeConnection.define(
  "userAccess",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { args: true, msg: "Email es obligatorio" },
      },
    },
    browser: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: { args: true, msg: "Browser obligatorio" },
      },
    },
  },
  { freezeTableName: true }
);

module.exports = UserAccess;
