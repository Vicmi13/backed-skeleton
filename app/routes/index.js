const express = require("express");
const router = express.Router();
const fs = require("fs");
const { removeExtensionFromFile } = require("../middleware/utils");
const routesPath = `${__dirname}/`;

// Loop routes path and loads every file as a route except this file and Auth route
fs.readdirSync(routesPath).filter((file) => {
  const routeFile = removeExtensionFromFile(file);
  return routeFile !== "index"
    ? router.use(`/${routeFile}`, require(`./${routeFile}`))
    : "";
});

/* GET home page. */
router.get("/", function (req, res, next) {
  res.status(200).json({ title: "Index page" });
});

/*
 * Handle 404 error
 */
router.use("*", (req, res) => {
  res.status(404).json({
    errors: {
      msg: "URL_NOT_FOUND",
    },
  });
});

module.exports = router;
