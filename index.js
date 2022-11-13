'use strict'

const request = require('sync-request');
const cheerio = require("cheerio")
const fs = require("fs");

const Setting = require("./src/setting")
const util = require("./src/util")
const color = require("./src/color");
const { time } = require('console');

const MCBBSURL = "https://www.mcbbs.net/";
const OUTPUT = "output.log";
const DEBUG = false;

function error(msg) {
    if (msg) {
        console.log(msg)
    } else {
        console.log("error!")
    } 
    process.exit(1);
}

function help() {
    console.log("----------bbsS help----------");
    console.log("help show help")
    console.log("bsearch [value] [maxpage]")
}

function bsearch(findValue, maxpage, info) {
    let searchFileOutBuffer = ""
    let searchUrl = `${MCBBSURL}search.php?mod=forum&wd=${encodeURIComponent(findValue)}&orderby=_score&ascdesc=desc&searchsubmit=yes&srchtype=title`;
    let max = Number.isNaN(maxpage) ? 1 : maxpage;
    console.log(color.FgCyan + "---------------------------------------------------------------------" + color.Reset)
    console.log(color.FgCyan + "搜素关键字:" + findValue + color.Reset);
    console.log(color.FgCyan + "搜素页数:" + max + color.Reset);
    console.log(color.FgCyan + "---------------------------------------------------------------------" + color.Reset)
    searchFileOutBuffer += "---------------------------------------------------------------------\n"
        + "搜素关键字:" + findValue + "\n"
        + "搜素页数:" + max + "\n"

    let pageCount = 1;

    for (let pageIndex = 0; pageIndex < maxpage && pageIndex < pageCount; pageIndex++) {
        //DEBUG START
        if (DEBUG) {
            console.log("开始搜素第" + (pageIndex + 1) + "页")
        }
        //DEBUG END
        let currentuRrl = searchUrl + `&page=${pageIndex + 1}`

        //DEBUG START
        if (DEBUG) {
            console.log("搜素URL:", currentuRrl);
        }
        //DEBUG END
        let getfunction = (url) => {
            while (true) {
                try {
                    let res = request("GET", url)
                    return res;
                } catch (e) {
                    console.log("连接出现问题 开始从新连接");
                }
            }
        }
        let res = getfunction(currentuRrl);
        let $ = cheerio.load(res.getBody("UTF-8"))
        //如果是第一页那就获取页数信息 保证循环不会超过页数
        if (pageCount == 1) {
            let innerPageCount = util.getMCBBSpage($)
            console.log("最大可搜素页数:", innerPageCount);
            if (pageCount != 0)
                pageCount = innerPageCount;
        }

        let li = $(".slst.mtw").find(".pbw")
        //DEBUF START
        if (DEBUG) {
            console.log("当前页面搜素结果数量:", li.length)
        }
        //DEBUF END
        li.each(function (resultIndex) {
            //时间
            let $spawn = $(this).find("p").children("span")  // 这里有三个spawn 这里默认拿第一个
            let time = $spawn.html();
            //标题和链接
            let $h3 = $(this).children(".xs3");
            let $h3_a = $h3.children("a");
            let id = $(this).attr("id");
            let href = $h3_a.attr("href");
            let title = util.cleanSearchResultAStrong($h3_a)

            //控制台输出
            if (info === "-l") {
                console.log("---------------------------------------------------------------------");
                console.log("[index]:" + (pageIndex + 1) + ":" + resultIndex);
                console.log("[title]:" + title);
                console.log("[time]:" + time);
                console.log("[href]:" + href);
            } else {
                let index = `${color.FgCyan}[${(pageIndex + 1)}:${resultIndex + 1}]${color.Reset}`
                let context = `${color.FgGreen}${title} ${color.Reset}${color.FgRed}${time}${color.Reset}`;
                console.log(`${index}${context} ${id}`);
            }
            searchFileOutBuffer += "---------------------------------------------------------------------\n"
                + "[index]:" + (pageIndex + 1) + ":" + (resultIndex + 1) + "\n"
                + "[title]:" + title + "\n"
                + "[time]:" + time + "\n"
                + "[href]:" + href + "\n";
        })

        //写入文件
        fs.writeFileSync(OUTPUT, searchFileOutBuffer, "utf-8")
        //DEBUF START
        if (DEBUG) {
            console.log("第" + (pageIndex + 1) + "页 文件写入成功")
        }
        //DEBUG END
    }
}

function bbss() {
    process.stdin.setEncoding("utf-8")
    let args = process.argv.splice(2);
    let restLen = args.length - 1;
    let option = restLen >= 0 ? args[0] : "err"
    let restArgs = undefined
    if (restLen > 0) {
        restArgs = args.splice(1);
    }
    //DEBUG INFO START
    if (DEBUG) {
        console.log("-----debug info-----")
        console.log("option:", option);
        console.log("argsLen:", restLen)
        console.log("restArgs", restArgs);
        console.log("--------------------")
    }
    //DEBUG INFO END

    if (option === "help" && restLen === 0) {
        help();
    } else if (option === "bsearch" && restLen >= 2 && restLen <= 3) {
        let value = restArgs[0];
        let maxPage = parseInt(restArgs[1]);
        let info = restArgs[2];
        bsearch(value, maxPage, info);
    } else {
        console.log("no command pls use help~~~")
    }
}

module.exports = bbss