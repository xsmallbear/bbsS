let util = {};

util.getMCBBSpage = ($) => {
    let $pageDom = $(".pgs.cl.mbm").find("span")
    let pageTitle = $pageDom.attr("title")
    if (pageTitle) {
        let pageCount = parseInt(pageTitle.substring(2, 5));
        if (Number.isNaN(pageCount)) return 0;
        return pageCount;
    } else {
        return 0;
    }
}

util.cleanSearchResultAStrong = ($) => {
    let htmlStr = $.html()
    let matchTags = /<[^>]+>/g;
    while (matchTags.exec(htmlStr)) {
        htmlStr = htmlStr.replace(matchTags, "")
    }
    return htmlStr;
}

module.exports = util;