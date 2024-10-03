
const { body, check } = require("express-validator");


const adminSignupValidator = [

    body("firstName", "Enter Admins First Name").trim().notEmpty().escape(),
    body("lastName", "Enter Admins Last Name").trim().notEmpty().escape(),
    body("email", "Enter Admins email address.").isEmail().normalizeEmail(),
    body("password", "Password is required").trim().notEmpty(),
    body("password", "Password must be strong - must be atleast 8 characters long and contain atleast 1 Uppercase letter, 1 symbol and 1 number").isStrongPassword(),
    
    body("phoneNumber", "Enter Administrator phone number. ").optional({ nullable: true, checkFalsy: true}).trim().notEmpty(),
    body("phoneNumber", "Phone number must be at least 10 digits long.").optional({ nullable: true, checkFalsy: true}).isLength({ min: 10 }),

];

const adminUpdateValidator = [
    check("firstName", "Enter University Admins firstname ").trim().notEmpty().escape(),
    check("lastName", "Enter University Admins lastname ").trim().notEmpty().escape()
]


const addStaffValidator = [

    body("firstName", "Enter Staffs First Name").trim().notEmpty().escape(),
    body("lastName", "Enter Staffs Last Name").trim().notEmpty().escape(),
    body("email", "Enter Staffs Email address.").isEmail().normalizeEmail(),
   
    body("phoneNumber", "Enter phone number. ").trim().notEmpty(),
    body("phoneNumber", "Phone number must be at least 10 digits long.").isLength({ min: 10 }),
    
    body("gender", "Select gender.").trim().notEmpty(),
    body("gender", "Select gender.").custom((value) => {
        const allowedGenderOptions = ["Male", "Female"];
        // If value is not among defined list of allowed gender options
        if (!allowedGenderOptions.includes(value)) {
            throw new Error("Gender is only 'Male' or 'Female'.")
        }
        return true;    //If no error
    }),
    body("age", "Enter Staffs Age").trim().isNumeric()
    // body("dob", "Enter Staffs DOB").isISO8601().toDate()

];


module.exports = {   
    adminSignupValidator,
    adminUpdateValidator,
    addStaffValidator,
}

