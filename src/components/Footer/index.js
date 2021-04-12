/*
 * @Description: 全局页脚
 * @Author: wish.WuJunLong
 * @Date: 2021-02-22 16:47:54
 * @LastEditTime: 2021-04-09 15:29:15
 * @LastEditors: wish.WuJunLong
 */

import React, { Component } from "react";
import { Link } from "react-router-dom";

import FooterLogo from "../../static/footer_logo.png";

import "./footer.scss";

export default class index extends Component {
  // constructor(props) {
  //   super(props);
  //   this.state = {
  //     activeUrl: "/",
  //   };
  // }
  // componentDidMount() {
  //   this.setState({
  //     activeUrl: this.props.history.location.pathname || "/",
  //   });
  // }
  render() {
    return (
      <div className="footer">
        <div className="footer_main">
          <div className="main_logo">
            <img src={FooterLogo} alt="页脚logo" />
            <div className="logo_info">
              <p>云上航空</p>
              <span>Ticketing Co., Ltd.</span>
            </div>
          </div>

          <div className="main_nav">
            {/* <Link className={this.state.activeUrl === "/" || this.state.activeUrl === "/home"? 'active': ''} to="/">首页</Link>
            <Link className={this.state.activeUrl.indexOf("/orderList") !== -1? 'active':''} to="/orderList?type=inland_ticket">我的订单</Link>
            <Link className={this.state.activeUrl.indexOf("/announceNotice") !== -1? 'active' :''} to="/">公告通知</Link> */}
            <Link to="/">首页</Link>
            <Link to="/orderList?type=inland_ticket">我的订单</Link>
            <Link to="/announceNotice">公告通知</Link>
          </div>

          <div className="main_message">
            <div className="message_title">联系我们</div>
            <div className="message_text">服务热线：023-6865-1111</div>
            <div className="message_text">地址：重庆市渝中区长江一路69号</div>
          </div>
        </div>

        <div className="footer_info">copyright©2016 YS 渝ICP备12005639号-4</div>
      </div>
    );
  }
}
