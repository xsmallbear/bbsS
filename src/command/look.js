const cheerio = require("cheerio")

const util = require("../help/util")
const setting = require("../setting")
const httpUtil = require("../help/httpUtil")

const look = (remainLength, remainArgs) => {

    if (remainLength != 1) return false
    let tid = parseInt(remainArgs[0])
    if (Number.isNaN(tid)) return false

    //main logic
    const ThreadUrl = `${setting.MCBBSURL}forum.php?mod=viewthread&tid=${tid}`;
    console.log("帖子请求URL: " + ThreadUrl)
    let res = httpUtil.get(ThreadUrl);

    let $ = cheerio.load(res.getBody("UTF-8"))
    let number = util.getMCBBSpage($)
    console.log("页数" + number)
    let name = $("#thread_subject").html();
    console.log("帖子名称", name)
    let breadCrumbNames = $("#pt").find("a")
    breadCrumbNames.each(function (index) {
        console.log($(this).html())
    })
    // console.log("页面导航", util.cleanHTMLTag(breadCrumb).split("›"));

    return true
}

module.exports = look