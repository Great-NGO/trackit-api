// Issue Model
const mongoose = require('mongoose');

const { Schema } = mongoose;

const issueSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    customer: {
        type: String,
        required: true
    }, //customer or client who raised the issue
    sbu: {
        type: String,
        required: true
    },  //sbu- strategic business unit
    solution: {
        type: String,
        required: true
    },
    module: {
        type: String
    },
    severity: {
        type: String,
        enum: {
            values: ["low", "medium", "high"],
            message: "'{VALUE}' is not a valid issue report severity.",
        },
        required: true
    },
    status: {
        type: String,
        enum: {
            values: ["open", "in-progress", "resolved"],
            message: "'{VALUE}' is not a valid issue report status.",
        },
        default: 'open'
    },
    reporter: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },  //The User that submitted a report
    assignee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        // required: true
    },  //Person an issue has been assigned to (probably by an admin)
    comments: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
    dateCreated: {
        type: Date,
        default: Date.now
    },
    updatedOn: {
        type: Date,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    attachments: {
        type: String
    }   //For possible attachments

}, {
    timestamps: true
});

// Each time an update occurs on an issue document, the updatedOn date is updated
issueSchema.pre('save', function (next) {
    this.updatedOn = new Date();
    next();
});

issueSchema.pre('update', function (next) {
    this.update({}, { $set: { updatedOn: new Date() } });
    next();
});

const Issue = mongoose.model('Issue', issueSchema);

module.exports = Issue;