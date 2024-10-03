
const nodemailer = require("nodemailer");
const { MAILING_EMAIL, MAILING_PASSWORD } = require("./envSecrets");
const log = require("./logger");
const { translateError } = require("./translateError");
const logger = require("../config/logger");


const sendResetPwdMail = async (email, firstName, token, role = "User") => {
    try {
        let url1;
        let url2;

        if (process.env.NODE_ENV !== "development") {

            url1 = `https://trackit-web.vercel.app/reset-password?token=${token}`;
            url2 = `https://trackit-web.vercel.app/admin/reset-password?token=${token}`;
        } else {
            url1 = `http://localhost:5173/reset-password?token=${token}`;
            url2 = `http://localhost:5173/admin/reset-password?token=${token}`;
        }

        log(url1)
        log(url2)

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: MAILING_EMAIL,
                pass: MAILING_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        let mail;
        if (role === "user" || role === "User") {
            mail = {
                from: MAILING_EMAIL,
                to: email,
                subject: "TRACKIT - Reset your password",
                html: `
               Dear <strong>${firstName}</strong>,
               <p>Having an issue with remembering your password? Well don't worry! </p>
               <p>Click the link below to complete your password reset process within the next 30 minutes </p>
               <br> <a href="${url1}">Click here to reset your password</a>
               
            `,
            };
        } else {
            mail = {
                from: MAILING_EMAIL,
                to: email,
                subject: "Reset your password",
                html: `
               Dear Admin <strong>${firstName}</strong>,
               <p>Click the link below to complete your password reset process within the next 30 minutes </p>
               <br> <a href="${url2}">Click here to reset your password</a>
            `,
            };
        }

        const result = await transporter.sendMail(mail);
        log("The result ", result);
        if (result.accepted) {
            return [true, "Reset Password link sent successfully.", { status: 200 }];
        } else {
            return [false, "Something went wrong in sending reset password link", { status: 400, code: result.code }];
        }
    } catch (error) {
        log("The error from sendresetpwdmail util function", error);
        logger.error("The error from sendresetpwdmail util function", error);
        return translateError(error, "reset password link.")
    }
};

const sendNotificationMail = async (email, firstname) => {
    try {
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: MAILING_EMAIL,
                pass: MAILING_PASSWORD,
            },
            tls: {
                rejectUnauthorized: false,
            },
        });

        let mail = {
            from: "TRACKIT",
            to: email,
            subject: "Notification of new issue report - TRACKIT",
            html: `
             Hi <strong>${firstname}</strong>,
             <p> You have a new issue report on your Trackit account. Please check it out. </p>
             <h3> Thank you for using Trackit, and have a great day! </h3>
          `,
        };

        const result = await transporter.sendMail(mail);
        log("The result from sending ", result);

        if (result.accepted) {
            return [true, "Notification mail sent successfully.", { status: 200 }];
        } else {
            return [false, "Something went wrong in sending notification mail.", { status: 400, code: result.code }];
        }

    } catch (error) {
        logger.error(error);
        return translateError(error, "sending notification email.");

    }
};

module.exports = {
    sendResetPwdMail,
    sendNotificationMail
};
