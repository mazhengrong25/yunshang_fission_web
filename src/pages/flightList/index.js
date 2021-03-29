/*
 * @Description: 机票列表
 * @Author: wish.WuJunLong
 * @Date: 2021-02-05 18:31:03
 * @LastEditTime: 2021-03-25 18:51:44
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import {
  Button,
  Radio,
  Input,
  Select,
  Checkbox,
  Affix,
  Skeleton,
  Result,
  Popover,
  Modal,
} from "antd";

import { SmileOutlined } from "@ant-design/icons";

import QueueAnim from "rc-queue-anim";

import "./flightList.scss";

// 展开更多舱位按钮
import MoreCabinBtn from "../../static/icon_drop.png";
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
      isFlightListStatus: false, // 航班列表状态

      editFlightType: false, // 更改当前航程状态 打开航程选择栏

      flightSort: {
        // 航班列表排序状态
        listSort: "", // 列表价格时间排序
      },

      skeletonList: [1, 2, 3], // 骨架屏数量
      flightListStatus: true, // 查询航班列表状态

      fileKey: "", // 行程缓存
      segmentsKey: "", // 舱位缓存
      cabinList: [], // 舱位列表

      openCabinName: "", // 舱位列表打开标识
      openCabinIndex: 5, // 舱位列表打开下标

      searchTime: "notTime", // 时间筛选
      searchCabin: [1], // 舱位筛选
      searchAir: [], // 航空公司筛选

      scheduledStatus: "", // 舱位验价按钮状态
      scheduledAllBtn: false, // 所有验价按钮状态

      airList: "", // 当前航班列表所有航司

      navShow: 0, //航班筛选状态 0---起飞时段   1---舱位  2---航空公司
      airlineList: [], //航空公司列表

      navExpand: 5, //航空公司展开更多
    };
  }
  async componentDidMount() {
    await this.setState({
      urlData: React.$filterUrlParams(decodeURI(this.props.location.search)),
    });

    await this.getFlightList();
    this.getAirlineList();
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
        let airList = [];
        res.data.IBE.list.forEach((item) => {
          airList.push(item.segments[0].airline);
        });

        this.setState({
          airList: String([...new Set(airList)]),
          fileKey: res.data.IBE.file_key,
          flightList: res.data.IBE.list,
          skeletonList: [],
        });
      } else {
        this.setState({
          flightListStatus: false,
        });
      }
    });
  }

  // 获取航空公司列表
  async getAirlineList() {
    let data = {
      air_code: this.state.airList,
    };
    await this.$axios.post("/api/airline", data).then((res) => {
      if (res.errorcode === 10000) {
        this.setState({
          airlineList: res.data,
        });
      }
    });
  }

  // 更改航程 打开航程选择栏
  openEditFlight() {
    this.setState({
      editFlightType: !this.state.editFlightType,
    });
  }

  // 获取舱位信息
  openCabinBox(val) {
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
        } else {
          let secondsToGo = 5;
          const modal = Modal.warning({
            keyboard: false,
            title: res.msg,
            content: `将在 ${secondsToGo} 秒后自动刷新航班列表，您也可以点击确定按钮手动刷新。`,
            okText: "确定",
            onOk: () => {
              this.getFlightList();
              clearInterval(timer);
            },
          });

          const timer = setInterval(() => {
            secondsToGo -= 1;
            modal.update({
              content: `将在 ${secondsToGo} 秒后自动刷新航班列表，您也可以点击确定按钮手动刷新。`,
            });
          }, 1000);

          setTimeout(() => {
            this.getFlightList();
            modal.destroy();
            clearInterval(timer);
          }, secondsToGo * 1001);
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
  openCabinIndexStatus(number) {
    this.setState({
      openCabinIndex: number,
    });
  }

  // 航班列表排序
  sortFlightList = (e) => {
    console.log(e);
    let start;
    let end;
    let newFlightData = this.state.flightList.sort((n1, n2) => {
      if (e.indexOf("price") > -1) {
        start = n1.min_price;
        end = n2.min_price;
      } else if (e.indexOf("time") > -1) {
        start = this.$moment(n1.segments[0].depTime).format("X");
        end = this.$moment(n2.segments[0].depTime).format("X");
      }
      return e.indexOf("top") > -1 ? start - end : end - start;
    });
    let flightSort = this.state.flightSort;
    flightSort.listSort = e;

    this.setState({
      flightSort,
      flightList: newFlightData,
    });
  };

  // 筛选栏 时间筛选
  searchTime = (e) => {
    let type = e.target.value;
    console.log(type);
    let flightList = this.state.flightList;

    flightList.forEach((item) => {
      // 获取当前航班日期
      let thisTime = this.$moment(item.segments[0].depTime).format("YYYY-MM-DD");

      // 对比当前航班时间是否处于筛选状态时间之前
      item["searchType"] =
        type !== "notTime"
          ? this.$moment(item.segments[0].depTime).isBetween(
              type === "morning"
                ? `${thisTime} 06:00`
                : type === "afternoon"
                ? `${thisTime} 12:00`
                : type === "night"
                ? `${thisTime} 18:00`
                : "",
              type === "morning"
                ? `${thisTime} 12:00`
                : type === "afternoon"
                ? `${thisTime} 18:00`
                : type === "night"
                ? `${thisTime} 24:00`
                : "",
              "minute",
              "[)"
            )
          : true;
    });
    console.log(flightList);

    this.setState({
      searchTime: type,
    });
  };

  // 筛选栏 舱位筛选
  changeSearchCabin = (e) => {
    let newData = e;

    console.log(newData);
    this.setState({
      searchCabin: newData,
    });
  };

  // 筛选栏 航司筛选
  changeSearchAir = (val) => {
    // flightList.filter()
    // flightList.forEach((item) => {
    //   let selectedList.filter(item.segments[0].airline_info.airline)
    //   console.log(selectedList)
    // })

    console.log("航司", val);
    this.setState({
      SearchAir: val,
    });
  };

  // 预定机票 - 验价
  jumpTicketDetail(val) {
    console.log(val);
    this.setState({
      scheduledStatus: val.data,
      scheduledAllBtn: true,
    });

    let data = val.routing;

    this.$axios.post("/api/checkPrice", data).then((res) => {
      console.log(res);
      if (res.errorcode === 10000) {
        this.setState({
          scheduledStatus: "",
          scheduledAllBtn: false,
        });
        this.props.history.push(`/flightScheduled?key=${res.data.keys}`);
      }
    });
  }
  // 航班筛选栏展开收起
  openNavMenu(val) {
    this.setState({
      navShow: val,
    });
  }

  // 航班筛选栏 航空公司展开更多
  expandNavMenu() {
    this.setState({
      navExpand: this.state.airlineList.length,
    });
  }

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
            <Button className="edit_search" onClick={() => this.openEditFlight()}>
              {this.state.editFlightType ? "收起" : "更改"}
            </Button>
          </div>

          <div
            className="header_search"
            style={{ display: this.state.editFlightType ? "block" : "none" }}
          >
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
          <Affix offsetTop={0}>
            <div className="flight_search">
              <div className="header_title">航班筛选</div>

              <div className="search_content">
                <div className="search_list fiy_time">
                  <div className="list_title" onClick={() => this.openNavMenu(0)}>
                    起飞时段 <div className="search_open_btn"><img src={MoreCabinBtn} alt="航班筛选展开按钮"></img></div>
                  </div>
                  <div
                    className="fly_div"
                    style={{ display: this.state.navShow === 0 ? "block" : "none" }}
                  >
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
                </div>

                <div className="search_list">
                  <div className="list_title" onClick={() => this.openNavMenu(1)}>
                    舱位 <div className="search_open_btn"><img src={MoreCabinBtn} alt="航班筛选展开按钮"></img></div>
                  </div>
                  <div
                    className="cabin_div"
                    style={{ display: this.state.navShow === 1 ? "block" : "none" }}
                  >
                    <Checkbox.Group
                      className="list_box"
                      value={this.state.searchCabin}
                      onChange={this.changeSearchCabin}
                    >
                      <Checkbox className="box_item" value={1}>
                        不限舱位
                      </Checkbox>
                      <Checkbox className="box_item" value={2}>
                        经济舱
                      </Checkbox>
                      <Checkbox className="box_item" value={3}>
                        公务舱
                      </Checkbox>
                      <Checkbox className="box_item" value={4}>
                        头等舱
                      </Checkbox>
                    </Checkbox.Group>
                  </div>
                </div>

                <div className="search_list">
                  <div className="list_title" onClick={() => this.openNavMenu(2)}>
                    航空公司 <div className="search_open_btn"><img src={MoreCabinBtn} alt="航班筛选展开按钮"></img></div>
                  </div>
                  <div
                    className="airline_div"
                    style={{ display: this.state.navShow === 2 ? "block" : "none" }}
                  >
                    <Checkbox.Group
                      className="airline_item"
                      value={this.state.SearchAir}
                      onChange={this.changeSearchAir}
                    >
                      <Checkbox className="airline_list">不限</Checkbox>
                      {this.state.airlineList.map((item, index) => (
                        <Checkbox
                          style={{
                            display: index <= this.state.navExpand ? "flex" : "none",
                            marginLeft: 0,
                          }}
                          key={index}
                          className="airline_list"
                          value={item}
                        >
                          <div className="airline_checkbox">
                            <img src={this.$url + "/" + item.image} alt="航司图标" />
                          </div>
                          {item.airline.replace(/航空.*/, "航空")}
                        </Checkbox>
                      ))}
                    </Checkbox.Group>
                    {this.state.navExpand !== this.state.airlineList.length &&
                    this.state.airlineList.length > 5 ? (
                      <div
                        className="airline_expand"
                        onClick={() => this.expandNavMenu()}
                      >
                        展开更多
                      </div>
                    ) : (
                      ""
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Affix>

          <div className="flight_main">
            <Affix offsetTop={0}>
              <div className="main_header">
                <div className="flight_number">
                  共
                  {this.state.flightList.filter((u) => u.searchType).length ||
                    this.state.flightList.length}
                  条航班
                </div>

                <div className="flight_sort">
                  <Select placeholder="排序" onChange={this.sortFlightList}>
                    <Option value="time-top">时间早-晚</Option>
                    <Option value="time-bottom">时间晚-早</Option>
                    <Option value="price-top">价格高-低</Option>
                    <Option value="price-bottom">价格低-高</Option>
                  </Select>
                </div>
              </div>
            </Affix>
            <div className="main_list">
              <QueueAnim>
                {this.state.flightListStatus &&
                  this.state.flightList.map((item, index) => (
                    <div key={index}>
                      {/* 判断当前数据是否显示 如没有当前参数则判断时候为为筛选状态 */}
                      {item.searchType || this.state.searchTime === "notTime" ? (
                        <div className="list_card">
                          <div className="card_air">
                            <img
                              className="air_icon"
                              src={`${this.$url}` + item.segments[0].image}
                              alt="航班logo"
                            />

                            <div className="air_message">
                              <div className="air_name">
                                {item.segments[0].airline_info.airline.replace(
                                  /航空.*/,
                                  "航空"
                                )}
                              </div>

                              <Popover
                                placement="bottomLeft"
                                color="#fff"
                                overlayClassName="air_popover"
                                content={() => (
                                  <div className="air_info">
                                    <div className="info_title">
                                      <img
                                        className="title_icon"
                                        src={`${this.$url}` + item.segments[0].image}
                                        alt="航班logo"
                                      />
                                      {item.segments[0].airline_info.airline.replace(
                                        /航空.*/,
                                        "航空"
                                      ) + item.segments[0].flightNumber}
                                    </div>
                                    <div className="info_main">
                                      <div className="info_main_list">
                                        <div className="info_main_list_title">机型</div>
                                        <div className="info_main_list_message">
                                          {item.segments[0].aircraftCode}
                                        </div>
                                      </div>

                                      <div className="info_main_list">
                                        <div className="info_main_list_title">
                                          机型代码
                                        </div>
                                        <div className="info_main_list_message">
                                          {item.segments[0].aircraft_code}
                                        </div>
                                      </div>

                                      <div className="info_main_list">
                                        <div className="info_main_list_title">
                                          经停次数
                                        </div>
                                        <div className="info_main_list_message">
                                          {item.segments[0].stopCount > 0
                                            ? `${item.segments[0].stopCount} 次`
                                            : "直达"}
                                        </div>
                                      </div>

                                      <div className="info_main_list">
                                        <div className="info_main_list_title">
                                          飞行时长
                                        </div>
                                        <div className="info_main_list_message">
                                          {Math.floor(item.segments[0].duration / 60)}小时
                                          {Math.floor(item.segments[0].duration % 60)}分钟
                                        </div>
                                      </div>

                                      <div className="info_main_list">
                                        <div className="info_main_list_title">
                                          是否有餐食
                                        </div>
                                        <div className="info_main_list_message">
                                          {item.segments[0].hasMeal ? "有" : "无"}
                                        </div>
                                      </div>

                                      <div className="info_main_list">
                                        <div className="info_main_list_title">
                                          餐食等级
                                        </div>
                                        <div className="info_main_list_message">
                                          {item.segments[0].MealCode || "无"}
                                        </div>
                                      </div>
                                    </div>

                                    <div className="info_bottom">
                                      机型仅供参考，具体请以实际执行航班为准
                                    </div>
                                  </div>
                                )}
                              >
                                <div className="air_number">
                                  {item.segments[0].flightNumber} 机型{" "}
                                  {item.segments[0].aircraftCode}
                                </div>
                              </Popover>

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
                      ) : (
                        ""
                      )}
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
                                  <div
                                    className="cabin_list"
                                    key={oitem.name + "__" + pindex}
                                  >
                                    <div className="list_info">
                                      <div
                                        className="list_name"
                                        style={{
                                          cursor:
                                            pindex === 0 && oitem.data.length > 1
                                              ? "pointer"
                                              : "",
                                          fontWeight: pindex === 0 && oitem.data.length > 1?'bold':''
                                        }}
                                        onClick={() =>
                                          this.openMoreCabin(
                                            item.segments_key + oitem.name
                                          )
                                        }
                                      >
                                        {oitem.name} {pitem.cabinInfo.cabinCode}{" "}
                                        {pitem.discount}
                                        {pindex === 0 && oitem.data.length > 1 ? (
                                          <div className="more_cabin_btn">
                                            <img
                                              style={{
                                                transform: `rotate(${
                                                  item.segments_key + oitem.name ===
                                                  this.state.openCabinName
                                                    ? 180
                                                    : 0
                                                }deg)`,
                                              }}
                                              src={MoreCabinBtn}
                                              alt="展开更多舱位"
                                            ></img>
                                          </div>
                                        ) : (
                                          ""
                                        )}
                                      </div>
                                      <div className="list_message">
                                        {pitem.ruleInfos.refund ? (
                                          <Popover
                                            placement="bottomRight"
                                            color="#fff"
                                            overlayClassName="refund_popover"
                                            content={() => (
                                              <div className="refund_box">
                                                <div className="refund_title">
                                                  退改签说明
                                                </div>
                                                <div className="refund_main">
                                                  <div className="refund_main_title">
                                                    退票
                                                  </div>
                                                  {pitem.ruleInfos.refund.map(
                                                    (ritem, rindex) => (
                                                      <div
                                                        className="refund_main_box"
                                                        key={ritem.title + "_" + rindex}
                                                      >
                                                        <p>{ritem.title}</p>
                                                        <p>
                                                          {ritem.value
                                                            ? Number(ritem.value)
                                                              ? Number(ritem.value) + "%"
                                                              : ritem.value
                                                            : ""}
                                                        </p>
                                                      </div>
                                                    )
                                                  )}
                                                </div>
                                                <div className="refund_main">
                                                  <div className="refund_main_title">
                                                    改签
                                                  </div>
                                                  {pitem.ruleInfos.change &&
                                                    pitem.ruleInfos.change.map(
                                                      (ritem, rindex) => (
                                                        <div
                                                          className="refund_main_box"
                                                          key={ritem.title + "_" + rindex}
                                                        >
                                                          <p>{ritem.title}</p>
                                                          <p>
                                                            {ritem.value
                                                              ? Number(ritem.value)
                                                                ? Number(ritem.value) +
                                                                  "%"
                                                                : ritem.value
                                                              : ""}
                                                          </p>
                                                        </div>
                                                      )
                                                    )}
                                                </div>
                                              </div>
                                            )}
                                          >
                                            <p>
                                              {Number(pitem.ruleInfos.refund[0].value) &&
                                              Number(
                                                pitem.ruleInfos.refund[
                                                  pitem.ruleInfos.refund.length - 1
                                                ].value
                                              )
                                                ? `退票${
                                                    pitem.ruleInfos.refund[0].value
                                                  }%-${
                                                    pitem.ruleInfos.refund[
                                                      pitem.ruleInfos.refund.length - 1
                                                    ].value
                                                  }%`
                                                : "根据航司规定"}
                                            </p>
                                          </Popover>
                                        ) : (
                                          <p className="not_rule">根据航司规定</p>
                                        )}
                                        <span></span>
                                        <p className="not_rule">
                                          {pitem.cabinInfo.baggage}
                                        </p>
                                      </div>
                                    </div>

                                    <div className="list_option">
                                      <div className="list_account">
                                        <Popover
                                          placement="bottomRight"
                                          overlayClassName="price_popover"
                                          content={() => (
                                            <div className="price_box">
                                              <div className="box_title">价格明细</div>
                                              <div className="price_content">
                                                <div className="price_item">
                                                  <div className="detail_title">
                                                    票面价
                                                  </div>
                                                  <div className="detail_amount">
                                                    &yen;{pitem.cabinPrices.ADT.price}
                                                  </div>
                                                </div>
                                                <div className="price_item">
                                                  <div className="detail_title">奖励金</div>
                                                  <div className="detail_amount">
                                                    &yen;
                                                    {
                                                      pitem.cabinPrices.ADT.rulePrice
                                                        .reward
                                                    }
                                                  </div>
                                                </div>
                                                <div className="price_item">
                                                  <div className="detail_title">
                                                    服务费
                                                  </div>
                                                  <div className="detail_amount">
                                                    &yen;{pitem.cabinPrices.ADT.service}
                                                  </div>
                                                </div>
                                                <div className="price_item">
                                                  <div className="detail_title">
                                                    结算价
                                                  </div>
                                                  <div className="detail_amount total_detail_amount">
                                                    &yen;
                                                    {Number(pitem.cabinPrices.ADT.price) -
                                                      Number(
                                                        pitem.cabinPrices.ADT.rulePrice
                                                          .reward
                                                      )}
                                                  </div>
                                                </div>
                                                <div className="price_item">
                                                  <div className="detail_amount tax_detail_amount">
                                                    含税&yen;
                                                    {Number(pitem.cabinPrices.ADT.price) +
                                                      Number(
                                                        pitem.cabinPrices.ADT.service
                                                      ) +
                                                      Number(
                                                        pitem.cabinPrices.ADT.build
                                                      ) -
                                                      Number(
                                                        pitem.cabinPrices.ADT.rulePrice
                                                          .reward
                                                      )}
                                                  </div>
                                                </div>
                                              </div>
                                              <span>实际价格以下单支付价格为准</span>
                                            </div>
                                          )}
                                        >
                                          <div>
                                            &yen;
                                            <span>{pitem.cabinPrices.ADT.price}</span>
                                          </div>
                                        </Popover>

                                        {pitem.cabinPrices.ADT.rulePrice.reward ? (
                                          <div className="incentive_money">
                                            奖励 &yen; 
                                            {pitem.cabinPrices.ADT.rulePrice.reward}
                                          </div>
                                        ) : (
                                          ""
                                        )}
                                      </div>
                                      <div className="option_box">
                                        <Button
                                          className="list_btn"
                                          type="primary"
                                          loading={
                                            this.state.scheduledStatus === pitem.data
                                          }
                                          disabled={
                                            this.state.scheduledStatus === pitem.data ||
                                            this.state.scheduledAllBtn
                                          }
                                          onClick={() => this.jumpTicketDetail(pitem)}
                                        >
                                          {this.state.scheduledStatus === pitem.data
                                            ? "验价中"
                                            : "预定"}
                                        </Button>
                                        {pitem.cabinInfo.cabinNum < 9 ? (
                                          <p>余 {pitem.cabinInfo.cabinNum} 张</p>
                                        ) : (
                                          ""
                                        )}
                                      </div>
                                    </div>
                                  </div>

                                  {this.state.openCabinIndex < oitem.data.length &&
                                  this.state.openCabinIndex - 1 === pindex &&
                                  pindex !== 0 ? (
                                    <div
                                      key={oitem.name + "_" + pindex}
                                      className="open_more_cabin_btn"
                                    >
                                      <span
                                        onClick={() =>
                                          this.openCabinIndexStatus(oitem.data.length)
                                        }
                                      >
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
                {/* 骨架屏 */}
                {this.state.flightListStatus &&
                  this.state.skeletonList.map((item) => (
                    <div className="list_card skeleton_card" key={item}>
                      <Skeleton active paragraph={{ rows: 2 }} />
                    </div>
                  ))}
                {/* 获取失败 */}
                {!this.state.flightListStatus ? (
                  <Result
                    icon={<SmileOutlined />}
                    title="暂无航班信息，请更换日期进行查询"
                    extra={<Button type="primary">更改航程</Button>}
                  />
                ) : (
                  ""
                )}
              </QueueAnim>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
