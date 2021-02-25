/*
 * @Description: 主页
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:08:05
 * @LastEditTime: 2021-02-24 10:04:10
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import fetchJsonp from "fetch-jsonp";

import NoticeBanners from "../../components/NoticeBanners"; // 通栏公告

import FlightSearch from "../../components/FlightSearch"; // 机票搜索

import "./home.scss";
import { message } from "antd";

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notice: [],
      locationCode: "", // 定位code
      weatherInfo: {}, // 天气数据
    };
  }

  async componentDidMount() {
    this.getNoticeList();

    if (!sessionStorage.getItem("weatherInfo")) {
      await this.getLocation();
      await this.getWeather();
    } else {
      this.setState({
        weatherInfo: JSON.parse(sessionStorage.getItem("weatherInfo")),
      });
    }
  }

  // 获取当前地理位置
  async getLocation() {
    let api = "https://restapi.amap.com/v3/ip?key=055ff5a3b46f93240264dd818d4401ba";
    await fetchJsonp(api)
      .then(function (response) {
        return response.json();
      })
      .then((res) => {
        if (res.status === "1") {
          console.log(res);
          this.setState({
            locationCode: res.adcode,
          });
        } else {
          message.warning(res.info);
        }
      })
      .catch((error) => {});
  }

  // 当前天气获取
  async getWeather() {
    let api = `https://restapi.amap.com/v3/weather/weatherInfo?key=055ff5a3b46f93240264dd818d4401ba&city=${this.state.locationCode}&extensions=base`;
    await fetchJsonp(api)
      .then(function (response) {
        return response.json();
      })
      .then((res) => {
        if (res.status === "1") {
          console.log(res);
          this.setState({
            weatherInfo: res.lives[0],
          });
          sessionStorage.setItem("weatherInfo", JSON.stringify(res.lives[0]));
        } else {
          message.warning(res.info);
        }
      })
      .catch((error) => {});
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
              <div className="home__banner__main__toolBox__weatherCalendar">
                {JSON.stringify(this.state.weatherInfo)}
              </div>
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
            </div>
          </div>
        </div>
      </div>
    );
  }
}
