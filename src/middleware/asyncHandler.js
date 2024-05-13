/**
 * Wraps an asynchronous route handler to handle promise rejections.
 * @param {function} fn - The asynchronous route handler function.
 * @returns {function} A middleware function that handles asynchronous operations.
 * @throws {Error} If the provided function does not return a promise.
 * @example
 * // Usage example:
 * const asyncHandler = require('./asyncHandler');
 *
 * app.get('/example', asyncHandler(async (req, res) => {
 *     // Asynchronous code here
 * }));
 */
const asyncHandler = (fn) => {
    /**
     * Middleware function to handle asynchronous operations.
     * @param {Request} req - The Express request object.
     * @param {Response} res - The Express response object.
     * @param {function} next - The next middleware function.
     */
    return (req, res, next) => {
        // Resolve the promise returned by the route handler and catch any errors
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

module.exports = asyncHandler;
