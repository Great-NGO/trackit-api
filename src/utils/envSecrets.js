/**
 * Environment Variables Loader
 *
 * This module loads and validates environment variables required by the application
 * from a .env file. It ensures that all necessary environment variables are defined
 * before exporting them for use throughout the application.
 *
 * Usage:
 * - Import this module into your application to load and access environment variables.
 * - Ensure that a .env file containing the required environment variables is present
 *   in the root directory of your project.
 *
 * Example:
 * ```
 * const envSecrets = require('./utils/secrets');
 * console.log(envSecrets.NODE_ENV); // Output: 'development'
 * ```
 *
 * Note:
 * - This module should be imported early in the application startup process to ensure
 *   that environment variables are loaded and validated before other parts of the
 *   application depend on them.
 * - Ensure that sensitive information such as API keys and passwords are stored securely
 *   and not exposed in public repositories.
 */

require("dotenv").config();

const {
    NODE_ENV,
    JWT_SECRET_KEY,
    RESET_SECRET_KEY,
    MONGODB_URI,
    MONGODB_DEV_URI,
    superAdminFirstname,
    superAdminLastname,
    superAdminEmail,
    superAdminPassword,
    MAILING_EMAIL,
    MAILING_PASSWORD,
    CLIENT_URL
} = process.env;

const requiredCreds = [
    "JWT_SECRET_KEY",
    "RESET_SECRET_KEY",
    "NODE_ENV",
    "MONGODB_URI",
    "MONGODB_DEV_URI",
];

try {
    for (const cred of requiredCreds) {
        if (!process.env[cred]) {
            console.error(
                `Error: The environment variable ${cred} is missing. Please ensure that it is defined.`
            );
            process.exit(1);
        }
    }
} catch (err) {
    console.error(`Error: ${err}`);
    process.exit(1);
}

module.exports = {
    NODE_ENV,
    JWT_SECRET_KEY,
    RESET_SECRET_KEY,
    MONGODB_DEV_URI,
    MONGODB_URI,
    superAdminFirstname,
    superAdminLastname,
    superAdminEmail,
    superAdminPassword,
    MAILING_EMAIL,
    MAILING_PASSWORD,
    CLIENT_URL
};
