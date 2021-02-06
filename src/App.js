/*
 * @Description: 主模块
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:03:54
 * @LastEditTime: 2021-02-05 18:51:24
 * @LastEditors: wish.WuJunLong
 */
import React, { Fragment } from "react";
import Login from "./pages/login";
import Home from "./pages/home"; // 主页
import InlandList from "./pages/inlandList"; // 国内订单列表

import FlightList from "./pages/flightList"; // 航班查询列表

import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

import "./global.scss";

function App() {
  return (
    <Fragment>
      <HashRouter>
        <Switch>
          <Route path="/flightList" component={FlightList} />
          <Route path="/inlandList" component={InlandList} />
          <Route path="/login" component={Login} />
          <Route path="/home" component={Home} />
          <Route exact path="/" component={Home} />
          <Redirect to={"/home"} />
        </Switch>
      </HashRouter>
    </Fragment>
  );
}

export default App;
