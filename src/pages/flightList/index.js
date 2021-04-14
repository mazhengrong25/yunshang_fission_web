/*
 * @Description: 机票列表
 * @Author: wish.WuJunLong
 * @Date: 2021-02-05 18:31:03
 * @LastEditTime: 2021-04-14 16:46:52
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
  Modal,
  DatePicker,
  message,
} from "antd";

import { SmileOutlined } from "@ant-design/icons";

import QueueAnim from "rc-queue-anim";

import SelectCity from "../../components/SelectCity"; // 选择城市组件

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

import AirCard from "../../components/AirCard"; // 航班卡片

import AirCabinCard from "../../components/AirCabinCard"; // 舱位卡片

const { Option } = Select;
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      urlData: {}, // url参数
      flightList: [], // 航班列表
      isFlightListStatus: false, // 航班列表状态

      editFlightType: false, // 更改当前航程状态 打开航程选择栏

      searchCity: {
        // 城市搜索
        endAir: "",
        endCode: "",
        startAir: "",
        startCode: "",
        startDate: "",
      },

      hotCity: [], // 热门城市
      cityList: [], // 所有城市
      cityUnitList: [...Array(26).keys()].map((i) => String.fromCharCode(i + 65)), // 生成A-Z数组
      cityModal: false, // 去程城市选择
      cityToModal: false, // 返程城市选择

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
      searchCabin: ["all"], // 舱位筛选
      searchAir: ["all"], // 航空公司筛选

      scheduledStatus: "", // 舱位验价按钮状态
      scheduledAllBtn: false, // 所有验价按钮状态

      airList: "", // 当前航班列表所有航司

      navShow: [0, 1, 2], //航班筛选状态 0---起飞时段   1---舱位  2---航空公司
      airlineList: [], //航空公司列表

      navExpand: 5, //航空公司展开更多
    };
  }
  async componentDidMount() {
    await this.setState({
      urlData: React.$filterUrlParams(decodeURI(this.props.location.search)),
    });

    console.log(this.state.urlData);

    await this.setState({
      searchCabin: this.state.urlData.cabin ? [this.state.urlData.cabin] : ["all"],
    });

    if (
      !this.state.urlData.start ||
      !this.state.urlData.end ||
      !this.state.urlData.date
    ) {
      this.setState({
        editFlightType: true,
        skeletonList: [],
        flightListStatus: false,
      });
      return message.warning("航班查询信息不完整，请完善查询信息后重新查询");
    }

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
      cabin_level:
        String(this.state.searchCabin) !== "all" ? String(this.state.searchCabin) : "",
    };
    await this.$axios.post("/api/inland/air", data).then((res) => {
      if (res.errorcode === 10000) {
        let newAirList = res.data.IBE.list;
        let airList = [];
        newAirList.forEach((item) => {
          airList.push(item.segments[0].airline);
          item["searchAir"] = true;
          item["searchType"] = true;
        });

        this.setState({
          airList: String([...new Set(airList)]),
          fileKey: res.data.IBE.file_key,
          flightList: newAirList,
          skeletonList: [],
        });
      } else {
        message.warning(res.msg);
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
    this.getAirList();
    let data = {
      endAir: this.state.urlData.endAddress,
      endCode: this.state.urlData.end,
      startAir: this.state.urlData.startAddress,
      startCode: this.state.urlData.start,
      startDate: this.state.urlData.date,
    };

    console.log(data);

    this.setState({
      searchCity: data,
      editFlightType: !this.state.editFlightType,
    });
  }

  // 城市选择器获取焦点时
  openCityModal = async (val) => {
    await this.setState({ cityModal: val === "start", cityToModal: val === "end" });
  };

  // 获取选中城市数据
  selectAir(val, label) {
    let data = this.state.searchCity;
    console.log(val, label);
    data[`${label}Air`] = val.city_name + `(${val.city_code})`;
    data[`${label}Code`] = val.city_code;
    console.log(data);
    this.setState({
      searchCity: data,
      cityModal: false,
      cityToModal: false,
    });
  }

  // 选择时间
  dateSelect = (date, dateString) => {
    let data = this.state.searchCity;
    data.startDate = dateString;
    this.setState({
      searchCity: data,
    });
  };

  // 航班搜索
  async searchSubmit() {
    let url = `/flightList?start=${this.state.searchCity.startCode}&startAddress=${this.state.searchCity.startAir}&end=${this.state.searchCity.endCode}&endAddress=${this.state.searchCity.endAir}&date=${this.state.searchCity.startDate}`;

    await this.props.history.push(encodeURI(url));

    await this.setState({
      urlData: React.$filterUrlParams(decodeURI(this.props.location.search)),
      flightList: [],
    });
    console.log(this.state.urlData);
    await this.getFlightList();
    await this.getAirlineList();
  }

  // 获取机场列表
  async getAirList() {
    let data = {
      range: "CN",
    };

    await this.$axios.get("/api/getAirList", { params: data }).then((res) => {
      let cityAirList = res;
      let hotCity = [];
      let cityList = [];
      // 热门城市组装
      cityAirList.forEach((item) => {
        if (
          item.air_port_name === "首都" ||
          item.city_name === "重庆" ||
          item.city_name === "成都" ||
          item.city_name === "广州" ||
          item.city_name === "上海" ||
          item.city_name === "杭州" ||
          item.city_name === "乌鲁木齐" ||
          item.city_name === "深圳"
        ) {
          hotCity.push(item);
        }
      });

      // 城市首字母组装
      let unitCityList = [];
      this.state.cityUnitList.forEach((item, index) => {
        unitCityList.push({
          unit: "",
          data: [],
        });
        cityAirList.forEach((oitem) => {
          if (
            String(oitem.city_ename[0]).toUpperCase() === item &&
            oitem.air_port !== "MY2" &&
            item
          ) {
            unitCityList[index]["unit"] = item;
            unitCityList[index]["data"].push(oitem);
          }
        });
      });

      // 组装首字母数组
      let A = "ABCDEF";
      let G = "GHIJ";
      let K = "KLMN";
      let P = "PQRSTUVW";
      let X = "XYZ";

      let AList = [];
      let GList = [];
      let KList = [];
      let PList = [];
      let XList = [];

      unitCityList.forEach((item, index) => {
        if (index < A.length && item.unit) {
          AList.push(item);
        }
        if (index < G.length + A.length && index >= A.length && item.unit) {
          GList.push(item);
        }
        if (
          index < K.length + A.length + G.length &&
          index >= G.length + A.length &&
          item.unit
        ) {
          KList.push(item);
        }
        if (
          index <= P.length + A.length + G.length + K.length &&
          index >= K.length + A.length + G.length &&
          item.unit
        ) {
          PList.push(item);
        }
        if (
          index <= X.length + A.length + G.length + K.length + P.length &&
          index > P.length + A.length + G.length + K.length &&
          item.unit
        ) {
          XList.push(item);
        }
      });

      cityList.push(
        {
          unit: A,
          data: AList,
        },
        {
          unit: G,
          data: GList,
        },
        {
          unit: K,
          data: KList,
        },
        {
          unit: P,
          data: PList,
        },
        {
          unit: X,
          data: XList,
        }
      );

      this.setState({
        hotCity: hotCity,
        cityList: cityList,
      });
    });
  }

  // 获取舱位信息
  openCabinBox = (val) => {
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
  };

  // 打开舱位
  openMoreCabin = (val) => {
    this.setState({
      openCabinName: val !== this.state.openCabinName ? val : "",
    });
  };

  // 打开更多舱位
  openCabinIndexStatus = (number) => {
    this.setState({
      openCabinIndex: number,
    });
  };

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
    if (this.state.flightList.length < 1) {
      return message.warning("航班信息获取中");
    }
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
      segmentsKey: "",
      searchTime: type,
    });
  };

  // 筛选栏 舱位筛选
  changeSearchCabin = async (e) => {
    if (this.state.flightList.length < 1) {
      return message.warning("航班信息获取中");
    }
    let newData;

    if (e[e.length - 1] === "all" || e.length < 1) {
      newData = "all";
    } else {
      newData = e[e.length - 1];
    }

    await this.setState({
      searchCabin: [newData],
      flightList: [],
    });

    await this.getFlightList();
  };

  // 筛选栏 航司筛选
  changeSearchAir = (val) => {
    if (val.indexOf("all") !== -1 && val.length > 1 && val[val.length - 1] !== "all") {
      val.splice(
        val.findIndex((item) => item === "all"),
        1
      );
    } else if (val.length < 1 || val[val.length - 1] === "all") {
      val = ["all"];
    }

    let flightList = this.state.flightList;

    flightList.forEach((item) => {
      // 获取当前航班日期
      let thisAir = item.segments[0].airline_info.airline;

      // 对比当前航班时间是否处于筛选状态时间之前
      item["searchAir"] = val.indexOf("all") !== -1 ? true : val.indexOf(thisAir) !== -1;
    });

    this.setState({
      segmentsKey: "",
      searchAir: val,
    });
  };

  // 预定机票 - 验价
  jumpTicketDetail = (val) => {
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
  };
  // 航班筛选栏展开收起
  openNavMenu(val) {
    let data = this.state.navShow;
    if (String(data).indexOf(val) !== -1) {
      data.splice(
        data.findIndex((item) => item === val),
        1
      );
    } else {
      data.push(val);
    }
    this.setState({
      navShow: data,
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
                  this.state.urlData.date || ""
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
              <div className="input_list">
                <Input
                  placeholder="起飞城市"
                  value={this.state.searchCity.startAir}
                  onFocus={() => this.openCityModal("start")}
                />
                <SelectCity
                  hotCity={this.state.hotCity}
                  cityList={this.state.cityList}
                  cityModal={this.state.cityModal}
                  selectAir={(val, type) => this.selectAir(val, type)}
                  airType="start"
                  closeAirModal={() =>
                    this.setState({
                      cityModal: false,
                    })
                  }
                ></SelectCity>
              </div>
              <div className="input_list">
                <Input
                  placeholder="到达城市"
                  value={this.state.searchCity.endAir}
                  onFocus={() => this.openCityModal("end")}
                />
                <SelectCity
                  hotCity={this.state.hotCity}
                  cityList={this.state.cityList}
                  cityModal={this.state.cityToModal}
                  selectAir={(val, type) => this.selectAir(val, type)}
                  airType="end"
                  closeAirModal={() =>
                    this.setState({
                      cityToModal: false,
                    })
                  }
                ></SelectCity>
              </div>
              <DatePicker
                allowClear={false}
                showToday={false}
                disabledDate={(current) => {
                  return (
                    current && current < this.$moment().subtract(1, "days").endOf("day")
                  );
                }}
                onChange={this.dateSelect}
                defaultValue={this.$moment(this.$moment().add(1, "d"), "YYYY-MM-DD")}
              />
              <Button
                type="primary"
                className="search_btn"
                onClick={() => this.searchSubmit()}
              >
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
                    起飞时段{" "}
                    <div
                      className="search_open_btn"
                      style={{
                        transform:
                          String(this.state.navShow).indexOf(0) !== -1
                            ? "rotate(180deg)"
                            : "rotate(0)",
                      }}
                    >
                      <img src={MoreCabinBtn} alt="航班筛选展开按钮"></img>
                    </div>
                  </div>
                  <div
                    className="fly_div"
                    style={{
                      display:
                        String(this.state.navShow).indexOf(0) !== -1 ? "block" : "none",
                    }}
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
                    舱位{" "}
                    <div
                      className="search_open_btn"
                      style={{
                        transform:
                          String(this.state.navShow).indexOf(1) !== -1
                            ? "rotate(180deg)"
                            : "rotate(0)",
                      }}
                    >
                      <img src={MoreCabinBtn} alt="航班筛选展开按钮"></img>
                    </div>
                  </div>
                  <div
                    className="cabin_div"
                    style={{
                      display:
                        String(this.state.navShow).indexOf(1) !== -1 ? "block" : "none",
                    }}
                  >
                    <Checkbox.Group
                      className="list_box"
                      value={this.state.searchCabin}
                      onChange={this.changeSearchCabin}
                    >
                      <Checkbox className="box_item" value={"all"}>
                        不限舱位
                      </Checkbox>
                      <Checkbox className="box_item" value={"经济舱"}>
                        经济舱
                      </Checkbox>
                      <Checkbox className="box_item" value={"公务舱"}>
                        公务舱
                      </Checkbox>
                      <Checkbox className="box_item" value={"头等舱"}>
                        头等舱
                      </Checkbox>
                    </Checkbox.Group>
                  </div>
                </div>

                <div className="search_list">
                  <div className="list_title" onClick={() => this.openNavMenu(2)}>
                    航空公司{" "}
                    <div
                      className="search_open_btn"
                      style={{
                        transform:
                          String(this.state.navShow).indexOf(2) !== -1
                            ? "rotate(180deg)"
                            : "rotate(0)",
                      }}
                    >
                      <img src={MoreCabinBtn} alt="航班筛选展开按钮"></img>
                    </div>
                  </div>
                  <div
                    className="airline_div"
                    style={{
                      display:
                        String(this.state.navShow).indexOf(2) !== -1 ? "block" : "none",
                    }}
                  >
                    <Checkbox.Group
                      className="airline_item"
                      value={this.state.searchAir}
                      onChange={this.changeSearchAir}
                    >
                      <Checkbox value="all" className="airline_list">
                        不限
                      </Checkbox>
                      {this.state.airlineList.map((item, index) => (
                        <Checkbox
                          style={{
                            display: index <= this.state.navExpand ? "flex" : "none",
                            marginLeft: 0,
                          }}
                          key={index}
                          className="airline_list"
                          value={item.airline}
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
                  {
                    this.state.flightList.filter((u) => u.searchType && u.searchAir)
                      .length
                  }
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
                    <div key={item.segments_key}>
                      {/* 判断当前数据是否显示 如没有当前参数则判断时候为为筛选状态 */}
                      {(item.searchType || this.state.searchTime === "notTime") &&
                      (item.searchAir || this.state.searchAir.indexOf("all") !== -1) ? (
                        <AirCard
                          airMessage={item}
                          segmentsKey={this.state.segmentsKey}
                          cabinListLength={this.state.cabinList.length}
                          openCabinBox={this.openCabinBox}
                        ></AirCard>
                      ) : (
                        ""
                      )}
                      {this.state.cabinList.length > 0 &&
                      this.state.segmentsKey === item.segments_key ? (
                        <AirCabinCard
                          cabinList={this.state.cabinList}
                          openCabinIndex={this.state.openCabinIndex}
                          openCabinName={this.state.openCabinName}
                          scheduledStatus={this.state.scheduledStatus}
                          scheduledAllBtn={this.state.scheduledAllBtn}
                          segments_key={item.segments_key}
                          openMoreCabin={this.openMoreCabin}
                          jumpTicketDetail={this.jumpTicketDetail}
                          openCabinIndexStatus={this.openCabinIndexStatus}
                        ></AirCabinCard>
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
                    extra={
                      <Button
                        type="primary"
                        onClick={() => this.setState({ editFlightType: true })}
                      >
                        更改航程
                      </Button>
                    }
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
