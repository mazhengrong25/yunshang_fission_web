/*
 * @Description: 全局页脚
 * @Author: wish.WuJunLong
 * @Date: 2021-02-22 16:47:54
 * @LastEditTime: 2021-02-22 16:55:16
 * @LastEditors: wish.WuJunLong
 */

import React, { Component } from "react";

import FooterLogo from "../../static/footer_logo.png";

import "./footer.scss";

export default class index extends Component {
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
