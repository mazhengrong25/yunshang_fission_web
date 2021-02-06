/*
 * @Description: 公告横幅
 * @Author: wish.WuJunLong
 * @Date: 2021-01-12 11:23:43
 * @LastEditTime: 2021-02-04 11:30:23
 * @LastEditors: wish.WuJunLong
 */

import React, { Component } from "react";

import { Carousel } from "antd";

import "./noticeBanners.scss";

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      noticeId: null,
    };
  }

  // 跳转公告详情
  jumpNoticeDetail(){
    console.log(this.state.noticeId)
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
            {this.props.noticeMessage.map((item) => (
              <div className="notice__main__message" key={item.id}>
                {`${item.title}： ${item.content.replace(/<[^>]+>/g,"").replace(/&nbsp;/ig, "")}`}
              </div>
            ))}
          </Carousel>

          <div className="notice__main__message_btn" onClick={() => this.jumpNoticeDetail()}>查看详情</div>
        </div>
      </div>
    );
  }
}
