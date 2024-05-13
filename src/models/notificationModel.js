// Import the mongoose module
const mongoose = require("mongoose");
const { Schema } = mongoose;

const NotificationSchema = new Schema({

    notificationOwner: { 
        type: Schema.Types.ObjectId, 
        required: true
        // ref: "User" 

    },
    notificationType: { 
        type: Schema.Types.ObjectId, 
        // ref: "User",
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

// Dynamically set reference based on type
NotificationSchema.pre('save', async function (next) {
    const userOrAdmin = this.authorType === 'User' ? 'User' : 'Admin';
    this.constructor.schema.obj.notificationOwner.ref = userOrAdmin;
    next();
});


const Notification = mongoose.model("Notification", NotificationSchema);

module.exports = Notification;
