const request = require('sync-request')

const httpUtil = {}

httpUtil.get = (url) => {
    while (true) {
        try {
            let res = request("GET", url)
            return res;
        } catch (e) {
            console.log("连接出现问题 开始从新连接")
        }
    }
}

module.exports = httpUtil;