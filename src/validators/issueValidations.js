const { body, check } = require("express-validator");


const newIssueValidator = [

    body("description", "Enter description of issue").trim().notEmpty().escape(),
    body("customer", "Enter Customer or Client's name").trim().notEmpty().escape(),
    body("sbu", "Enter SBU (Strategic Business Unit).").trim().notEmpty().escape(),
    body("solution", "Enter solution.").trim().notEmpty().escape(),
    body("module", "Enter module for issue.").trim().notEmpty().escape(),
    body("severity", "Select issue severity.").trim().notEmpty(),
    body("severity", "Select issue severity.").custom((value) => {
        const allowedSeverityOptions = ["low", "medium", "high"];
        // If value is not among defined list of allowed severity options
        if (!allowedSeverityOptions.includes(value)) {
            throw new Error("Value for severity can only be 'low', 'medium' or 'high'.")
        }
        return true;    //If no error
    }),
    body("dueDate", "Enter Due Date for Issue").isISO8601().toDate()

];

const updateIssueValidator = [
    body("issueId", "Enter Issue ID.").trim().notEmpty(),
    body("status", "Update issue status.").trim().notEmpty(),
    body("status", "Update issue status.").custom((value) => {
        const allowedStatusOptions = ["open", "in-progress", "resolved"];
        // If value is not among defined list of allowed status options
        if (!allowedStatusOptions.includes(value)) {
            throw new Error("Value for status can only be 'open' (status by default), 'in-progress' or 'resolved'.")
        }
        return true;    //If no error
    }),
    body("assignee", "Enter Assignee ID dministrator phone number. ").optional({ nullable: true, checkFalsy: true}).trim().notEmpty(),

]

module.exports = {
    newIssueValidator,
    updateIssueValidator
}
