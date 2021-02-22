/*
 * @Description: 主页
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:08:05
 * @LastEditTime: 2021-02-20 13:56:26
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

  componentDidMount() {
    this.getNoticeList();
  }

  // 获取公告列表
  getNoticeList() {
    this.$axios.get("/api/notice").then((res) => {
      if (res.errorcode === 10000) {
        this.setState({
          notice: res.data.data,
        });
      }
    });
  }

  // 打开公告详情
  jumpNoticeDetail(val) {
    console.log(val);
  }

  render() {
    return (
      <div className="home">
        <NoticeBanners noticeMessage={this.state.notice} />
        <div className="home__banner">
          <div className="home__banner__background"></div>
          <div className="home__banner__main">
            <div className="home__banner__main__ticketBox">
              <FlightSearch history={this.props.history} />
            </div>
            <div className="home__banner__main__toolBox">
              <div className="home__banner__main__toolBox__notice">
                <div className="title">公告通知</div>
                <div className="notice_main">
                  {this.state.notice.map((item, index) => {
                    if (index < 3) {
                      return (
                        <div
                          className="notice_list"
                          key={index}
                          onClick={() => this.jumpNoticeDetail(item)}
                        >
                          <div className="list_message">
                            <div className="notice_title">
                              {item.title}
                              {index === 0 ? <div className="newNotice">NEW</div> : ""}
                            </div>
                            <div className="notice_date">
                              {this.$moment(item.created_at).format("YYYY-MM-DD")}
                            </div>
                          </div>
                          <div className="list_content">
                            {item.content.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, "")}
                          </div>
                        </div>
                      );
                    } else {
                      return "";
                    }
                  })}
                  <div className="moreNotice">查看更多</div>
                </div>
              </div>
              <div className="home__banner__main__toolBox__weatherCalendar"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
