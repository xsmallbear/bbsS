const request = require('sync-request');
const cheerio = require("cheerio")

const Setting = require("./setting")
const util = require("./util")

const MCBBSURL = "https://www.mcbbs.net/";
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

function bsearch(findValue, maxpage) {
    let searchUrl = `${MCBBSURL}search.php?mod=forum&wd=${encodeURIComponent(findValue)}&orderby=_score&ascdesc=desc&searchsubmit=yes&srchtype=title`;
    let max = Number.isNaN(maxpage) ? 1 : maxpage;
    console.log("-----开始搜素信息!-----")
    console.log("查找内容:" + findValue);
    console.log("搜素页数" + max);
    console.log("---------------------")

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

        let res = request("GET", currentuRrl);
        let $ = cheerio.load(res.getBody("UTF-8"))
        //如果是第一页那就获取页数信息 保证循环不会超过页数
        if (pageCount == 1) {
            let innerPageCount = util.getMCBBSpage($)
            console.log("最大页数:", innerPageCount);
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
            let href = $h3_a.attr("href");
            let title = util.cleanSearchResultAStrong($h3_a)
            console.log("---------------------------------------------------------------------");
            console.log("[index]:" + (pageIndex + 1) + ":" + resultIndex);
            console.log("[title]:" + title);
            console.log("[time]:" + time);
            console.log("[href]:" + href);
            // console.log(`${title}\t${time}\t${href}`);
        })
    }
}

function main() {
    process.stdin.setEncoding("utf-8")
    let args = process.argv.splice(2);
    let restLen = args.length - 1;
    let option = restLen >= 0 ? args[0] : "err"
    let restArgs = undefined
    if (restLen > 0)
        restArgs = args.splice(1);


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
    } else if (option === "bsearch" && restLen === 2) {
        let value = restArgs[0];
        let maxPage = parseInt(restArgs[1]);
        bsearch(value, maxPage);
    } else {
        console.log("no command pls use help~~~")
    }
}

main();