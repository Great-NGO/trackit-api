// Import the mongoose module
const mongoose = require("mongoose");
const { comparePassword, encryptPassword } = require("../utils/passwordEncryption");

const { Schema } = mongoose;

const AdminSchema = new Schema(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: {
            type: String,
            trim: true,
            unique: true,
            required: true
        },
        password: {
            type: String,
            required: true,
            trim: true,
            min: [8, "Password must be atleast 8 characters long"],
            max: [1024, "Password is too long"]
        },
        phoneNumber: {
            type: String,

        },
        isUser: {
            type: Boolean,
            default: true
        },
        isAdmin: {
            type: Boolean,
            default: true
        },
        role: {
            type: String,
            default: "Admin"
        }
    },
    { timestamps: true }
);


// Schema methods - validPasswword to compare admins password if its valid or not 
AdminSchema.methods.validPassword = async function (password) {
    return await comparePassword(password, this.password)
}

AdminSchema.methods.getFullName = function () {
    return `${this.firstname} ${this.lastname}`;
}

const Admin = mongoose.model("Admin", AdminSchema);

module.exports = Admin;
