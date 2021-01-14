/*
 * @Description: 入口文件
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:03:54
 * @LastEditTime: 2021-01-12 17:48:20
 * @LastEditors: wish.WuJunLong
 */
import 'core-js/es'  
import 'react-app-polyfill/ie9'  
import 'react-app-polyfill/stable'
import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import axios from './api/api'

React.Component.prototype.$axios = axios

ReactDOM.render(<App />, document.getElementById("yunShangApp"));
