// Import the mongoose module
const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotificationSchema = new Schema({

    recipient: {
        type: Schema.Types.ObjectId,
        // required: true
        // ref: "User" 
    },
    recipientType: {
        type: String,
        enum: {
            values: ['Admin', 'User'],
            message: '{VALUE} is not supported'
        },
        required: true,
        default: "Admin"

    },
    actionType: {
        type: String,
        enum: {
            values: ['Reports', 'Status', 'Comment'], //notification if theres a new report submitted (for the admin), status update on an issue (from the admin to a reporter), if there's a comment on an issue posted (reporter)
            message: '{VALUE} is not supported'
        },
        required: true
    },
    issueId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Issue"
    },
    date: {
        type: Date,
        default: Date.now
    }
},
    { timestamps: true }
);

const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
