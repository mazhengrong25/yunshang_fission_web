/*
 * @Description: api封装
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:03:54
 * @LastEditTime: 2021-02-10 10:00:41
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

function getNewToken() {
  return axios({
    url: "/api/refresh",
    method: "post",
    headers: {
      Authorization: localStorage.getItem("token"),
    },
  })
    // .then((res) => {
    //   let newToken = `${res.data.token_type} ${res.data.access_token}`;
    //   localStorage.setItem("token", newToken);
    //   let date = this.$moment().add(res.data.expires_in, "ms").format("x");
    //   localStorage.setItem("loginDate", date);
    // })
    // .catch(() => {
    //   return Promise.reject();
    // });
}

// http request 拦截器
instance.interceptors.request.use(
  (config) => {
    // hide = message.loading({content: 'Loading...', duration: 0});
    if (config.url.indexOf("Authenticate") > 0) {
      return config;
    }
    const token = localStorage.getItem("token");
    token && (config.headers.Authorization = token);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


// 是否正在刷新的标记
// let isRefreshing = false;
// 重试队列，每一项将是一个待执行的函数形式
// let requests = [];

// http response 拦截器
instance.interceptors.response.use(
  (response) => {
    if (response.data.msg && response.data.msg.indexOf("Token") > -1) {
      const config = response.config;
      if (!isRefreshing) {
        isRefreshing = true;
        return getNewToken()
          .then(() => {
            let access_token = localStorage.getItem("token");
            config.headers.Authorization = `bearer ${access_token}`;
            // 已经刷新了token，将所有队列中的请求进行重试
            requests.forEach((cb) => cb(access_token));
            requests = [];
            return instance(config);
          })
          .catch(() => {
            // localStorage.clear();
            // this.props.history.push("/")
            return Promise.reject();
          })
          .finally(() => {
            isRefreshing = false;
          });
      } else {
        // 正在刷新token，将返回一个未执行resolve的promise
        return new Promise((resolve) => {
          // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
          requests.push((token) => {
            config.headers.Authorization = `bearer ${token}`;
            resolve(instance(config));
          });
        });
      }
    }
    return response.data;
  },

  // (response) => {
  //   // hide()

  //   if (response.status === 200) {
  //     return Promise.resolve(response.data);
  //   } else {
  //     message.error("响应超时");
  //     return Promise.reject(response.data.message);
  //   }
  // },
  (error) => {
    // hide();
    if (error.response) {
      // 根据请求失败的http状态码去给用户相应的提示
      let tips =
        error.response.status in httpCode
          ? httpCode[error.response.status]
          : error.response.data.message;
      message.error(tips);
      if (error.response.status === 401) {
        //针对框架跳转到登陆页面
        // this.props.history.push("/");
      }
      return Promise.reject(error);
    } else {
      message.error("请求超时, 请刷新重试");
      return Promise.reject("请求超时, 请刷新重试");
    }
  }
);

export default instance;
