/*
 * @Description: 主页
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:08:05
<<<<<<< HEAD
 * @LastEditTime: 2021-03-11 17:23:30
 * @LastEditors: mzr
=======
 * @LastEditTime: 2021-03-10 16:08:21
 * @LastEditors: wish.WuJunLong
>>>>>>> 55a5cb28a012c97f2f178baf5323b9ca8bdb3b02
 */
import React, { Component } from "react";

import fetchJsonp from "fetch-jsonp";

import NoticeBanners from "../../components/NoticeBanners"; // 通栏公告

import FlightSearch from "../../components/FlightSearch"; // 机票搜索

import cityCode from "../../tools/cityCode.json";

import "./home.scss";
import { message, Menu, Dropdown } from "antd";

import { DownOutlined } from "@ant-design/icons";

// 调用天气图片
import weather1 from "../../static/weather_1.png";
import weather2 from "../../static/weather_2.png";
import weather3 from "../../static/weather_3.png";
import weather4 from "../../static/weather_4.png";
import weather5 from "../../static/weather_5.png";
import weather6 from "../../static/weather_6.png";
import weather7 from "../../static/weather_7.png";

import TicketImage from "../../static/flight_fly.png";

import HomeBanner from "../../static/home_banner.png";

const { SubMenu } = Menu;

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      notice: [],
      locationCity: {}, // 定位code
      weatherInfo: {}, // 天气数据
      newOrderMessage: [], // 最近三天最新订单
      newOrderId: "", // 最近三天最新订单订单号
    };
  }

  async componentDidMount() {
    this.getNoticeList();
    this.getNewOrder();

    let city = localStorage.getItem("locationCity")
      ? JSON.parse(localStorage.getItem("locationCity"))
      : {};

    let weatherMessage = localStorage.getItem("weatherInfo")
      ? JSON.parse(localStorage.getItem("weatherInfo"))
      : {};

    await this.setState({
      weatherInfo: weatherMessage,
      locationCity: city,
    });

    if (JSON.stringify(city) === "{}") {
      await this.getLocation();
    }
    if (
      JSON.stringify(weatherMessage) === "{}" ||
      this.$moment(weatherMessage.reporttime).isBefore(this.$moment(), "day")
    ) {
      await this.getWeather();
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
          let data = {
            adcode: res.adcode,
            name: res.city,
          };
          console.log(res);
          this.setState({
            locationCity: data,
          });
          localStorage.setItem("locationCity", JSON.stringify(data));
        } else {
          message.warning(res.info);
        }
      })
      .catch((error) => {});
  }

  // 当前天气获取
  async getWeather(val) {
    let api = `https://restapi.amap.com/v3/weather/weatherInfo?key=055ff5a3b46f93240264dd818d4401ba&city=${
      val ? val : this.state.locationCity.adcode
    }&extensions=base`;
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
          localStorage.setItem("weatherInfo", JSON.stringify(res.lives[0]));
        } else {
          message.warning(res.info);
        }
      })
      .catch((error) => {});
  }

  // 更换地区查询天气
  async selectWeatherCity(val) {
    if (val.adcode !== this.state.weatherInfo.adcode) {
      await this.getWeather(val.adcode);
    }
  }

  // 获取三天内最新订单
  getNewOrder() {
    this.$axios.post("/api/order/new").then((res) => {
      if (res.result === 10000) {
        this.setState({
          newOrderMessage: res.data.segments,
          newOrderId: res.data.order.order_no,
        });
      }
    });
  }

  // 跳转订单详情页
  homeJumpOrderDetail() {
    this.props.history.push(`/inlandDetail?detail=${this.state.newOrderId}`);
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
          <div className="home__banner__background">
            <img src={HomeBanner} alt="首页banner"/>
          </div>
          <div className="home__banner__main">
            <div className="home__banner__main__ticketBox">
              <FlightSearch history={this.props.history} />
            </div>
            <div className="home__banner__main__toolBox">
              <div className="home__banner__main__toolBox__weatherCalendar">
                <div className="weather_header">
                  <div className="title">最近行程</div>
                  <div className="weather_info">
                    <div className="info_message">
                      <Dropdown
                        overlayClassName="weather_city_box"
                        overlay={() => (
                          <Menu>
                            <Menu.ItemGroup title="当前定位城市">
                              <Menu.Item
                                onClick={() =>
                                  this.selectWeatherCity(this.state.locationCity)
                                }
                              >
                                {this.state.locationCity.name || "定位失败"}
                              </Menu.Item>
                            </Menu.ItemGroup>
                            <Menu.Divider />
                            {cityCode.map((item, index) => (
                              <SubMenu title={item.provice} key={index}>
                                {item.city.map((oitem) => (
                                  <Menu.Item
                                    onClick={() => this.selectWeatherCity(oitem)}
                                    key={oitem.adcode}
                                  >
                                    {oitem.name}
                                  </Menu.Item>
                                ))}
                              </SubMenu>
                            ))}
                          </Menu>
                        )}
                      >
                        <p onClick={(e) => e.preventDefault()}>
                          <span className="city_name">
                            {this.state.weatherInfo
                              ? this.state.weatherInfo.city
                              : "定位失败"}
                          </span>{" "}
                          <DownOutlined />
                        </p>
                      </Dropdown>

                      <div className="message_text">
                        <div>
                          {this.state.weatherInfo
                            ? this.state.weatherInfo.temperature
                            : ""}
                          &deg;C
                        </div>
                        <p>
                          {this.state.weatherInfo ? this.state.weatherInfo.weather : ""}
                        </p>
                      </div>
                    </div>
                    <div className="info_img">
                      <img
                        src={
                          this.state.weatherInfo
                            ? this.state.weatherInfo.weather === "雪" ||
                              this.state.weatherInfo.weather === "阵雪" ||
                              this.state.weatherInfo.weather === "小雪" ||
                              this.state.weatherInfo.weather === "中雪" ||
                              this.state.weatherInfo.weather === "大雪" ||
                              this.state.weatherInfo.weather === "暴雪" ||
                              this.state.weatherInfo.weather === "小雪-中雪" ||
                              this.state.weatherInfo.weather === "中雪-大雪" ||
                              this.state.weatherInfo.weather === "大雪-暴雪" ||
                              this.state.weatherInfo.weather === "冷"
                              ? weather1
                              : this.state.weatherInfo.weather === "小雨" ||
                                this.state.weatherInfo.weather === "阵雨" ||
                                this.state.weatherInfo.weather === "雷阵雨" ||
                                this.state.weatherInfo.weather === "雷阵雨并伴有冰雹" ||
                                this.state.weatherInfo.weather === "中雨" ||
                                this.state.weatherInfo.weather === "大雨" ||
                                this.state.weatherInfo.weather === "暴雨" ||
                                this.state.weatherInfo.weather === "大暴雨" ||
                                this.state.weatherInfo.weather === "特大暴雨" ||
                                this.state.weatherInfo.weather === "强阵雨" ||
                                this.state.weatherInfo.weather === "强雷阵雨" ||
                                this.state.weatherInfo.weather === "极端降雨" ||
                                this.state.weatherInfo.weather === "毛毛雨/细雨" ||
                                this.state.weatherInfo.weather === "雨" ||
                                this.state.weatherInfo.weather === "小雨-中雨" ||
                                this.state.weatherInfo.weather === "中雨-大雨" ||
                                this.state.weatherInfo.weather === "大雨-暴雨" ||
                                this.state.weatherInfo.weather === "暴雨-大暴雨" ||
                                this.state.weatherInfo.weather === "大暴雨-特大暴雨" ||
                                this.state.weatherInfo.weather === "雨雪天气" ||
                                this.state.weatherInfo.weather === "雨夹雪" ||
                                this.state.weatherInfo.weather === "阵雨夹雪" ||
                                this.state.weatherInfo.weather === "冻雨"
                              ? weather2
                              : this.state.weatherInfo.weather === "有风" ||
                                this.state.weatherInfo.weather === "平静" ||
                                this.state.weatherInfo.weather === "微风" ||
                                this.state.weatherInfo.weather === "和风" ||
                                this.state.weatherInfo.weather === "清风" ||
                                this.state.weatherInfo.weather === "强风/劲风" ||
                                this.state.weatherInfo.weather === "疾风" ||
                                this.state.weatherInfo.weather === "大风" ||
                                this.state.weatherInfo.weather === "烈风" ||
                                this.state.weatherInfo.weather === "风暴" ||
                                this.state.weatherInfo.weather === "狂爆风" ||
                                this.state.weatherInfo.weather === "飓风" ||
                                this.state.weatherInfo.weather === "热带风暴" ||
                                this.state.weatherInfo.weather === "龙卷风"
                              ? weather3
                              : this.state.weatherInfo.weather === "晴" ||
                                this.state.weatherInfo.weather === "热" ||
                                this.state.weatherInfo.weather === "少云"
                              ? weather4
                              : this.state.weatherInfo.weather === "浮尘" ||
                                this.state.weatherInfo.weather === "扬沙" ||
                                this.state.weatherInfo.weather === "沙尘暴" ||
                                this.state.weatherInfo.weather === "强沙尘暴" ||
                                this.state.weatherInfo.weather === "雾" ||
                                this.state.weatherInfo.weather === "浓雾" ||
                                this.state.weatherInfo.weather === "强浓雾" ||
                                this.state.weatherInfo.weather === "轻雾" ||
                                this.state.weatherInfo.weather === "大雾" ||
                                this.state.weatherInfo.weather === "特强浓雾"
                              ? weather5
                              : this.state.weatherInfo.weather === "阴" ||
                                this.state.weatherInfo.weather === "霾" ||
                                this.state.weatherInfo.weather === "中度霾" ||
                                this.state.weatherInfo.weather === "重度霾" ||
                                this.state.weatherInfo.weather === "严重霾"
                              ? weather6
                              : this.state.weatherInfo.weather === "多云" ||
                                this.state.weatherInfo.weather === "晴间多云"
                              ? weather7
                              : ""
                            : ""
                        }
                        alt={this.state.weatherInfo ? this.state.weatherInfo.weather : ""}
                      />
                    </div>
                  </div>
                </div>

                <div className="weather_order_message">
                  <div className="message_top">
                    <p>
                      {this.state.newOrderMessage.length > 0
                        ? `${this.$moment(
                            this.state.newOrderMessage[0].departure_time
                          ).format("YYYY-MM-DD")} ${this.$moment(
                            this.state.newOrderMessage[0].departure_time
                          ).format("ddd")}`
                        : ""}
                    </p>
                    <p>
                      {this.state.newOrderMessage.length > 0
                        ? `${this.state.newOrderMessage[0].depAirport_CN.province}-${
                            this.state.newOrderMessage[
                              this.state.newOrderMessage.length - 1
                            ].arrAirport_CN.province
                          }`
                        : ""}
                    </p>
                  </div>
                  <div className="message_ticket">
                    <div className="ticket_top">
                      <p>
                        {this.state.newOrderMessage.length > 0
                          ? `${this.$moment(
                              this.state.newOrderMessage[0].departure_time
                            ).format("HH:mm")}`
                          : ""}
                      </p>
                      <img src={TicketImage} alt="最新航班icon" />
                      <p>
                        {this.state.newOrderMessage.length > 0
                          ? `${this.$moment(
                              this.state.newOrderMessage[0].arrive_time
                            ).format("HH:mm")}`
                          : ""}
                      </p>
                    </div>
                    <div className="ticket_bottom">
                      <p>
                        {this.state.newOrderMessage.length > 0
                          ? `${this.state.newOrderMessage[0].depAirport_CN.province}
                          ${this.state.newOrderMessage[0].depAirport_CN.air_port_name}
                          ${this.state.newOrderMessage[0].departure_terminal}`
                          : ""}
                      </p>
                      <p>
                        {this.state.newOrderMessage.length > 0
                          ? `${
                              this.state.newOrderMessage[
                                this.state.newOrderMessage.length - 1
                              ].arrAirport_CN.province
                            }
                          ${
                            this.state.newOrderMessage[
                              this.state.newOrderMessage.length - 1
                            ].arrAirport_CN.air_port_name
                          }
                          ${
                            this.state.newOrderMessage[
                              this.state.newOrderMessage.length - 1
                            ].arrive_terminal
                          }`
                          : ""}
                      </p>
                    </div>

                    {this.state.newOrderMessage.length > 0 ? (
                      ""
                    ) : (
                      <div className="not_ticket">暂无行程</div>
                    )}
                    {this.state.newOrderMessage.length > 0 ? (
                      <div
                        className="jump_order_detail"
                        onClick={() => this.homeJumpOrderDetail()}
                      >
                        查看详情
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
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
