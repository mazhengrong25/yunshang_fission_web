/*
 * @Description: 入口文件
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:03:54
 * @LastEditTime: 2021-04-13 18:12:31
 * @LastEditors: mzr
 */
import "core-js/es";
import "react-app-polyfill/ie9";
import "react-app-polyfill/stable";
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import axios from "./api/api";

import moment from "moment";
import "moment/locale/zh-cn";

React.Component.prototype.$axios = axios;
React.Component.prototype.$moment = moment;
React.Component.prototype.$url = 'https://fxxcx.ystrip.cn';


// 拆分地址栏参数
React.$filterUrlParams = (val) => {
  if (val) {
    let str = val.replace("?", "");
    let arr = str.split("&");
    let obj = {};
    arr.forEach((e) => {
      let key = e.split("=");
      obj[key[0]] = key[1];
    });
    return obj;
  }
};

ReactDOM.render(<App />, document.getElementById("yunShangApp"));
