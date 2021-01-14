/*
 * @Description: 主模块
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:03:54
 * @LastEditTime: 2021-01-12 17:42:59
 * @LastEditors: wish.WuJunLong
 */
import React, { Fragment } from "react";
import Login from "./pages/login";
import Home from "./pages/home";
import { HashRouter, Route, Switch, Redirect } from "react-router-dom";

import './global.scss'

function App() {
  return (
    <Fragment>
      <HashRouter>
        <Switch>
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
