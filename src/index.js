/*
 * @Description: 入口文件
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:03:54
 * @LastEditTime: 2021-02-04 11:17:11
 * @LastEditors: mzr
 */
import 'core-js/es'  
import 'react-app-polyfill/ie9'  
import 'react-app-polyfill/stable'
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import axios from './api/api'

React.Component.prototype.$axios = axios
React.Component.prototype.$url = 'https://fxxcx.ystrip.cn'

ReactDOM.render(<App />, document.getElementById("yunShangApp"));
