

/** To generate Default passwords for users when they are newly added */
const generateDefaultPassword = () =>{
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456790!@#$%&*()+";
    let newDefaultPassword = "";
    let charsetLength = charset.length;
    let lenghtOfPwd = 12;

    for(let i =0; i<lenghtOfPwd; i++){
        newDefaultPassword+= charset.charAt(Math.floor(Math.random()*charsetLength))
    }

    const value = newDefaultPassword;
    return value;
}

module.exports = {
    generateDefaultPassword
}
