const express = require("express");
const router = express.Router();
const trimRequest = require("trim-request");

const authController = require("../controllers/authorizationController");

router.post("/login", trimRequest.all, authController.login);

module.exports = router;
