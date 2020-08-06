/**
 *
 * @param {string} file -file name
 */
exports.removeExtensionFromFile = (file) => {
  return file.split(".").slice(0, -1).join(".");
};

/**
 * Gets browser info from user
 * @param {*} req - request object
 */
exports.getBrowserInfo = (req) => req.headers["user-agent"];

/**
 * Handles error by printing to console in development env and builds and sends an error response
 * @param {Object} res - response object
 * @param {Object} err - error object
 */
exports.handleError = (res, err) => {
  if (process.env.NODE_ENV === "development") {
    console.log(err);
  }
  // Sends error to user
  res.status(err.code).json({
    errors: {
      msg: err.message,
    },
  });
};

/**
 * Builds error object
 * @param {number} code - error code
 * @param {string} message - error text
 */
exports.buildErrObject = (code, message) => {
  return {
    code,
    message,
  };
};

/**
 * Builds success object
 * @param {string} message - success text
 */
exports.buildSuccObject = (message) => {
  return {
    msg: message,
  };
};

/**
 * Item not found
 * @param {Object} err - error object
 * @param {Object} item - item result object
 * @param {Object} reject - reject object
 * @param {string} message - message
 */
exports.itemNotFound = (err, item, reject, message) => {
  if (err) {
    reject(this.buildErrObject(422, err.message));
  }
  if (!item) {
    reject(this.buildErrObject(404, message));
  }
};

/**
 * Item already exists
 * @param {Object} err - error object
 * @param {Object} item - item result object
 * @param {Object} reject - reject object
 * @param {string} message - message
 */
exports.itemAlreadyExists = (item, reject, message) => {
  if (item) {
    reject(this.buildErrObject(422, message));
  }
};
