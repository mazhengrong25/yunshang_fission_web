/*
 * @Description: 公告横幅
 * @Author: wish.WuJunLong
 * @Date: 2021-01-12 11:23:43
 * @LastEditTime: 2021-01-12 11:28:57
 * @LastEditors: wish.WuJunLong
 */

import React, { Component } from "react";

import { Carousel } from "antd";

import "./noticeBanners.scss";

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    return (
      <div className="notice">
        <div className="notice__main">
          <div className="notice__main__title">平台公告</div>

          <Carousel
            dotPosition="right"
            dots={false}
            className="notice__main__message"
            autoplay
          >
            {this.props.noticeMessage.map((item, index) => (
              <div className="notice__main__message" key={index}>
                {item}
              </div>
            ))}
          </Carousel>

          <div className="notice__main__message_btn">查看详情</div>
        </div>
      </div>
    );
  }
}
