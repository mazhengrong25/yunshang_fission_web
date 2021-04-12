/*
 * @Description: 国内订单详情
 * @Author: mzr
 * @Date: 2021-02-04 15:19:50
 * @LastEditTime: 2021-04-12 16:38:32
 * @LastEditors: mzr
 */
import React, { Component } from "react";

import {
  Table,
  Divider,
  Button,
  Breadcrumb,
  Modal,
  Input,
  Statistic,
  Spin,
  message,
  Checkbox,
  Row,
  Col,
  Select,
} from "antd";

import { Base64 } from "js-base64";

import copy from "copy-to-clipboard";

import "./inlandDetail.scss";
import Column from "antd/lib/table/Column";

import airIcon from "../../../static/flight_fly.png"; // 航班航程图标

import WarningModal from "../../../components/WarningModal";

import AircraftTypePopover from "../../../components/AircraftTypePopover"; // 航班信息 机型信息组件
import RefundsAndChangesPopover from "../../../components/RefundsAndChangesPopover"; // 退改签说明弹窗

const { Option } = Select;
const { TextArea } = Input;
const { Countdown } = Statistic;

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false, //航班信息展开收起
      urlData: {},
      detailData: {}, //详情数据
      detailPassenger: [], //乘机人信息
      detailSegment: [], //航班信息
      detailInsure: {}, //保险信息
      insurancePassenger: [], // 有保险的乘客
      showModal: false, //弹出发送短信
      loadDetail: true, //加载详情页面
      showRefund: false, //弹出退票

      sendSMS: {}, // 发送短信默认值
      sendPassenger: [], // 该订单联系人与所有乘机人联系方式
      MSMTemplateList: {
        modelList: [],
      }, // 短信模板
      MSMMessage: {}, // 短信信息

      showCancel: false, // 取消订单弹窗
    };
  }

  async componentDidMount() {
    await this.setState({
      urlData: React.$filterUrlParams(this.props.location.search),
    });
    await this.getDetail();
  }

  // 打开航班信息折叠栏
  openFoldBar(index) {
    let data = this.state.detailSegment;
    data[index]["isShow"] = !data[index].isShow;
    this.setState({
      detailSegment: data,
    });
  }

  // 打开发送短信弹窗
  openModal(name, phone) {
    this.getMSMTemplate();
    // 组装联系人与乘机人信息
    let sendPassenger = [];
    sendPassenger.push({
      type: "联系人",
      PassengerName: this.state.detailData.contact,
      phone: this.state.detailData.phone,
    });
    sendPassenger = sendPassenger.concat(this.state.detailPassenger);

    let data = {
      name: [name],
      phone: [phone],
    };
    console.log(data);

    this.setState({
      sendPassenger: sendPassenger,
      sendSMS: data,
      showModal: true,
    });
  }

  // 选择发送短信人员
  selectSendMSM = (val) => {
    console.log(val);
    let data = this.state.sendSMS;
    data.name = val;
    data.phone = [];
    data.name.forEach((oitem) => {
      this.state.sendPassenger.forEach((item) => {
        if (item.PassengerName === oitem) {
          data.phone.push(item.phone);
        }
      });
    });

    data.phone = [...data.phone];

    this.setState({
      sendSMS: data,
    });
  };

  // 获取短信模板
  getMSMTemplate() {
    this.$axios.get("/api/admin_msg/sendMsg/" + this.state.urlData.detail).then((res) => {
      this.setState({
        MSMTemplateList: res,
      });
    });
  }

  // 选择短信模板
  selectMSMTemplate = (val) => {
    console.log(val);
    let data = {
      id: "",
      message: "",
    };
    this.state.MSMTemplateList.modelList.forEach((item) => {
      if (val === item.id) {
        data.id = item.id;
        data.message = item.msg;
      }
    });

    console.log(data);

    this.setState({
      MSMMessage: data,
    });
  };

  // 修改手机号
  changeSendPhone = (val) => {
    let data = this.state.sendSMS;
    data.phone = val.target.value;
    this.setState({
      sendSMS: data,
    });
  };
  // 修改短信
  changeSendMessage = (val) => {
    let data = this.state.MSMMessage;
    data.message = val.target.value;
    this.setState({
      MSMMessage: data,
    });
  };

  // 发送短信
  sendMessageBtn() {
    if (!String(this.state.sendSMS.phone)) {
      return message.warning("请选择短信接收人员");
    }
    if (!this.state.MSMMessage.id) {
      return message.warning("请选择短信模板");
    }

    let data = {
      phone: String(this.state.sendSMS.phone),
      msg_content: this.state.MSMMessage.message,
      user_type: this.state.MSMTemplateList.user_type,
      is_timer: this.state.MSMTemplateList.is_timer,
      msg_model_id: this.state.MSMMessage.id || "",
    };

    this.$axios
      .post("/api/admin_msg/sendMsg/" + this.state.urlData.detail, data)
      .then((res) => {
        if (res.errorcode === 10000) {
          message.success(res.msg);
          this.setState({
            showModal: false,
          });
        } else {
          message.warning(res.msg);
        }
      });
  }

  // 退票弹窗
  openRefundModal() {
    this.setState({
      showRefund: true,
    });
  }

  // 退票详情
  jumpRefundDetail() {
    this.props.history.push(`/refundDetail?detail=${this.state.urlData.detail}`);
  }

  // 获取详情
  getDetail() {
    let data = {
      order_no: this.state.urlData.detail || "",
    };
    this.$axios.post("/api/order/details", data).then((res) => {
      if (res.result === 10000) {
        let insuranceList = [];
        res.data.ticket_passenger.forEach((item) => {
          if (item.insurance_total > 0) {
            insuranceList.push(item);
          }
        });

        // 判断当前订单支付状态以及剩余支付时间
        let data = res.data;
        if (data.status === 1 && data.left_min <= 0) {
          data.status = 5;
        }

        this.setState({
          loadDetail: false,
          detailData: data,
          detailSegment: res.data.ticket_segments,
          detailPassenger: res.data.ticket_passenger,
          detailInsure: res.data.insurance_msg,
          insurancePassenger: insuranceList,
        });
      } else {
        message.warning(res.msg);
        this.setState({
          loadDetail: false,
        });
      }
    });
  }

  // 返回到列表
  backList() {
    try {
      this.props.history.go(-1);
    } catch (error) {
      this.props.history.push("/orderList?type=inland_ticket");
    }
    // let data = {
    //   payType: "钱包",
    //   payOrder: this.state.urlData.detail,
    //   payTime: new Date(),
    //   payPrice: this.state.detailData.total_price,
    // };
    // this.props.history.push({
    //   pathname: "/orderPay",
    //   search: `?detail=${this.state.urlData.detail}`,
    //   query: data,
    // });
  }

  // 支付时间结束 关闭订单
  closeOrderStatus = () => {
    let data = this.state.detailData;
    data.status = 5;
    this.setState({
      detailData: data,
    });
  };

  // 表格合计
  sumTicketPrice() {
    let newData = 0;
    for (let i = 0; i < this.state.detailPassenger.length; i++) {
      newData += Number(this.state.detailPassenger[i].total_price);
    }
    return newData;
  }

  // 拷贝订单号
  copyOrderNo(val) {
    if (copy(val)) {
      message.success("已复制订单号至剪切板");
    } else {
      message.success("复制订单号失败，请手动复制");
    }
  }

  // 支付订单
  orderPayBtn() {
    let data = {
      pay_type: "1",
    };
    this.$axios
      .post(`api/pay/${Base64.encode(this.state.urlData.detail)}`, data)
      .then((res) => {
        if (res.errorcode === 10000) {
          this.props.history.push({
            pathname: `/orderPay?detail=${this.state.urlData.detail}`,
            query: {
              payType: "钱包",
              payOrder: this.state.urlData.detail,
              payTime: new Date(),
              payPrice: this.state.detailData.total_price,
            },
          });
        }
      });
  }

  // 取消订单
  cancelOrder() {
    let data = {
      order_no: this.state.urlData.detail || "",
    };
    this.$axios.post("/api/cancle/orders", data).then((res) => {
      if (res.result === 10000) {
        message.success(res.msg);
        this.getDetail();
      } else {
        message.warning(res.msg);
      }
    });
  }

  render() {
    return (
      <div className="inlandDetail">
        <Spin spinning={this.state.loadDetail}>
          <div className="content_div">
            <div className="content_nav">
              <Breadcrumb separator="<">
                <Breadcrumb.Item href="/orderList?type=inland_ticket">
                  机票订单
                </Breadcrumb.Item>
                <Breadcrumb.Item>订单详情</Breadcrumb.Item>
              </Breadcrumb>
            </div>
            {/* 待支付 */}
            {this.state.detailData.status === 1 && this.state.detailData.left_min > 0 ? (
              <div className="pay_div">
                <div className="pay_title">
                  订单请在{this.state.detailData.left_min}分钟内完成支付
                </div>

                <div className="pay_time">
                  <Countdown
                    format="mm:ss"
                    value={this.$moment().add(this.state.detailData.left_min, "m")}
                    onFinish={this.closeOrderStatus}
                  />
                </div>
              </div>
            ) : (
              ""
            )}
            {/* 订单信息 */}
            <div className="content_status">
              <div className="order_space">
                <div className="order_div">
                  <div className="order_number">订单编号</div>
                  <div className="input_number" style={{ fontSize: 18 }}>
                    {this.state.detailData.order_no}
                  </div>
                  <div
                    style={{ display: this.state.detailData.order_no ? "block" : "none" }}
                    className="number_copy"
                    onClick={() => this.copyOrderNo(this.state.detailData.order_no)}
                  ></div>
                </div>
                <div
                  className="order_status"
                  style={{
                    color:
                      this.state.detailData.status === 1
                        ? "#F36969"
                        : this.state.detailData.status === 2
                        ? "#5B7CF0"
                        : this.state.detailData.status === 3
                        ? "#32D197"
                        : this.state.detailData.status === 5
                        ? "#3A3B50"
                        : "",
                  }}
                >
                  {this.state.detailData.status !== 0 &&
                  this.state.detailData.status !== 5 &&
                  this.state.detailData.status === 1
                    ? "待支付"
                    : this.state.detailData.status === 1 ||
                      this.state.detailData.status === 2
                    ? "待出票"
                    : this.state.detailData.status === 3
                    ? "已出票"
                    : this.state.detailData.status === 5
                    ? "已取消"
                    : this.state.detailData.status === 1 &&
                      this.state.detailData.left_min < 0
                    ? "已取消"
                    : this.state.detailData.status}
                </div>
              </div>
              <div className="order_space">
                <div className="order_message">
                  <div className="order_div">
                    <div className="order_number">预定人</div>
                    <div className="input_number_crease">
                      {this.state.detailData.contact}
                    </div>
                  </div>
                  {this.state.detailData.status === 1 ? (
                    <div className="order_div">
                      <div className="order_number">下单时间</div>
                      <div className="input_number_crease">
                        {this.state.detailData.created_at}
                      </div>
                    </div>
                  ) : this.state.detailData.status === 2 ||
                    this.state.detailData.status === 3 ? (
                    <>
                      <div className="order_div">
                        <div className="order_number">支付时间</div>
                        <div className="input_number_crease">
                          {this.state.detailData.pay_time}
                        </div>
                      </div>
                      <div className="order_div">
                        <div className="order_number">支付方式</div>
                        <div className="input_number_crease">
                          {this.state.detailData.pay_type === 1
                            ? "预存款"
                            : this.state.detailData.pay_type === 2
                            ? "授信支付"
                            : this.state.detailData.pay_type === 3
                            ? "易宝"
                            : this.state.detailData.pay_type === 4
                            ? "支付宝"
                            : ""}
                        </div>
                      </div>
                    </>
                  ) : (
                    ""
                  )}
                </div>

                <div className="order_div" style={{ alignItems: "baseline" }}>
                  <div className="order_number">金额</div>
                  <div className="input_number">
                    <span>&yen;</span>
                    {this.state.detailData.total_price}
                  </div>
                </div>
              </div>
            </div>
            {/* 航班信息 */}
            {this.state.detailSegment.map((item, index) => (
              <div className="flight_div" key={item.id}>
                <div className="flight_title">航班信息</div>
                <div className="flight_detail">
                  <div className="flight_message">
                    <div className="flight_type">
                      {this.state.detailData.segment_type === 1 ? "单程" : ""}
                    </div>

                    <div className="flight_route">
                      <div className="flight_address">
                        {`${item.departure_CN.city_name} - 
                                                ${item.arrive_CN.city_name}`}
                      </div>
                      <div className="flight_date">
                        {item.departure_time.substring(0, 10)}
                        <span>{this.$moment(item.departure_time).format("ddd")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="route_div">
                    <div className="center_route">
                      <div className="flight_time">
                        {this.$moment(item.departure_time).format("HH:mm")}
                      </div>
                      <div className="flight_airport">
                        {`${item.departure_CN.city_name}${item.departure_CN.air_port_name}机场${item.departure_terminal}`}
                      </div>
                    </div>
                    <div className="flight_icon">
                      <img src={airIcon} alt="航程图标"></img>
                    </div>
                    <div className="center_route" style={{ textAlign: "right" }}>
                      <div className="flight_time">
                        {this.$moment(item.arrive_time).format("HH:mm")}
                      </div>
                      <div className="flight_airport">
                        {`${item.arrive_CN.city_name}${item.arrive_CN.air_port_name}机场${item.arrive_terminal}`}
                      </div>
                    </div>
                  </div>
                  <div className="flight_entry">
                    <div className="entry_item">
                      <RefundsAndChangesPopover
                        refundsAndChangesData={
                          item.rule_infos ? JSON.parse(item.rule_infos) : {}
                        }
                      ></RefundsAndChangesPopover>
                    </div>
                    <Divider type="vertical" />
                    <div className="entry_item">行李额{item.baggage}KG</div>
                  </div>
                </div>
                {/* 展开内容 */}
                <div
                  className="open_content"
                  style={{ display: item.isShow ? "block" : "none" }}
                >
                  <div className="content_div_open">
                    <div className="open_left">
                      <div className="left_div">
                        <div className="open_left_date">
                          <span>{this.$moment(item.departure_time).format("MM-DD")}</span>
                          <p>{this.$moment(item.departure_time).format("HH:mm")}</p>
                        </div>
                        <div className="open_left_date">
                          <span>{this.$moment(item.arrive_time).format("MM-DD")}</span>
                          <p>{this.$moment(item.arrive_time).format("HH:mm")}</p>
                        </div>
                      </div>
                      <div className="left_icon"></div>
                      <div className="left_div">
                        <div className="open_left_address">
                          {`${item.departure}${item.departure_CN.city_name}
                                                            ${item.departure_CN.air_port_name}机场${item.departure_terminal}`}
                        </div>
                        <div className="open_left_address">
                          {`${item.arrive}${item.arrive_CN.city_name}
                                                            ${item.arrive_CN.air_port_name}机场${item.arrive_terminal}`}
                        </div>
                      </div>
                    </div>
                    <div className="open_middle">
                      <div className="middle_icon">
                        <img src={this.$url + item.image} alt="" />
                      </div>
                      <div className="middle_fly_type">{item.airline_CN}</div>

                      <div className="middle_fly_modal">
                        <AircraftTypePopover
                          className=""
                          aircraftTypeData={item}
                          dateStatus={true}
                        ></AircraftTypePopover>
                      </div>

                      <div className="middle_fly_cabin">
                        {` ${
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
                    <div className="open_right">
                      <div className="right_icon"></div>
                      <div className="right_consume">
                        {Math.floor(item.duration / 3600) +
                          "h" +
                          ((item.duration / 60) % 60) +
                          "m"}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="open" onClick={() => this.openFoldBar(index)}>
                  {item.isShow ? "收起" : "展开"}
                </div>
              </div>
            ))}
            {/* 乘机人信息 */}
            <div className="content_item">
              <div className="item_title">乘机人信息</div>

              {this.state.detailPassenger.map((item, index) => (
                <div className="passenger_message" key={item.id}>
                  <div className="message_nav">
                    <div className="passenger_item">
                      <div className="passenger_number">乘机人{index + 1}</div>
                      {this.state.detailPassenger["ticket_no"] === "" ? (
                        <div className="passenger_ticketno">票号: {item.ticket_no}</div>
                      ) : (
                        ""
                      )}
                    </div>
                    <p
                      className="open_send_sms"
                      onClick={() => this.openModal(item.PassengerName, item.phone)}
                    >
                      给该乘机人发送行程通知
                    </p>
                  </div>
                  <div className="message_div">
                    <div className="item_space">
                      <div className="message_item">
                        <div className="message_head"></div>
                        <div className="passenger_name">{item.PassengerName}</div>
                        <div className="passenger_identity">{item.ticket_department}</div>
                      </div>
                      <div className="message_info">
                        <div className="div_item">
                          <div className="div_title">证件：</div>
                          <div className="div_input">
                            {item.Credential === "0"
                              ? "身份证"
                              : item.Credential === "1"
                              ? "护照"
                              : item.Credential === "2"
                              ? "港澳通行证"
                              : item.Credential === "3"
                              ? "台胞证"
                              : item.Credential === "4"
                              ? "回乡证"
                              : item.Credential === "5"
                              ? "台湾通行证"
                              : item.Credential === "6"
                              ? "入台证"
                              : item.Credential === "7"
                              ? "国际海员证"
                              : item.Credential === "8"
                              ? "其它证件"
                              : ""}
                          </div>
                        </div>
                        <div className="div_item">
                          <div className="div_title">证件号：</div>
                          <div className="div_input">{item.CredentialNo}</div>
                        </div>
                        <div className="div_item">
                          <div className="div_title">手机：</div>
                          <div className="div_input">{item.phone}</div>
                        </div>
                        <div className="div_item">
                          <div className="div_title">邮箱：</div>
                          <div className="div_input">{item.email || "无"}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* 联系人 */}
            <div className="content_item">
              <div className="item_title">联系人</div>
              <div className="contact_div">
                <div className="item_space">
                  <div className="div_item">
                    <div className="div_title">姓名:</div>
                    <div className="div_input">{this.state.detailData.contact}</div>
                  </div>
                  <div className="div_item">
                    <div className="div_title">手机:</div>
                    <div className="div_input">{this.state.detailData.phone}</div>
                  </div>
                  {/* <div className="div_item">
                    <div className="div_title">邮箱:</div>
                    <div className="div_input"></div>
                  </div> */}
                </div>
                <div className="item_space">
                  <div className="div_item">
                    <div className="div_title">备注:</div>
                    <div className="div_input">无</div>
                  </div>
                </div>
                <div className="item_space">
                  <p
                    className="open_send_sms"
                    onClick={() =>
                      this.openModal(
                        this.state.detailData.contact,
                        this.state.detailData.phone
                      )
                    }
                  >
                    给该联系人发送行程通知
                  </p>
                </div>
              </div>
            </div>
            {/* 保险服务 */}
            <div className="content_item">
              <div className="item_title">保险服务</div>

              {this.state.insurancePassenger.length > 0 ? (
                <div className="insure_table">
                  <Table
                    rowKey="id"
                    pagination={false}
                    dataSource={this.state.insurancePassenger}
                  >
                    <Column title="乘客姓名" dataIndex="PassengerName" />
                    <Column
                      title="保险名称"
                      render={() => {
                        return this.state.detailInsure.insure_desc;
                      }}
                    />
                    <Column
                      title="保险单价"
                      render={() => {
                        return this.state.detailInsure.default_dis_price;
                      }}
                    />
                  </Table>
                </div>
              ) : (
                <div className="contact_div">
                  <div className="not_insure">订单未购买保险服务</div>
                </div>
              )}
            </div>
            {/* 价格明细 */}
            <div className="content_item">
              <div className="item_title">价格明细</div>
              <div className="price_div">
                <Table
                  rowKey="id"
                  pagination={false}
                  dataSource={this.state.detailPassenger}
                >
                  <Column title="姓名" dataIndex="PassengerName" />
                  <Column
                    title="类型"
                    dataIndex="PassengerType"
                    render={(text) => (
                      <>
                        {text === "CNN"
                          ? "儿童"
                          : text === "ADT"
                          ? "成人"
                          : text === "INF"
                          ? "婴儿"
                          : ""}
                      </>
                    )}
                  />
                  <Column
                    title="票价"
                    dataIndex="ticket_price"
                    render={(text) => <>&yen;{text}</>}
                  />
                  <Column
                    title="机建"
                    dataIndex="build_total"
                    render={(text) => <>&yen;{text}</>}
                  />
                  <Column
                    title="燃油"
                    dataIndex="fuel_total"
                    render={(text) => <>&yen;{text}</>}
                  />
                  <Column
                    title="保险"
                    dataIndex="insurance_total"
                    render={(text) => <>&yen;{text}</>}
                  />
                  <Column
                    title="服务费"
                    dataIndex="service_price"
                    render={(text) => <>&yen;{text}</>}
                  />
                  <Column
                    title="奖励"
                    dataIndex="reward_price"
                    render={(text) => <>&yen;{text}</>}
                  />
                  <Column
                    title="总价"
                    dataIndex="total_price"
                    render={(text) => <p style={{ fontWeight: "bold" }}>&yen;{text}</p>}
                  />
                  <Column
                    title=""
                    dataIndex="ticket_price"
                    render={(text, record, index) => {
                      if (index === 0) {
                        return {
                          children: (
                            <div className="ticket_price">
                              <span>共计</span>
                              <span>&yen;</span>
                              {this.sumTicketPrice()}
                            </div>
                          ),
                          props: {
                            rowSpan: this.state.detailPassenger.length,
                          },
                        };
                      } else {
                        return {
                          props: {
                            rowSpan: 0,
                          },
                        };
                      }
                    }}
                  />
                </Table>

                {this.state.detailData.status === 3 ? (
                  <div className="price_button">
                    <div className="back_btn" onClick={() => this.backList()}>
                      <Button>返回</Button>
                    </div>
                    <div className="btn_item">
                      <Button onClick={() => this.openRefundModal()}>退票</Button>
                    </div>
                    <div className="btn_item">
                      <Button>改签</Button>
                    </div>
                  </div>
                ) : this.state.detailData.status === 5 ||
                  this.state.detailData.status === 2 ||
                  (this.state.detailData.status === 1 &&
                    this.state.detailData.pay_status === 2) ? (
                  <div className="price_button">
                    <div className="back_btn">
                      <Button onClick={() => this.backList()}>返回</Button>
                    </div>
                  </div>
                ) : (
                  ""
                )}
              </div>
            </div>
            {/* 支付方式 */}
            {this.state.detailData.status === 1 &&
            this.state.detailData.left_min > 0 &&
            this.state.detailData.pay_status === 1 ? (
              <div className="content_item">
                <div className="item_title">支付方式</div>
                <div className="payment_div">
                  <div className="cancel_btn">
                    <Button onClick={() => this.backList()}>返回</Button>
                  </div>
                  <div className="cancel_btn">
                    <Button
                      onClick={() =>
                        this.setState({
                          showCancel: true,
                        })
                      }
                    >
                      取消订单
                    </Button>
                  </div>
                  <div className="pay_btn">
                    <Button onClick={() => this.orderPayBtn()}>
                      立即支付
                      <span className="pay_money">
                        &yen;{this.state.detailData.total_price}
                      </span>
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              ""
            )}
            {/* 发送短信弹出 */}
            <Modal
              width={700}
              title="发送短信"
              centered
              visible={this.state.showModal}
              onCancel={() =>
                this.setState({
                  showModal: false,
                })
              }
              onOk={() => this.sendMessageBtn()}
            >
              <div className="send_msm_modal">
                <div className="modal_item">
                  <div className="modal_title">发送对象</div>
                  <div className="modal_content">
                    <Checkbox.Group
                      style={{ width: "100%" }}
                      onChange={this.selectSendMSM}
                      value={this.state.sendSMS.name}
                    >
                      <Row>
                        {this.state.sendPassenger.map((item, index) => (
                          <Col span={9} key={index}>
                            <Checkbox value={item.PassengerName}>
                              {item.type || "乘机人"}：{item.PassengerName}
                            </Checkbox>
                          </Col>
                        ))}
                      </Row>
                    </Checkbox.Group>
                  </div>
                </div>
                <div className="modal_item">
                  <div className="modal_title">手机号</div>
                  <div className="modal_content">
                    <Input
                      placeholder="请输入手机号"
                      value={String(this.state.sendSMS.phone)}
                      onChange={this.changeSendPhone}
                    />
                  </div>
                </div>
                <div className="item_tips">多个手机号用 , (半角逗号)隔开</div>
                <div className="modal_item">
                  <div className="modal_title">选择模板</div>
                  <div className="modal_content">
                    <Select
                      style={{ width: "100%" }}
                      onChange={this.selectMSMTemplate}
                      placeholder="请选择短信模板"
                    >
                      {this.state.MSMTemplateList.modelList.map((item) => (
                        <Option value={item.id} key={item.id}>
                          {item.model_name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="modal_item">
                  <div className="modal_title">发送内容</div>
                  <div className="modal_content">
                    <TextArea
                      value={this.state.MSMMessage.message}
                      placeholder="请填写发送内容"
                      rows={4}
                      onChange={this.changeSendMessage}
                    />
                  </div>
                </div>
                <div className="item_tips">
                  请勿删除内容末尾的【云上航空】或自定义签名，否则信息将被运营商拦截，消息记录永久保留
                  ，发送无关信息将承担全部法律责任！
                </div>
              </div>
            </Modal>
            {/* 取消订单弹窗 */}
            <WarningModal
              modalStatus={this.state.showCancel}
              modalMessage="是否确认取消当前订单？"
              modalSubmit={() => this.cancelOrder()}
              modalClose={() =>
                this.setState({
                  showCancel: false,
                })
              }
            ></WarningModal>
            {/* 退票弹窗 */}
<<<<<<< HEAD
            <Modal
              width={400}
              centered
              className="refund_modal"
              visible={this.state.showRefund}
              onCancel={() => this.setState({ showRefund: false })}
              footer={[
                <div key="inlandDetailModal">
                  <Button key="back" onClick={() => this.setState({ showRefund: false })}>
                    取消
                  </Button>
                  <Button key="submit" type="primary" onClick={() => this.jumpRefundDetail()}>
                    确定
                  </Button>
                </div>
              ]}
            >
              <div className="refund_group">
                <div className="middle_warn">
                  <img src={BlueWarn} alt="警告图标" />
                </div>
                <p>是否确定退票？</p>
              </div>
            </Modal>
=======
            <WarningModal
              modalStatus={this.state.showRefund}
              modalMessage="是否确定退票？"
              modalSubmit={() => this.jumpRefundDetail()}
              modalClose={() =>
                this.setState({
                  showRefund: false,
                })
              }
            ></WarningModal>
>>>>>>> 8774032f6494999674d8ab23349385b4efe617d0
          </div>
        </Spin>
      </div>
    );
  }
}
