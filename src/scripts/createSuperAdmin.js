//SCRIPT FILE TO CREATE DEFAULT/SUPER ADMIN USER
require("dotenv").config(); //Comment this out if it doesn't work for you cos of missing env file.

const { connectToDB } = require("../config/dbConfig");
const User = require("../models/userModel");
const { encryptPassword } = require("../utils/passwordEncryption");


const { superAdminFirstname, superAdminLastname, superAdminEmail, superAdminPassword } = require("../utils/envSecrets");
const Admin = require("../models/adminModel");
const log = require("../utils/logger");

connectToDB()
    .then(async () => {

        let superAdmin = {
            firstname: superAdminFirstname,
            lastname: superAdminLastname,
            email: superAdminEmail,
            password: superAdminPassword,
            isAdmin: true,
            role: "Admin"
        };

        let superAdminExists = await Admin.findOne({ email: superAdmin.email });

        if (superAdminExists) {
            log("Super/Default Admin Already Exists", superAdminExists);
            log("Run 'npm run dev' or 'npm start' or 'npm run start' to run the main application server");
            log("Connection Closed");
            //Close the connection
            process.exit(1);
        } else {
            //   let supAdmin = await createAdmin(superAdmin);
            superAdmin.password = await encryptPassword(superAdmin.password)
            let supAdmin = await Admin.create(superAdmin);
            log("Super/Default Admin Created successfully. ", supAdmin);
            log("Default Admin successfully created. Run 'npm run dev' or 'npm start' or 'npm run start' to run the main application server");
            process.exit(1);
        }


    })
    .catch((err) => {
        console.log("ERROR FROM CREATING SUPER ADMIN ", err);
    })
