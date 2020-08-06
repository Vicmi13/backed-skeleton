const Sequelize = require("sequelize");

module.exports = new Sequelize("telcel-movil", "telcel", "Passw0rd", {
  host: "localhost",
  dialect: "mysql",
});

// const User = UserModel(sequelizeConnection, Sequelize);
