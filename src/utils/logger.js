const { NODE_ENV } = require("./envSecrets");

// const log = (...params) => {
    
//     NODE_ENV !== 'production' ?
//         params.forEach(param => console.log(param)) : ''
// }

const log = (...params) => {
    
    NODE_ENV !== 'production' ?
        console.log(...params) : ''
}

module.exports = log;