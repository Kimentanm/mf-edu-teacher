export default {
    formatDate(date, fmt) {
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
        }
        let o = {
            'M+': date.getMonth() + 1,
            'd+': date.getDate(),
            'h+': date.getHours(),
            'm+': date.getMinutes(),
            's+': date.getSeconds()
        };
        for (let k in o) {
            if (new RegExp(`(${k})`).test(fmt)) {
                let str = o[k] + '';
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? str : this.padLeftZero(str));
            }
        }
        return fmt;
    },

    padLeftZero(str) {
        return ('00' + str).substr(str.length);
    },

    isBefore(d1, d2) {
        return ((new Date(d1.replace(/-/g, '\/'))) < (new Date(d2.replace(/-/g, '\/'))));
    },

    isEquals(d1, d2) {
        return ((new Date(d1.replace(/-/g, '\/'))) === (new Date(d2.replace(/-/g, '\/'))));
    },

    getDateBySelect(date, day, zf) {
        let oneDayLong = 24*60*60*1000;
        let dayObj = {
            startDate: undefined,
            endDate: undefined,
        };
        // 获取前day天的时间
        if (zf === 1) {
            let preDay = new Date(date.getTime() - day * oneDayLong);
            dayObj.startDate = preDay;
            dayObj.endDate = new Date(date.getTime());
        } else if (zf === 2) {
            // 获取后day天的数据
            dayObj.startDate = new Date(date.getTime() + 1 * 1000);
            dayObj.endDate = new Date(date.getTime() + day * oneDayLong);
        }
        return dayObj;
    },

}
