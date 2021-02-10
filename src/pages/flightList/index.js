/*
 * @Description: 机票列表
 * @Author: wish.WuJunLong
 * @Date: 2021-02-05 18:31:03
 * @LastEditTime: 2021-02-10 14:38:44
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import { Button, Radio, Input, Select, Checkbox } from "antd";

import { DownOutlined } from "@ant-design/icons";

import QueueAnim from "rc-queue-anim";

import "./flightList.scss";

// 筛选组图片
import searchNotTime from "../../static/search_notTime.png";
import searchNotTimeActive from "../../static/search_notTime_active.png";
import searchMorning from "../../static/search_morning.png";
import searchMorningActive from "../../static/search_morning_active.png";
import searchAfternoon from "../../static/search_afternoon.png";
import searchAfternoonActive from "../../static/search_afternoon_active.png";
import searchNight from "../../static/search_night.png";
import searchNightActive from "../../static/search_night_active.png";

const { Option } = Select;
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      urlData: {}, // url参数
      flightList: [], // 航班列表
      isFlightListStatus: false,

      fileKey: "", // 行程缓存
      segmentsKey: "", // 舱位缓存
      cabinList: [], // 舱位列表

      openCabinName: "", // 舱位列表打开标识
      openCabinIndex: 5, // 舱位列表打开下标

      searchTime: "notTime", // 时间筛选
    };
  }
  async componentDidMount() {
    await this.setState({
      urlData: React.$filterUrlParams(decodeURI(this.props.location.search)),
    });

    // await this.getFlightList();
  }

  // 获取航班列表
  async getFlightList() {
    let data = {
      departure: this.state.urlData.start, //类型：String  必有字段  备注：起飞机场
      arrival: this.state.urlData.end, //类型：String  必有字段  备注：到达机场
      departureTime: this.state.urlData.date, //类型：String  必有字段  备注：起飞日期
      only_segment: 1, //类型：Number  可有字段  备注：仅返回航程信息：1
      min_price: 1, //类型：Number  必有字段  备注：最低价格
    };
    await this.$axios.post("/api/inland/air", data).then((res) => {
      if (res.errorcode === 10000) {
        this.setState({
          fileKey: res.data.IBE.file_key,
          flightList: res.data.IBE.list,
        });
      }
    });
  }

  // 获取舱位信息
  openCabinBox(val) {
    console.log(val);
    this.setState({
      segmentsKey: val,
      cabinList: [],
      openCabinIndex: 5,
    });
    if (val !== this.state.segmentsKey) {
      let data = {
        departure: this.state.urlData.start, //类型：String  必有字段  备注：起飞机场
        arrival: this.state.urlData.end, //类型：String  必有字段  备注：到达机场
        departureTime: this.state.urlData.date, //类型：String  必有字段  备注：起飞日期
        file_key: this.state.fileKey, //类型：String  可有字段  备注：获取缓存数据,可以为空
        segments_key: val, //类型：String  可有字段  备注：行程缓存key，在仅获取仓位信息时必传
        only_cabin: 1, //类型：Number  可有字段  备注：仅返回仓位信息：1
      };
      this.$axios.post("/api/inland/air", data).then((res) => {
        if (res.errorcode === 10000) {
          let cabinData = res.data.IBE.list[0].ItineraryInfos; // 获取舱位对象

          let cabinList = []; // 舱位列表

          // 组装舱位数据
          for (let value in cabinData) {
            cabinList.push({
              name: value,
              data: cabinData[value],
            });
          }

          console.log(cabinList);
          this.setState({
            segmentsKey: val,
            cabinList: cabinList,
          });
        }
      });
    } else {
      this.setState({
        segmentsKey: "",
        cabinList: [],
      });
    }
  }

  // 打开舱位
  openMoreCabin(val) {
    this.setState({
      openCabinName: val !== this.state.openCabinName ? val : "",
    });
  }

  // 打开更多舱位
  openCabinIndexStatus() {
    this.setState({
      openCabinIndex: this.state.openCabinIndex + 5,
    });
  }

  // 航班列表排序
  sortFlightList = (e) => {
    console.log(e);
    let start;
    let end;
    let newFlightData = this.state.flightList.sort((n1, n2) => {
      if (e === "price") {
        start = n1.min_price;
        end = n2.min_price;
      } else if (e === "time") {
        start = this.$moment(n1.segments[0].depTime).format("X");
        end = this.$moment(n2.segments[0].depTime).format("X");
      }

      return start - end;
    });

    this.setState({
      flightList: newFlightData,
    });
  };

  // 筛选栏 时间筛选
  searchTime = (e) => {
    console.log(e.target.value);
    this.setState({
      searchTime: e.target.value,
    });
  };

  render() {
    return (
      <div className="flightList">
        <div className="flight_list_header">
          <div className="header_message">
            <div className="message_info">
              <div className="info_address">
                {`${this.state.urlData.startAddress} - ${this.state.urlData.endAddress}`}
              </div>
              <div className="info_date">
                <p>{`${this.state.urlData.date}(${this.$moment(
                  this.state.urlData.date
                ).format("ddd")})`}</p>
                <p>{this.state.urlData.returnDate ? "往返" : "单程"}</p>
              </div>
            </div>
            <Button className="edit_search">更改</Button>
          </div>

          <div className="header_search">
            <div className="search_type">
              <Radio.Group value={1}>
                <Radio value={1}>单程</Radio>
                <Radio value={2}>往返</Radio>
              </Radio.Group>
            </div>
            <div className="search_input">
              <Input placeholder="起飞城市" />
              <Input placeholder="到达城市" />
              <Input placeholder="起飞时间" />
              <Button type="primary" className="search_btn">
                搜索航班
              </Button>
            </div>
          </div>
        </div>

        <div className="flight_content">
          <div className="flight_search">
            <div className="header_title">航班筛选</div>

            <div className="search_content">
              <div className="search_list fiy_time">
                <div className="list_title">
                  起飞时段 <DownOutlined />
                </div>

                <Radio.Group
                  className="list_box"
                  value={this.state.searchTime}
                  buttonStyle="solid"
                  onChange={this.searchTime}
                >
                  <Radio.Button className="box_item" value="notTime">
                    <img
                      alt="不限"
                      src={
                        this.state.searchTime === "notTime"
                          ? searchNotTime
                          : searchNotTimeActive
                      }
                    />{" "}
                    不限
                  </Radio.Button>
                  <Radio.Button className="box_item" value="morning">
                    <img
                      alt="上午"
                      src={
                        this.state.searchTime === "morning"
                          ? searchMorning
                          : searchMorningActive
                      }
                    />
                    06:00-12:00
                  </Radio.Button>
                  <Radio.Button className="box_item" value="afternoon">
                    <img
                      alt="下午"
                      src={
                        this.state.searchTime === "afternoon"
                          ? searchAfternoon
                          : searchAfternoonActive
                      }
                    />
                    12:00-18:00
                  </Radio.Button>
                  <Radio.Button className="box_item" value="night">
                    <img
                      alt="晚上"
                      src={
                        this.state.searchTime === "night"
                          ? searchNight
                          : searchNightActive
                      }
                    />
                    18:00-24:00
                  </Radio.Button>
                </Radio.Group>
              </div>

              <div className="search_list">
                <div className="list_title">
                  舱位 <DownOutlined />
                </div>

                <Checkbox.Group  className="list_box">
                  <Checkbox className="box_item" value={1}>不限舱位</Checkbox>
                  <Checkbox className="box_item" value={2}>经济舱</Checkbox>
                  <Checkbox className="box_item" value={3}>公务舱</Checkbox>
                  <Checkbox className="box_item" value={4}>头等舱</Checkbox>
                </Checkbox.Group>
              </div>
            </div>
          </div>

          <div className="flight_main">
            <div className="main_header">
              <div className="flight_number">共{this.state.flightList.length}条航班</div>

              <div className="flight_sort">
                <Select placeholder="排序" onChange={this.sortFlightList}>
                  <Option value="time">时间早晚</Option>
                  <Option value="price">价格高低</Option>
                </Select>
              </div>
            </div>
            <div className="main_list">
              <QueueAnim>
                {this.state.flightList.map((item, index) => (
                  <div key={index}>
                    <div className="list_card">
                      <div className="card_air">
                        <img
                          className="air_icon"
                          src={`${this.$url}` + item.segments[0].image}
                          alt="航班logo"
                        />

                        <div className="air_message">
                          <div className="air_name">{item.segments[0].airline_CN}</div>
                          <div className="air_number">
                            {item.segments[0].flightNumber} 机型{" "}
                            {item.segments[0].aircraftCode}
                          </div>
                          {item.segments[0].hasMeal ? (
                            <div className="air_meals"></div>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>

                      <div className="flight_message">
                        <div className="message_info">
                          <div className="time">
                            {this.$moment(item.segments[0].depTime).format("HH:mm")}
                          </div>
                          <div className="address">
                            {item.segments[0].depAirport_CN.city_name}
                            {item.segments[0].depAirport_CN.air_port_name}
                            {item.segments[0].depTerminal}
                          </div>
                        </div>
                        <div className="message_time">
                          <div className="time_date">
                            {Math.floor(item.segments[0].duration / 60)}h
                            {Math.floor(item.segments[0].duration % 60)}m
                          </div>
                          <div className="time_icon"></div>
                        </div>
                        <div className="message_info">
                          <div className="time">
                            {this.$moment(
                              item.segments[item.segments.length - 1].arrTime
                            ).format("HH:mm")}
                          </div>
                          <div className="address">
                            {
                              item.segments[item.segments.length - 1].arrAirport_CN
                                .city_name
                            }
                            {
                              item.segments[item.segments.length - 1].arrAirport_CN
                                .air_port_name
                            }
                            {item.segments[item.segments.length - 1].arrTerminal}
                          </div>
                        </div>
                      </div>

                      {item.available_cabin > 0 ? (
                        <>
                          <div className="flight_account">
                            <p>&yen;</p>
                            <div>{item.min_price}</div>
                            <span>起</span>
                          </div>
                          <Button
                            className="cabin_switch"
                            onClick={() => this.openCabinBox(item.segments_key)}
                            loading={
                              item.segments_key === this.state.segmentsKey &&
                              this.state.cabinList.length < 1
                            }
                          >
                            {this.state.segmentsKey === item.segments_key &&
                            this.state.cabinList.length > 1
                              ? "收起"
                              : this.state.segmentsKey === item.segments_key &&
                                this.state.cabinList.length < 1
                              ? "加载中"
                              : "展开"}
                          </Button>
                        </>
                      ) : (
                        <div className="not_cabin">售罄</div>
                      )}
                    </div>

                    {this.state.cabinList.length > 0 &&
                    this.state.segmentsKey === item.segments_key ? (
                      <div className="cabin_content">
                        {this.state.cabinList.map((oitem) =>
                          oitem.data.map((pitem, pindex) =>
                            (pindex < this.state.openCabinIndex &&
                              item.segments_key + oitem.name ===
                                this.state.openCabinName) ||
                            pindex === 0 ? (
                              <>
                                <div className="cabin_list" key={oitem.name + pindex}>
                                  <div className="list_info">
                                    <div
                                      className="list_name"
                                      style={{
                                        cursor:
                                          pindex === 0 && oitem.data.length > 1
                                            ? "pointer"
                                            : "",
                                      }}
                                      onClick={() =>
                                        this.openMoreCabin(item.segments_key + oitem.name)
                                      }
                                    >
                                      {oitem.name} {pitem.discount}
                                      {pindex === 0 && oitem.data.length > 1 ? (
                                        <DownOutlined
                                          rotate={
                                            item.segments_key + oitem.name ===
                                            this.state.openCabinName
                                              ? 180
                                              : 0
                                          }
                                        />
                                      ) : (
                                        ""
                                      )}
                                    </div>
                                    <div className="list_message">
                                      {pitem.cabinInfo.baggage}
                                    </div>
                                  </div>

                                  <div className="list_option">
                                    <div className="list_account">
                                      <div>
                                        <span>&yen;</span>
                                        {pitem.cabinPrices.ADT.price}
                                      </div>
                                      <p>余 3 张</p>
                                    </div>
                                    <Button className="list_btn" type="primary">
                                      预定
                                    </Button>
                                  </div>
                                </div>

                                {this.state.openCabinIndex < oitem.data.length &&
                                this.state.openCabinIndex - 1 === pindex &&
                                pindex !== 0 ? (
                                  <div
                                    key={oitem.name + "_" + pindex}
                                    className="open_more_cabin_btn"
                                  >
                                    <span onClick={() => this.openCabinIndexStatus()}>
                                      展开更多
                                    </span>
                                  </div>
                                ) : (
                                  ""
                                )}
                              </>
                            ) : (
                              ""
                            )
                          )
                        )}
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                ))}
              </QueueAnim>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
