// Import the mongoose module
const mongoose = require("mongoose");

const { Schema } = mongoose;

const resetTokenSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            required: true
        },
        token: {
            type: String,
            required: true,
        },
        type: {
            type: String,
            enum: {
                values: ["User", "Admin"],
                message: "'{VALUE}' is not a valid reset token type.",
            },
            default: "User",
            required: true
        },
        expiryDate: {
            type: Date,
            // default: Date.now() + 1000 * 60 * 60 * 2  //Token should be valid for 2 hours by default
            default: function () {
                // Calculate expiry date dynamically (2 hours from now)
                return new Date(Date.now() + 1000 * 60 * 60 * 2);
            }
        },
    },
    { timestamps: true }
);

// Dynamically set reference based on type
resetTokenSchema.pre('save', async function(next) {
    const userOrAdmin = this.type === 'User' ? 'User' : 'Admin';
    this.constructor.schema.obj.userId.ref = userOrAdmin;
    next();
});


const ResetToken = mongoose.model("Reset-Token", resetTokenSchema);

module.exports = ResetToken;
