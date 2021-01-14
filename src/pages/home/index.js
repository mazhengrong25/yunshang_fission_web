/*
 * @Description: 主页
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:08:05
 * @LastEditTime: 2021-01-12 17:46:29
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import HeaderTemplate from "../../components/Header"; // 导航栏
import NoticeBanners from "../../components/NoticeBanners"; // 通栏公告

import FlightSearch from "../../components/FlightSearch"; // 机票搜索

import "./home.scss";

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notice: [
        "1、平台上线公告：2020年12月25日云上航空差旅系统正式上线，首批试用客户将享受平台国内机票9.8折优惠，活动时间2020年12月25日-2021年1月25日，不限制活动时间2020年12月25日-2021年1月25日，不限制",
        "2、平台上线公告：2020年12月25日云上航空差旅系统正式上线，首批试用客户将享受平台国内机票9.8折优惠，活动时间2020年12月25日-2021年1月25日，不限制活动时间2020年12月25日-2021年1月25日，不限制",
        "3、平台上线公告：2020年12月25日云上航空差旅系统正式上线，首批试用客户将享受平台国内机票9.8折优惠，活动时间2020年12月25日-2021年1月25日，不限制活动时间2020年12月25日-2021年1月25日，不限制",
      ],
    };
  }
  render() {
    return (
      <div className="home">
        <HeaderTemplate />
        <NoticeBanners noticeMessage={this.state.notice} />
        <div className="home__banner">
          <div className="home__banner__background"></div>
          <div className="home__banner__main">
            <div className="home__banner__main__ticketBox">
              <FlightSearch />
            </div>
            <div className="home__banner__main__toolBox">
              <div className="home__banner__main__toolBox__weatherCalendar"></div>
              <div className="home__banner__main__toolBox__notice"></div>
            </div>
          </div>

        </div>
      </div>
    );
  }
}
