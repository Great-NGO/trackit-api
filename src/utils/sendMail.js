
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
            url1 = `http://localhost:4000/reset-password?token=${token}`;
            url2 = `http://localhost:4000/admin/reset-password?token=${token}`;
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
                subject: "Reset your password",
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
            return [true, null, "Reset Password link sent successfully.", { status: 200}];
        } else {
            return [ false, null, "Something went wrong in sending reset password link", { status: 400, code:result.code} ];
        }
    } catch (error) {
        logger.error(error);
        return translateError(error, "reset password link.")
    }
};


module.exports = { 
    sendResetPwdMail, 
 
};
