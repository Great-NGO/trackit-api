

const BaseRepository = require("./baseRepoService")
const Issue = require("../models/issueModel");
const logger = require("../config/logger");
const mongoose = require("mongoose");
const { sendNotificationMail } = require("../utils/sendMail");
const { superAdminEmail, superAdminFirstname } = require("../utils/envSecrets");
const { translateError } = require("../utils/translateError");
const log = require("../utils/logger");
const Notification = require("../models/notificationModel");

/** Issue Service Class - Manage every Issue related operation */
class IssueService extends BaseRepository {

    constructor() {
        super(Issue)
    }

    /** User upload new report */
    static async submitNewReport({ description, customer, sbu, solution, module, severity, dueDate, reporterId, attachments }) {

        const session = await mongoose.startSession();
        session.startTransaction();

        try {

            /** Workflow - Check if any exact or similar report has been uploaded, show error - no duplicates allowed, 
             * if no similar report/issue, create new issue, send notification to admin about issue
             */

            log("reporter id ", reporterId);

            const exactDuplicateCount = await Issue.countDocuments({
                sbu: { $regex: `${sbu}`, $options: "i" },
                description: { $regex: `${description}`, $options: "i" },
                solution: { $regex: `${solution}`, $options: "i" },
                module: { $regex: `${module}`, $options: "i" },
                customer: { $regex: `${customer}`, $options: "i" },
            });

            if (exactDuplicateCount > 0) {
                return [false, null, "Duplicate Issue Report: Report already exists.", { status: 400 }];
            }

            // If no exact match, check for partial match based on description and same SBU
            const similarReportCount = await Issue.countDocuments({
                sbu: { $regex: `${sbu}`, $options: 'i' }, // Case-insensitive match for sbu
                description: { $regex: `${description}`, $options: 'i' } // Case-insensitive partial match for description
            });

            if (similarReportCount > 0) {
                return [false, null, "Similar Issue Report: A similar report has been submitted under the same SBU.", { status: 400 }];

            }

            // Proceed to create new report
            let newReport = {
                description,
                customer,
                sbu,
                solution,
                module,
                severity,
                reporter: reporterId,
                dueDate,
                // attachments
            };

            const createdData = await Issue.create([newReport], { session });

            const newNotification = await Notification.create([{
                recipientType: "Admin",
                actionType: "Reports",
                issueId: createdData[0]._id

            }], { session });

            // const [mailSuccess, mailMessage] = await sendNotificationMail(superAdminEmail, superAdminFirstname);
            // if (!mailSuccess) {
            //     // End session and abort transaction - undoing every db commit/write
            //     await session.abortTransaction();
            //     session.endSession();
            //     return [false, null, mailMessage, { status: 400 }];
            // }

            // Commit transaction and end session
            await session.commitTransaction();
            session.endSession();

            return [true, createdData, 'Issue Report submitted successfully.', { status: 200 }];

        } catch (error) {

            logger.error("Error from Submit new report service method", error);
            // End session and abort transaction - undoing every db commit/write
            await session.abortTransaction();
            session.endSession();

            const errResponse = translateError(error, "submitting new issue report.");
            return errResponse;
        }
    }


}

module.exports = IssueService;