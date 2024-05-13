/**
 * Converts the first character of a string to uppercase.
 * @param {string} str - The input string.
 * @returns {string} - The string with the first character capitalized.
 */
const toSentenceCase = (str) => str.charAt(0).toUpperCase() + str.substring(1);

/**
 * Translates a MongoDB error (whether Mongoose ValidatorError or MongoDB DuplicateKeyError) or a non-database error into a human-readable string
 * and returns a formatted error response.
 * @param {Error|MongoError} err - The error object to be translated.
 * @param {string} passedInMessage - The custom message to include in the error response.
 * @returns {Array} - A formatted error response in the format [success, data, message, metadata].
 */
const translateError = (err, passedInMessage) => {
  const errors = [];
  let response; // Variable to store the returned response

  // If the error is a non-database error or a generic error
  if (!err.code && !err.errors) {
    const errorMessage = err.message || "Unknown error";
    const errorType = err.name || "Unknown error";
    const status = 500; // Internal Server Error
    const error = toSentenceCase(errorMessage);

    // Push the error message to the errors array
    errors.push(error);
    // Assign the value of response
    response = [false, null, `Something went wrong in ${passedInMessage}`, { status, errors }];
  }
  // Error handling for MongoDB duplicate key error (unique values)
  else if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    errors.push(toSentenceCase(`${field} already exists.`));
    // Assign to the value of response
    response = [false, null, errors[0], { status: 400, errors }];
  }
  // Error handling for other MongoDB errors
  else {
    if (err.errors) { // Mostly for validation errors
      Object.keys(err.errors).map((field) => {
        let msg = err.errors[field].message;
        errors.push(toSentenceCase(msg.replace("Path ", "").replace(/`/g, "")));
      });
    } else {
      errors.push(toSentenceCase(err.message));
    }

    // Assign to the value of response
    response = [false, null, errors[0], { status: 400, errors }];
  }
  return response;
};

module.exports = {
    toSentenceCase,
    translateError
}