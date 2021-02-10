/*
 * @Description: 主模块
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:03:54
 * @LastEditTime: 2021-02-10 11:18:21
 * @LastEditors: wish.WuJunLong
 */
import React, { Fragment } from "react";

import { BackTop, ConfigProvider } from "antd";

import Login from "./pages/login";
import Home from "./pages/home"; // 主页
import InlandList from "./pages/orderList/inlandLlist"; // 国内列表
import InlandDetail from "./pages/orderList/inlandDetail"; //国内列表详情
import FlightList from "./pages/flightList"; // 航班查询列表

import HeaderTemplate from "./components/Header";  // 导航栏

import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

import locale from "antd/lib/locale/zh_CN";

import "./global.scss";

function App() {
  return (
    <ConfigProvider locale={locale}>
      <HeaderTemplate />
      <Fragment>
        <HashRouter>
          <Switch>
            <Route path="/inlandDetail" component={InlandDetail} />
            <Route path="/flightList" component={FlightList} />
            <Route path="/inlandList" component={InlandList} />
            <Route path="/login" component={Login} />
            <Route path="/home" component={Home} />
            <Route exact path="/" component={Home} />
            <Redirect to={"/home"} />
          </Switch>
        </HashRouter>
      </Fragment>
      <BackTop>
        <div className="back_top"></div>
      </BackTop>
    </ConfigProvider>
  );
}

export default App;
