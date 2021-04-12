/*
 * @Description: 主模块
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:03:54
 * @LastEditTime: 2021-04-12 16:42:08
 * @LastEditors: wish.WuJunLong
 */
import React, { Fragment } from "react";

import { BackTop, ConfigProvider, Layout } from "antd";



import Login from "./pages/login";
import Home from "./pages/home"; // 主页
import AnnounceNoticeList from "./pages/announceNotice/noticeList"; // 平台公告列表
import AnnounceNoticeDetail from "./pages/announceNotice/noticeDetail"; //公告列表详情
import AccountCenter from "./pages/accountCenter/accountCenter"; //个人中心

import OrderList from "./pages/orderList/orderList"; // 订单列表
import InlandDetail from "./pages/orderList/inlandDetail"; //国内列表详情

import OrderRefund from "./pages/orderList/orderRefund"; //国内订单退票
import RefundDetail from './pages/orderList/refundDetail'; //国内退票详情

import FlightList from "./pages/flightList"; // 航班查询列表
import FlightScheduled from "./pages/flightScheduled"; // 机票预订页面

import OrderPay from "./pages/orderList/orderPay"; // 支付回调页面

import HeaderTemplate from "./components/Header"; // 导航栏
import FooterTemplate from "./components/Footer"; // 页脚

import { Route, Switch, Redirect, BrowserRouter } from "react-router-dom";

import locale from "antd/lib/locale/zh_CN";

import "./global.scss";

const { Header, Footer } = Layout;

function App() {
  return (
    <ConfigProvider locale={locale}>
      <BrowserRouter>
        <Layout>
          <Header>
            <HeaderTemplate />
          </Header>
          <Fragment>
              <Switch>
                <Route exact path="/orderPay" component={OrderPay}></Route>
                <Route exact path="/FlightScheduled" component={FlightScheduled}></Route>
                <Route exact path="/flightList" component={FlightList} />
                <Route exact path="/orderRefund" component={OrderRefund}/>
                <Route exact path="/refundDetail" component={RefundDetail} />
                <Route exact path="/inlandDetail" component={InlandDetail} />
                <Route exact path="/orderList" component={OrderList} />
                <Route exact path="/accountCenter" component={AccountCenter} />
                <Route exact path="/announceNotice" component={AnnounceNoticeList} />
                <Route
                  exact
                  path="/announceNoticeDetail"
                  component={AnnounceNoticeDetail}
                />
                <Route exact path="/login" component={Login} />
                <Route exact path="/home" component={Home} />
                <Route exact path="/" component={Home} />
                <Redirect to={"/home"} />
              </Switch>
            </Fragment>
          <Footer>
            <FooterTemplate/>
          </Footer>
        </Layout>

        <BackTop>
          <div className="back_top"></div>
        </BackTop>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
