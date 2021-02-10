/*
 * @Description: 主模块
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:03:54
 * @LastEditTime: 2021-02-09 19:27:20
 * @LastEditors: wish.WuJunLong
 */
import React, { Fragment } from "react";

import { BackTop } from "antd";


import Login from "./pages/login";
import Home from "./pages/home";
import InlandList from "./pages/orderList/inlandLlist"; // 国内列表
import InlandDetail from "./pages/orderList/inlandDetail"; //国内列表详情
import FlightList from "./pages/flightList"; // 航班查询列表

import { HashRouter, Route, Switch, Redirect } from "react-router-dom";


import "./global.scss";

function App() {
  return (
    <Fragment>
      <HashRouter>
        <Switch>
          <Route path="/inlandDetail" component={InlandDetail} />
          <Route path="/flightList" component={FlightList} />
          <Route path ="/inlandList" component={InlandList} />
          <Route path="/login" component={Login} />
          <Route path="/home" component={Home} />
          <Route exact path="/" component={Home} />
          <Redirect to={"/home"} />
        </Switch>
      </HashRouter>

      <BackTop>
        <div className="back_top"></div>
      </BackTop>
    </Fragment>
  );
}

export default App;
