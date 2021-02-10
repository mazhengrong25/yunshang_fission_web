/*
 * @Description: 主页
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:08:05
 * @LastEditTime: 2021-02-05 18:35:09
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import NoticeBanners from "../../components/NoticeBanners"; // 通栏公告

import FlightSearch from "../../components/FlightSearch"; // 机票搜索

import "./home.scss";

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notice: [],
    };
  }

  componentDidMount(){
    this.getNoticeList()
  }

  // 获取公告列表
  getNoticeList(){
    this.$axios.get('/api/notice')
      .then(res =>{
        if(res.errorcode === 10000){
          this.setState({
            notice: res.data.data
          })
        }
      })
  }

  render() {
    return (
      <div className="home">
        <NoticeBanners noticeMessage={this.state.notice} />
        <div className="home__banner">
          <div className="home__banner__background"></div>
          <div className="home__banner__main">
            <div className="home__banner__main__ticketBox">
              <FlightSearch history={this.props.history}/>
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
