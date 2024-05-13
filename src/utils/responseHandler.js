/** Response handler to handle all api responses 
*  TResponseHandler = { 
        res: Response,
        message : string,
        status: number,
        boolean?: boolean,
        data?: any | null
    };
*/
const responseHandler = (res, message, statusCode, success = false, data = null) => {
    if (success === false) {
        return res.status(statusCode).json({
            success,
            error: message,
            status: statusCode
        })
    } else {
        return res.status(statusCode).json({
            success,
            message,
            status: statusCode,
            data

        })
    }
}

module.exports = {
    responseHandler
}
