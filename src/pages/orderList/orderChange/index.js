/*
 * @Description: 改签页面
 * @Author: wish.WuJunLong
 * @Date: 2021-04-13 13:47:27
 * @LastEditTime: 2021-04-14 19:36:47
 * @LastEditors: wish.WuJunLong
 */

import React, { Component } from "react";

import {
  Spin,
  Breadcrumb,
  message,
  Select,
  Radio,
  Table,
  DatePicker,
  Button,
  Modal,
  Skeleton,
  Result,
} from "antd";

import copy from "copy-to-clipboard";

import waringIcon from "../../../static/warn_blue.png"; // 警告图标

import AirCard from "../../../components/AirCard"; // 航班卡片
import AirCabinCard from "../../../components/AirCabinCard"; // 舱位卡片

import { SmileOutlined } from "@ant-design/icons";

import "./orderChange.scss";

const { Option } = Select;
const { Column } = Table;

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      urlData: {}, // 地址栏数据
      orderDetail: {}, // 订单详情信息
      loadingDetail: true, // 详情页面加载

      changeMessage: {
        // 改签信息初始化
        change_type: 1, // 航班类型
        reason_type: 1, // 改签状态 是否自愿
        contact: "【自愿】旅客自愿改签", // 改签原因
      },

      selectedRowKeys: [], // 选中乘客列表

      newTicketMessageList: [
        // 新查询航班列表
        {
          newTime: "",
        },
      ],

      isNewTicketModal: false, // 新航班弹窗状态

      thisTicketData: {}, // 查询航班原数据
      ticketIndex: 0, // 查询航班index

      /**
       * 查询航班参数初始化
       */
      fileKey: "", // 行程缓存
      flightList: [], // 航班列表
      cabinList: [], // 舱位列表
      segmentsKey: "", // 舱位缓存
      flightListStatus: true, // 查询航班列表状态
      skeletonList: [1, 2, 3], // 骨架屏数量

      openCabinName: "", // 舱位列表打开标识
      openCabinIndex: 5, // 舱位列表打开下标

      scheduledStatus: "", // 舱位验价按钮状态
      scheduledAllBtn: false, // 所有验价按钮状态

      segmentsKeys: "", // 验价Key
    };
  }

  async componentDidMount() {
    await this.setState({
      urlData: React.$filterUrlParams(this.props.location.search),
    });
    this.getOrderMessage();
  }

  // 获取航班信息
  getOrderMessage() {
    let data = {
      order_no: this.state.urlData.detail,
    };
    this.$axios.post("/api/order/details", data).then((res) => {
      if (res.errorcode === 10000) {
        let newTicketMessage = [];
        res.data.ticket_segments.forEach((item) => {
          newTicketMessage.push({
            newTime: "",
            searchStatus: false,
            segments: {},
          });
        });
        console.log(newTicketMessage);
        this.setState({
          loadingDetail: false,
          orderDetail: res.data,
          newTicketMessageList: newTicketMessage,
        });
      }
    });
  }

  // 拷贝订单号
  copyOrderNo(val) {
    if (copy(val)) {
      message.success("已复制订单号至剪切板");
    } else {
      message.success("复制订单号失败，请手动复制");
    }
  }

  // 改签信息修改
  changeMessageData = (name, val) => {
    let data = this.state.changeMessage;
    data[name] = val.target.value;
    this.setState({
      changeMessage: data,
    });
  };
  // 改签原因修改
  changeMessageSelect = (name, val) => {
    let data = this.state.changeMessage;
    data[name] = val;
    this.setState({
      changeMessage: data,
    });
  };

  // 表格选中项
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };

  // 搜索新航班时间
  searchNewTicketTime = (index, val) => {
    let data = this.state.newTicketMessageList;
    data[index]["newTime"] = val;
    this.setState({
      newTicketMessageList: data,
    });
  };

  // 打开新航班弹窗
  async searchAirBtn(val, index) {
    console.log(val, index);
    await this.setState({
      ticketIndex: index,
      thisTicketData: val,
      isNewTicketModal: true,
      flightListStatus: true,
      flightList: [],
      cabinList: [],
      segmentsKey: "",
      skeletonList: [1, 2, 3],
    });
    await this.getFlightList();
  }

  // 获取航班列表
  async getFlightList() {
    let data = {
      departure: this.state.thisTicketData.departure, //类型：String  必有字段  备注：起飞机场
      arrival: this.state.thisTicketData.arrive, //类型：String  必有字段  备注：到达机场
      departureTime: this.$moment(
        this.state.newTicketMessageList[this.state.ticketIndex].newTime
      ).format("YYYY-MM-DD"), //类型：String  必有字段  备注：起飞日期
      only_segment: 1, //类型：Number  可有字段  备注：仅返回航程信息：1
      min_price: 1, //类型：Number  必有字段  备注：最低价格
      cabin_level: "",
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

  // 获取舱位信息
  openCabinBox = (val) => {
    this.setState({
      segmentsKey: val,
      cabinList: [],
      openCabinIndex: 5,
    });
    if (val !== this.state.segmentsKey) {
      let data = {
        departure: this.state.thisTicketData.departure, //类型：String  必有字段  备注：起飞机场
        arrival: this.state.thisTicketData.arrive, //类型：String  必有字段  备注：到达机场
        departureTime: this.$moment(
          this.state.newTicketMessageList[this.state.ticketIndex].newTime
        ).format("YYYY-MM-DD"), //类型：String  必有字段  备注：起飞日期
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

  // 预定机票 - 验价
  jumpTicketDetail = (val) => {
    console.log(val);
    this.setState({
      scheduledStatus: val.data,
      scheduledAllBtn: true,
    });

    let data = val.routing;

    this.$axios.post("/api/checkPrice", data).then((res) => {
      console.log(res);
      if (res.errorcode === 10000) {
        let ticketMessage = this.state.newTicketMessageList;
        ticketMessage[this.state.ticketIndex]["segments"] = val.routing.segments[0];
        ticketMessage[this.state.ticketIndex]["segments"]["cabin"] =
          val.cabinInfo.cabinDesc;
        ticketMessage[this.state.ticketIndex]["segments"]["cabinCode"] =
          val.cabinInfo.cabinCode;
        ticketMessage[this.state.ticketIndex]["segments"]["cabinCode"] =
          val.cabinInfo.cabinCode;
        ticketMessage[this.state.ticketIndex]["segments"]["price"] =
          val.cabinPrices.ADT.price;
        ticketMessage[this.state.ticketIndex]["segments"]["policy_id"] =
          val.cabinPrices.ADT.rulePrice.policy_msg.id || "";
        ticketMessage[this.state.ticketIndex]["searchStatus"] = true;
        this.setState({
          segmentsKeys: res.data.keys,
          newTicketMessageList: ticketMessage,
          scheduledStatus: "",
          scheduledAllBtn: false,
          isNewTicketModal: false,
        });
        console.log("验价成功", ticketMessage);
      }
    });
  };

  // 返回改签列表
  returnChangeList() {
    try {
      this.props.history.go(-1);
    } catch (error) {
      this.props.history.push(`/changeDetail?detail=${this.state.urlData.detail}`);
    }
  }

  // 改签申请提交
  submitChangeOrder() {
    let ticketMessage = this.state.newTicketMessageList;
    let changeTicketStatus = false;
    ticketMessage.forEach((item) => {
      if (item.searchStatus) {
        changeTicketStatus = item.searchStatus;
      }
    });
    if (!changeTicketStatus || this.state.selectedRowKeys.length < 1) {
      return message.warning(
        this.state.selectedRowKeys.length < 1
          ? "请至少选择一位需要改签乘客"
          : !changeTicketStatus
          ? "请至少选择一个航班改签信息"
          : "请完善改签信息"
      );
    }

    let segments = [];

    ticketMessage.forEach((item, index) => {
      segments.push({
        flight_data: this.$moment(item.segments.depTime).format("YYYY-MM-DDTHH:mm:ss"), //类型：String  必有字段  备注：起飞日期
        departure: item.segments.depAirport, //类型：String  必有字段  备注：起飞机场
        arrival: item.segments.arrAirport, //类型：String  必有字段  备注：到达机场
        flight_no: item.segments.flightNumber, //类型：String  必有字段  备注：航班号
        time: item.segments.departureTime, //类型：String  必有字段  备注：起飞时间
        model: item.segments.aircraft_code, //类型：String  必有字段  备注：机型
        cabin: item.segments.cabinCode, //类型：String  必有字段  备注：舱位
        price: item.segments.price, //类型：Number  必有字段  备注：票价
        arr_time: this.$moment(item.segments.arrTime).format("YYYY-MM-DDTHH:mm:ss"), //类型：String  必有字段  备注：到达时间
        policy_id: item.segments.policy_id, //类型：String  必有字段  备注：政策ID
        flight_time: item.segments.duration, //类型：String  必有字段  备注：飞行时间
        departure_term: item.segments.depTerminal, //类型：String  必有字段  备注：出发航站楼
        arrival_term: item.segments.arrTerminal, //类型：String  必有字段  备注：到达航站楼
        cabin_level_key: item.segments.cabin, //类型：String  必有字段  备注：舱位等级
        keys: this.state.segmentsKeys, //类型：String  可有字段  备注：无
        old_segment_id: this.state.orderDetail.ticket_segments[index].id, //类型：Number  必有字段  备注：旧航段ID
      });
    });

    let data = {
      params: {
        change_type: this.state.changeMessage.change_type, //类型：Number  必有字段  备注：1：改期 2：升舱
        reason:
          this.state.changeMessage.reason_type === 2
            ? this.state.changeMessage.contact
            : "", //类型：String  必有字段  备注：改签原因
        contact: this.state.orderDetail.contact, //类型：String  必有字段  备注：联系人
        phone: this.state.orderDetail.phone, //类型：Number  必有字段  备注：手机号
        order_no: this.state.orderDetail.order_no, //类型：String  必有字段  备注：改签订单号
      },
      passenger_ids: this.state.selectedRowKeys, // 乘客ID列表
      segments: segments, // 改签航段信息
    };

    this.$axios.post("/api/change/order", data).then((res) => {
      if (res.errorcode === 10000) {
        message.success(res.msg);
        this.props.history.push(`/changeDetail?key=${res.data.order_no}`);
      } else {
        message.warning(res.msg);
      }
    });
    console.log(data);
  }

  render() {
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <div className="orderChange">
        <div className="order_content">
          <Spin spinning={this.state.loadingDetail}>
            {/* 面包屑 */}
            <div className="content_nav">
              <Breadcrumb separator="<">
                <Breadcrumb.Item href="/orderList?type=inland_ticket">
                  机票订单
                </Breadcrumb.Item>
                <Breadcrumb.Item>改签订单</Breadcrumb.Item>
              </Breadcrumb>
            </div>

            {/* 订单信息 */}
            <div className="content_status">
              <div className="order_space">
                <div className="order_div">
                  <div className="order_number">订单编号</div>
                  <div className="input_number" style={{ fontSize: 18 }}>
                    {this.state.orderDetail.order_no}
                  </div>
                  <div
                    style={{
                      display: this.state.orderDetail.order_no ? "block" : "none",
                    }}
                    className="number_copy"
                    onClick={() => this.copyOrderNo(this.state.orderDetail.order_no)}
                  ></div>
                </div>
                <div
                  className="order_status"
                  style={{
                    color:
                      this.state.orderDetail.status === 1
                        ? "#F36969"
                        : this.state.orderDetail.status === 2
                        ? "#5B7CF0"
                        : this.state.orderDetail.status === 3
                        ? "#32D197"
                        : this.state.orderDetail.status === 5
                        ? "#3A3B50"
                        : "",
                  }}
                >
                  {this.state.orderDetail.status !== 0 &&
                  this.state.orderDetail.status !== 5 &&
                  this.state.orderDetail.status === 1
                    ? "待支付"
                    : this.state.orderDetail.status === 1 ||
                      this.state.orderDetail.status === 2
                    ? "待出票"
                    : this.state.orderDetail.status === 3
                    ? "已出票"
                    : this.state.orderDetail.status === 5
                    ? "已取消"
                    : this.state.orderDetail.status === 1 &&
                      this.state.orderDetail.left_min < 0
                    ? "已取消"
                    : this.state.orderDetail.status}
                </div>
              </div>
              <div className="order_space">
                <div className="order_message">
                  <div className="order_div">
                    <div className="order_number">预定人</div>
                    <div className="input_number_crease">
                      {this.state.orderDetail.contact}
                    </div>
                  </div>
                  <div className="order_div">
                    <div className="order_number">订票员</div>
                    <div className="input_number_crease">
                      {this.state.orderDetail.book_user}
                    </div>
                  </div>
                  <div className="order_div">
                    <div className="order_number">预定时间</div>
                    <div className="input_number_crease">
                      {this.state.orderDetail.created_at}
                    </div>
                  </div>
                  <div className="order_div">
                    <div className="order_number">PNR</div>
                    <div className="input_number_crease">
                      {this.state.orderDetail.pnr_code}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 改签信息 */}
            <div className="content_template change_message">
              <div className="template_title">改签信息</div>
              <div className="template_main">
                <div className="change_message_list">
                  <div className="list_item">
                    <div className="item_title">航班类型</div>
                    <div className="item_input">
                      <Radio.Group
                        onChange={this.changeMessageData.bind(this, "change_type")}
                        value={this.state.changeMessage.change_type}
                      >
                        <Radio value={1}>改期</Radio>
                        <Radio value={2}>升舱</Radio>
                      </Radio.Group>
                    </div>
                  </div>
                  <div className="list_item">
                    <div className="item_title">是否自愿</div>
                    <div className="item_input">
                      <Radio.Group
                        onChange={this.changeMessageData.bind(this, "reason_type")}
                        value={this.state.changeMessage.reason_type}
                      >
                        <Radio value={1}>自愿</Radio>
                        <Radio value={2}>非自愿</Radio>
                      </Radio.Group>
                    </div>
                  </div>
                </div>
                {this.state.changeMessage.reason_type === 2 ? (
                  <div className="change_message_list">
                    <div className="list_item">
                      <div className="item_title">改签原因</div>
                      <div className="item_input">
                        <Select
                          onChange={this.changeMessageSelect.bind(this, "contact")}
                          value={this.state.changeMessage.contact}
                          style={{ width: 360 }}
                        >
                          <Option value="【自愿】旅客自愿改签">
                            【自愿】旅客自愿改签
                          </Option>
                          <Option value="【改名】乘客姓名错误修改(需备注乘客正确姓名提交申请)">
                            【改名】乘客姓名错误修改(需备注乘客正确姓名提交申请)
                          </Option>
                          <Option value="【非自愿】非自愿改签(需备注如：航班变动)">
                            【非自愿】非自愿改签(需备注如：航班变动)
                          </Option>
                        </Select>
                      </div>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>

            {/* 选择乘机人 */}
            <div className="content_template passenger_message">
              <div className="template_title">选择乘机人</div>
              <div className="template_main">
                <Table
                  rowKey="id"
                  rowSelection={rowSelection}
                  pagination={false}
                  dataSource={this.state.orderDetail.ticket_passenger}
                >
                  <Column title="乘机人" dataIndex="PassengerName" />
                  <Column
                    title="乘客类型"
                    dataIndex="PassengerType"
                    render={(text) => {
                      return text === "ADT"
                        ? "成人"
                        : text === "CNN"
                        ? "儿童"
                        : text === "INF"
                        ? "婴儿"
                        : text;
                    }}
                  />
                  <Column title="证件号码" dataIndex="CredentialNo" />
                  <Column title="销售价" dataIndex="total_price" />
                  <Column title="机键" dataIndex="build_total" />
                  <Column title="税费" dataIndex="fuel_total" />
                  <Column title="票号" dataIndex="ticket_no" />
                </Table>
              </div>
            </div>

            {/* 航班信息 */}
            <div className="content_template ticket_message">
              <div className="template_title">航班信息</div>
              <div className="template_main">
                {this.state.orderDetail.ticket_segments &&
                  this.state.orderDetail.ticket_segments.map((item, index) => (
                    <div className="ticket_list" key={item.id}>
                      <div className="list_title">
                        <div className="title_type">
                          {this.state.orderDetail.ticket_segments.length === 1
                            ? "单程"
                            : this.state.orderDetail.ticket_segments.length > 1
                            ? index === 0
                              ? "去程"
                              : index === 0
                              ? "返程"
                              : ""
                            : ""}
                        </div>
                        <div className="title_message">
                          {`${item.departure_CN.city_name}（${item.departure_CN.air_port}）- 
                          ${item.arrive_CN.city_name}（${item.arrive_CN.air_port}）`}
                        </div>
                      </div>

                      <div className="list_detail">
                        {/* 原航班 */}
                        <div className="detail_box">
                          <div className="box_type">原航班</div>
                          <div className="box_item">
                            <div className="item_title">航班号：</div>
                            <div className="item_message">{item.flight_no}</div>
                          </div>
                          <div className="box_item">
                            <div className="item_title">起降时间：</div>
                            <div className="item_message">
                              {`${item.departure_time} - 
                              ${
                                this.$moment(item.departure_time).format("YYYY-MM-DD") ===
                                this.$moment(item.arrive_time).format("YYYY-MM-DD")
                                  ? this.$moment(item.arrive_time).format("HH:mm")
                                  : item.arrive_time
                              }`}
                            </div>
                          </div>
                          <div className="box_item">
                            <div className="item_title">舱位：</div>
                            <div className="item_message">
                              {`${
                                item.cabin_level === "ECONOMY"
                                  ? "经济舱"
                                  : item.cabin_level === "FIRST"
                                  ? "头等舱"
                                  : item.cabin_level === "BUSINESS"
                                  ? "公务舱"
                                  : item.cabin_level
                              } ${item.cabin}`}
                            </div>
                          </div>
                        </div>

                        {/* 新航班 */}
                        <div className="detail_box">
                          <div className="box_type">新航班</div>

                          <div className="new_ticket_time">
                            <DatePicker
                              value={this.state.newTicketMessageList[index].newTime}
                              onChange={this.searchNewTicketTime.bind(this, index)}
                              showToday={false}
                              disabledDate={(current) => {
                                return (
                                  current &&
                                  current <
                                    this.$moment().subtract(1, "days").endOf("day")
                                );
                              }}
                            />
                            <Button
                              disabled={!this.state.newTicketMessageList[index].newTime}
                              className="search_new_ticket_btn"
                              type="primary"
                              onClick={() => this.searchAirBtn(item, index)}
                            >
                              查询航班
                            </Button>
                          </div>

                          {this.state.newTicketMessageList[index].searchStatus ? (
                            <>
                              <div className="box_item">
                                <div className="item_status">已选</div>
                                <div className="item_title">航班号：</div>
                                <div className="item_message">
                                  {
                                    this.state.newTicketMessageList[index].segments
                                      .flightNumber
                                  }
                                </div>
                              </div>
                              <div className="box_item">
                                <div className="item_title">起降时间：</div>
                                <div className="item_message">
                                  {`${
                                    this.state.newTicketMessageList[index].segments
                                      .depTime
                                  } - 
                              ${
                                this.$moment(
                                  this.state.newTicketMessageList[index].segments.depTime
                                ).format("YYYY-MM-DD") ===
                                this.$moment(
                                  this.state.newTicketMessageList[index].segments.arrTime
                                ).format("YYYY-MM-DD")
                                  ? this.$moment(
                                      this.state.newTicketMessageList[index].segments
                                        .arrTime
                                    ).format("HH:mm")
                                  : this.state.newTicketMessageList[index].segments
                                      .arrTime
                              }`}
                                </div>
                              </div>
                              <div className="box_item">
                                <div className="item_title">舱位：</div>
                                <div className="item_message">
                                  {this.state.newTicketMessageList[index].segments.cabin}
                                </div>
                              </div>
                            </>
                          ) : (
                            ""
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                <div className="change_submit_box">
                  <Button onClick={() => this.returnChangeList()}>关闭</Button>
                  <Button type="primary" onClick={() => this.submitChangeOrder()}>
                    提交申请
                  </Button>
                </div>
              </div>
            </div>
          </Spin>
        </div>

        <Modal
          title="新航班选择"
          centered
          width={970}
          className="AirSearchModal"
          maskClosable={false}
          footer={false}
          visible={this.state.isNewTicketModal}
          onCancel={() => this.setState({ isNewTicketModal: false })}
        >
          <div className="search_air_modal">
            <div className="modal_tips">
              <img src={waringIcon} alt="警告图标"></img>
              非自愿改签以航司审核为准，不保证改签成功，有问题可咨询客服
            </div>
            <div className="modal_header">
              <div className="header_input">
                <div className="input_title">出发日期</div>
                <DatePicker
                  allowClear={false}
                  value={this.state.newTicketMessageList[this.state.ticketIndex].newTime}
                  showToday={false}
                  onChange={this.searchNewTicketTime.bind(this, this.state.ticketIndex)}
                  disabledDate={(current) => {
                    return (
                      current && current < this.$moment().subtract(1, "days").endOf("day")
                    );
                  }}
                />
              </div>
              <Button
                type="primary"
                className="search_btn"
                onClick={() =>
                  this.searchAirBtn(this.state.thisTicketData, this.state.ticketIndex)
                }
              >
                搜索
              </Button>
            </div>

            <div className="modal_content">
              {this.state.flightListStatus &&
                this.state.flightList.map((item, index) => (
                  <div key={item.segments_key}>
                    <AirCard
                      airMessage={item}
                      segmentsKey={this.state.segmentsKey}
                      cabinListLength={this.state.cabinList.length}
                      openCabinBox={this.openCabinBox}
                    ></AirCard>
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
                />
              ) : (
                ""
              )}
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
