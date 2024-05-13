// Import the mongoose module
const mongoose = require("mongoose");
const { Schema } = mongoose;

const CommentSchema = new Schema(
    {
        issueId: {
            type: Schema.Types.ObjectId,
            required: true,
            ref: "Issue"
        },
        body: {
            type: String,
            required: true
        },
        authorId: {
            type: Schema.Types.ObjectId,
            // ref: "User",
            required: true
        },
        authorType: {
            type: String,
            enum: {
                values: ["User", "Admin"],
                message: "'{VALUE}' is not a valid comment author type.",
            },
            default: "User",
            required: true
        },
        type: {
            type: String,
            enum: {
                values: ['Comment', 'Reply'],
                message: '{VALUE} is not a valid type of feedback. Feedback is either a "Comment" or a "Reply"'
            },
            defualt: "Comment",
            required: true,
        },
        // replies: [ { type: ObjectId, ref: "Comment"}],
        parentCommentId: {
            type: Schema.Types.ObjectId,
            ref: "Comment"
        },
        createdOn: { type: Date, default: Date.now },

    },
    { timestamps: true }
);

// Dynamically set reference based on type
CommentSchema.pre('save', async function(next) {
    const userOrAdmin = this.authorType === 'User' ? 'User' : 'Admin';
    this.constructor.schema.obj.authorId.ref = userOrAdmin;
    next();
});


const Comment = mongoose.model("Comment", CommentSchema);

module.exports = Comment;
