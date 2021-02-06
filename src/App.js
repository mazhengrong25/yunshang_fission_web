/*
 * @Description: 主模块
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:03:54
 * @LastEditTime: 2021-02-06 10:54:50
 * @LastEditors: mzr
 */
import React, { Fragment } from "react";
import Login from "./pages/login";
import Home from "./pages/home";
import InlandList from "./pages/orderList/inlandLlist";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

import './global.scss'

function App() {
  return (
    <Fragment>
      <HashRouter>
        <Switch>
          <Route path="/inlandList" component={InlandList}/>
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
