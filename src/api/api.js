/*
 * @Description: api封装
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:03:54
<<<<<<< HEAD
<<<<<<< HEAD
 * @LastEditTime: 2021-02-04 10:50:47
 * @LastEditors: mzr
=======
 * @LastEditTime: 2021-02-04 10:29:15
=======
 * @LastEditTime: 2021-02-05 13:58:33
>>>>>>> 268a692a201a6f343d9577710790f1c0943090b0
 * @LastEditors: wish.WuJunLong
 */
import axios from "axios";

import { message } from "antd";

// let hide = null;

// let baseUrl = "";
// if (process.env.NODE_ENV === "development") {
//   baseUrl = "http://192.168.0.187";
// } else if (process.env.NODE_ENV === "production") {
//   baseUrl = "http://192.168.0.69:7996";
// }

// axios.defaults.baseURL = baseUrl;

let instance = axios.create({
  timeout: 1000 * 12,
});

let httpCode = {
  400: "请求参数错误",
  401: "权限不足, 请重新登录",
  403: "服务器拒绝本次访问",
  404: "请求资源未找到",
  500: "内部服务器错误",
  501: "服务器不支持该请求中使用的方法",
  502: "网关错误",
  504: "网关超时",
};

// http request 拦截器
instance.interceptors.request.use(
  (config) => {
    // hide = message.loading({content: 'Loading...', duration: 0});
    if (config.url.indexOf("Authenticate") > 0) {
      return config;
    }

    console.log(config)

    const token = localStorage.getItem("token");
    token && (config.headers.Authorization = token);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// http response 拦截器
 instance.interceptors.response.use(
  (response) => {
    hide()       
    if (response.status === 200) {    
      return Promise.resolve(response.data)
    } else {
      message.error('响应超时')
      return Promise.reject(response.data.message)
    }
  },
  (error) => {
    hide();
    if (error.response) {
      // 根据请求失败的http状态码去给用户相应的提示
      let tips =
      error.response.status in httpCode
      ? httpCode[error.response.status]
      : error.response.data.message;
      message.error(tips);
      if (error.response.status === 401) {
        //针对框架跳转到登陆页面
        // this.props.history.push(LOGIN);
      }
      return Promise.reject(error);
    } else {
      message.error("请求超时, 请刷新重试");
      return Promise.reject("请求超时, 请刷新重试");
    }
  }
);

export default instance;
