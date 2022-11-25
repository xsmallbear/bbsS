const color = require("./color")

const debug = {}

debug.log = (...msg) => {
    msg.forEach(m => {
        console.log(color.FgYellow + "[DEBUG] " + m + color.Reset);
    })
}


module.exports = debug