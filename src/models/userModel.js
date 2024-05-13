// Import the mongoose module
const mongoose = require("mongoose");
const { comparePassword, encryptPassword } = require("../utils/passwordEncryption");

const { Schema } = mongoose;

const UserSchema = new Schema(
    {
        firstname: { type: String, required: true, trim: true },
        lastname: { type: String, required: true, trim: true },
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
        dob: {  //Date Of Birth
            type: Date,
        },
        gender: {
            type: String,
            enum: {
                values: ["Male", "Female"],
                message: "'{VALUE}' is not a valid gender.",
            },
        },
        phoneNumber: {
            type: String,
        },
        address: { type: String },
        dept: {
            type: String
        },
        isUser: {
            type: Boolean,
            default: true
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        role: {
            type: String,
            default: "User"
        }
    },
    { timestamps: true }
);


// Schema methods - validPasswword to compare a users password if its valid or not 
UserSchema.methods.validPassword = async function (password) {
    return await comparePassword(password, this.password)
}

UserSchema.methods.getFullName = function () {
    return `${this.firstname} ${this.lastname}`;
}

const User = mongoose.model("User", UserSchema);

module.exports = User;
