/** ApiError Class */
class ApiError extends Error {
    constructor(status, errMessage) {
        super();    //Used to call the constructor of the parent (Error) class to access its properties and methods
        this.status = status;
        this.message = errMessage;
    }
}

module.exports = ApiError