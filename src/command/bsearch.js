const cheerio = require("cheerio")
const fs = require("fs");

const setting = require("../setting")
const color = require("../../src/help/color")
const DEBUG = require("../../src/help/debug")
const httpUtil = require("../../src/help/httpUtil")
const util = require("../../src/help/util")

const OUTPUT = "output.log"

const bsearch = (remainLength, remainArgs) => {
    if (remainLength < 2 || remainLength > 3) {
        return false;
    }
    let findValue = remainArgs[0];
    let maxpage = parseInt(remainArgs[1]);
    let info = remainArgs[2];

    let searchFileOutBuffer = ""
    let searchUrl = `${setting.MCBBSURL}search.php?mod=forum&wd=${encodeURIComponent(findValue)}&orderby=_score&ascdesc=desc&searchsubmit=yes&srchtype=title`;
    let max = Number.isNaN(maxpage) ? 1 : maxpage;
    console.log(color.FgCyan + "---------------------------------------------------------------------" + color.Reset)
    console.log(color.FgCyan + "搜素关键字:" + findValue + color.Reset);
    console.log(color.FgCyan + "搜素页数:" + max + color.Reset);
    console.log(color.FgCyan + "---------------------------------------------------------------------" + color.Reset)
    searchFileOutBuffer += "---------------------------------------------------------------------\n"
        + "搜素关键字:" + findValue + "\n"
        + "搜素页数:" + max + "\n"

    let pageCount = 1

    for (let pageIndex = 0; pageIndex < maxpage && pageIndex < pageCount; pageIndex++) {

        let currentuRrl = searchUrl + `&page=${pageIndex + 1}`
        DEBUG.log("开始搜素第" + (pageIndex + 1) + "页")
        DEBUG.log("搜素URL: " + currentuRrl);

        let res = httpUtil.get(currentuRrl);
        let $ = cheerio.load(res.getBody("UTF-8"))
        //如果是第一页那就获取页数信息 保证循环不会超过页数
        if (pageCount == 1) {
            let innerPageCount = util.getMCBBSpage($)
            console.log("最大可搜素页数:", innerPageCount)
            if (pageCount != 0)
                pageCount = innerPageCount;
        }

        let li = $(".slst.mtw").find(".pbw")
        DEBUG.log("当前页面搜素结果数量: " + li.length)
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
                console.log("[index]:" + (pageIndex + 1) + ":" + (resultIndex + 1));
                console.log("[title]:" + title);
                console.log("[time]:" + time);
                console.log("[href]:" + href);
                searchFileOutBuffer += "---------------------------------------------------------------------\n"
                    + "[index]:" + (pageIndex + 1) + ":" + (resultIndex + 1) + "\n"
                    + "[title]:" + title + "\n"
                    + "[time]:" + time + "\n"
                    + "[href]:" + href + "\n";
            } else {
                let index = `${color.FgCyan}[${(pageIndex + 1)}:${resultIndex + 1}]${color.Reset}`
                let context = `${color.FgGreen}${title} ${color.Reset}${color.FgRed}${time}${color.Reset}`;
                console.log(`${index}${context} ${id}`);
                searchFileOutBuffer += `[${(pageIndex + 1)}:${resultIndex + 1}]${title} ${time} ${id}\n`
            }
        })

        //写入文件
        fs.writeFileSync(OUTPUT, searchFileOutBuffer, "utf-8")
        DEBUG.log("第" + (pageIndex + 1) + "页 文件写入成功")
    }
    return true;
}

module.exports = bsearch