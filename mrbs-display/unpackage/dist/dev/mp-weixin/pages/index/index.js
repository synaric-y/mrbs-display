"use strict";
const common_vendor = require("../../common/vendor.js");
const pages_index_config = require("./config.js");
const common_assets = require("../../common/assets.js");
const _sfc_main = {
  data() {
    return {
      lineStartTime: 8,
      lineEndTime: 21,
      spanList: [],
      timelineInterval: 30 * 60,
      // 会议安排时间线的最小单位30分钟
      timelineColorList: [],
      syncData: {},
      foundNextEntry: {}
    };
  },
  onLoad() {
    this.syncRoom();
    setInterval(() => {
      this.syncRoom();
    }, 5e3);
  },
  methods: {
    syncRoom() {
      common_vendor.index.request({
        url: `${pages_index_config.HOST}/web/appapi/api.php?act=sync_room`,
        method: "POST",
        header: {
          "Content-type": "application/x-www-form-urlencoded",
          "Accept-Language": "zh-CN,zh;q=0.9"
          //根据要求来配置
        },
        data: {
          room_id: 1
        },
        success: (res) => {
          let data = res.data.data;
          console.log("返回数据", data);
          data.now_ap = data.now_time.slice(-2);
          data.now_time = data.now_time.slice(0, -2);
          if (data.entries) {
            for (let e of data.entries) {
              e.start_end = this.formatTime(e["start_time"]) + "-" + this.formatTime(e["end_time"]);
            }
          }
          if (data.now_entry) {
            data.now_entry.start_end = this.formatTime(data.now_entry["start_time"]) + "-" + this.formatTime(data.now_entry["end_time"]);
          }
          this.syncData = data;
          this.initTimeLine(data);
        },
        fail: (e) => {
          console.error(e);
        }
      });
    },
    initTimeLine(data) {
      let tempTime = this.lineStartTime;
      let spanList = [];
      let isFirst = true;
      while (tempTime <= this.lineEndTime) {
        if (!isFirst) {
          spanList.push({
            text: "·",
            type: 1
          });
        }
        let span = tempTime.toString().padStart(2, "0") + ":00";
        spanList.push({
          text: span,
          type: 0
        });
        isFirst = false;
        tempTime += 1;
      }
      this.spanList = spanList;
      let foundNextEntry = false;
      let entryList = data.entries;
      let nowTime = (/* @__PURE__ */ new Date()).getTime() / 1e3;
      for (let entry of entryList) {
        if (nowTime < entry["start_time"]) {
          foundNextEntry = entry;
          break;
        }
      }
      if (foundNextEntry) {
        this.foundNextEntry = foundNextEntry;
      }
      let todayStart = this.getTimestampOfTodayStart();
      let timelineColorList = [];
      let totalWidth = 750 - 37 - 37;
      let totalSeconds = (this.lineEndTime - this.lineStartTime + 1) * 60 * 60;
      tempTime = this.lineStartTime * 60 * 60 + todayStart;
      let idleStartTime = 0;
      while (tempTime <= (this.lineEndTime + 1) * 60 * 60 + todayStart) {
        let found = false;
        for (let entry of entryList) {
          if (tempTime >= entry["start_time"] && tempTime <= entry["end_time"]) {
            if (idleStartTime != 0) {
              let w = (tempTime - idleStartTime) / totalSeconds * totalWidth;
              if (w > 0) {
                timelineColorList.push({
                  text: "可预订",
                  textColor: "white",
                  bg: "#08D50A",
                  width: (tempTime - idleStartTime) / totalSeconds * totalWidth
                });
              }
              idleStartTime = 0;
            }
            let text = "已预定";
            let bg = "#FF0000";
            let textColor = "white";
            if (nowTime >= entry["start_time"] && nowTime <= entry["end_time"]) {
              text = "会议中";
              bg = "#FFFF00";
              textColor = "black";
            }
            timelineColorList.push({
              text,
              bg,
              name: entry["name"],
              textColor,
              width: (entry["end_time"] - entry["start_time"]) / totalSeconds * totalWidth
            });
            found = true;
            tempTime = entry["end_time"];
            idleStartTime = entry["end_time"];
            break;
          }
        }
        if (!found) {
          if (idleStartTime == 0) {
            idleStartTime = tempTime;
          }
          tempTime += this.timelineInterval;
        } else {
          entryList.shift();
        }
      }
      if (idleStartTime != 0) {
        timelineColorList.push({
          text: "可预订",
          bg: "#08D50A",
          textColor: "white",
          width: (tempTime - idleStartTime - this.timelineInterval) / totalSeconds * totalWidth
        });
      }
      console.log(timelineColorList);
      this.timelineColorList = timelineColorList;
    },
    // getNowTime() {
    // 	const now = new Date();
    // 	const hours = now.getHours()
    // 	const minutes = now.getMinutes()
    // 	const seconds = now.getSeconds()
    // 	return hours * 60 * 60 + minutes * 60 + seconds
    // },
    getTimestampOfTodayStart() {
      let today = /* @__PURE__ */ new Date();
      today.setHours(0, 0, 0, 0);
      return today.getTime() / 1e3;
    },
    formatTime(timestamp) {
      var date = new Date(timestamp * 1e3);
      var hours = date.getHours().toString().padStart(2, "0");
      var minutes = date.getMinutes().toString().padStart(2, "0");
      return hours + ":" + minutes;
    }
  }
};
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return common_vendor.e({
    a: common_assets._imports_0,
    b: common_vendor.t($data.syncData.now_time),
    c: common_vendor.t($data.syncData.now_ap),
    d: common_vendor.t($data.syncData.display_day),
    e: common_assets._imports_1,
    f: common_vendor.t($data.syncData.room ? $data.syncData.room.room_name : " "),
    g: $data.syncData && $data.syncData.now_entry
  }, $data.syncData && $data.syncData.now_entry ? {
    h: common_vendor.t($data.syncData.now_entry.name),
    i: common_vendor.t($data.syncData.now_entry.start_end),
    j: common_vendor.t($data.syncData.now_entry.book_by)
  } : $data.foundNextEntry ? common_vendor.e({
    l: $data.foundNextEntry && $data.foundNextEntry.name
  }, $data.foundNextEntry && $data.foundNextEntry.name ? {
    m: common_vendor.t($data.foundNextEntry.name),
    n: common_vendor.t($data.foundNextEntry.start_end),
    o: common_vendor.t($data.foundNextEntry.book_by)
  } : {}) : {}, {
    k: $data.foundNextEntry,
    p: common_vendor.f($data.spanList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.text),
        b: common_vendor.n(item.type == 0 ? "time-span-text" : "time-span-dot"),
        c: index
      };
    }),
    q: common_vendor.f($data.timelineColorList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.text),
        b: index,
        c: item.bg,
        d: item.width + "rpx",
        e: item.textColor
      };
    }),
    r: common_vendor.f($data.timelineColorList, (item, index, i0) => {
      return {
        a: common_vendor.t(item.name),
        b: index,
        c: item.width + "rpx"
      };
    }),
    s: common_assets._imports_2
  });
}
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["render", _sfc_render]]);
wx.createPage(MiniProgramPage);
