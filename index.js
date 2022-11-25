'use strict'

const DEBUG = require("./src/help/debug")

//Commands
const look = require("./src/command/look")
const help = require("./src/command/help")
const bsearch = require("./src/command/bsearch")

DEBUG.status = true;

function bbss() {
    process.stdin.setEncoding("utf-8")
    let args = process.argv.splice(2);
    let remainLength = args.length - 1;
    let option = remainLength >= 0 ? args[0] : "err"
    let remainArgs = undefined
    if (remainLength > 0) {
        remainArgs = args.splice(1);
    }

    DEBUG.log("args: " + args)
    DEBUG.log("option: " + option);
    DEBUG.log("remainLength: " + remainLength)
    DEBUG.log("remainArgs: " + remainArgs);

    let optionMap = new Map();

    optionMap["bsearch"] = bsearch
    optionMap["look"] = look

    let optionFunction = optionMap[option];
    if (optionFunction) {
        let result = optionFunction(remainLength, remainArgs)
        if (result === false) {
            help()
        }
    } else {
        help()
    }

    // if (option === "help" && remainLength === 0) {
    //     help();
    //     return
    // }
    // if (option === "bsearch" && remainLength >= 2 && remainLength <= 3) {
    //     let value = remainArgs[0];
    //     let maxPage = parseInt(remainArgs[1]);
    //     let info = remainArgs[2];
    //     bsearch(value, maxPage, info);
    //     return
    // }
    // if (option === "look") {
    //     // let tid = parseInt(remainArgs[0]);
    //     // if(Number.isNaN(tid)) util.error(`${remainArgs[0]} not a number`)
    //     look(remainArgs, remainLength);
    //     return
    // }
    //Error
    // console.log("no command pls use bbsS help")
}

module.exports = bbss