/*
 * @Description: 国内订单-机票订单
 * @Author: mzr
 * @Date: 2021-02-04 15:19:03
 * @LastEditTime: 2021-04-12 15:02:21
 * @LastEditors: mzr
 */
import React, { Component } from "react";

import { Input, DatePicker, Select, Button, Table, Tag, Pagination } from "antd";

import "./inlandList.scss";
import Column from "antd/lib/table/Column";

import singleDirectionIcon from "../../../static/single_direction.png"; // 单程图标
import mulDirectionIcon from "../../../static/mul_direction.png"; // 往返图标

const { RangePicker } = DatePicker;
const { Option } = Select;

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isShow: false,
      dataList: [],
      searchFrom: {
        status: 0, //状态
        passengerName: "", //乘机人
        order_no: "", //订单号
        created_at: this.$moment().subtract(3, "days").format("YYYY-MM-DD"),
      },
      paginationData: {
        current_page: 1, //当前页数
        per_page: 10, //每页条数
        total: 0,
      },
    };
  }

  async componentDidMount() {
    if (sessionStorage.getItem("orderList")) {
      await this.setState({
        searchFrom: JSON.parse(sessionStorage.getItem("orderList")),
      });
    }
    await this.getDataList();
  }

  // 获取航班列表
  async getDataList() {
    let data = JSON.parse(JSON.stringify(this.state.searchFrom));
    data["status"] =
      this.state.searchFrom.status === 0
        ? "-1"
        : this.state.searchFrom.status === 1
        ? "pay_success"
        : this.state.searchFrom.status === 2
        ? 1
        : this.state.searchFrom.status === 4
        ? 5
        : this.state.searchFrom.status;
    data["page"] = this.state.paginationData.page;
    data["limit"] = this.state.paginationData.per_page;

    this.$axios.post("/api/orders/list", data).then((res) => {
      if (res.result === 10000) {
        let newPage = this.state.paginationData;
        newPage.total = res.data.total;
        newPage.current_page = res.data.current_page;

        let newData = res.data.data;
        newData.forEach((item, index) => {
          // 判断当前订单支付状态以及剩余支付时间
          if (item.status === 1 && item.is_overtime === 1) {
            newData[index].status = 5;
          }
        });

        this.setState({
          dataList: newData,
          paginationData: newPage,
        });
      }
    });
  }

  // 跳转到详情页面
  jumpDetail(val) {
    console.log(this.props.history);
    this.props.history.push(`/inlandDetail?detail=${val}`);
  }

  // 跳转到退票详情页面
  jumpRefundDetail(e) {
    this.props.history.push(`/orderRefund?detail=${e}`);
  }

  // 分页
  changePagination = async (page, pageSize) => {
    console.log(page, pageSize);

    let data = this.state.paginationData;
    data["page"] = page;
    data["limit"] = pageSize;

    console.log(data);

    await this.setState({
      paginationData: data,
    });
    await this.getDataList();
  };

  // 每页显示条数
  changePageSize = async (current, size) => {
    console.log("current, size", current, size);
    let data = this.state.paginationData;
    data["current_page"] = current;
    data["per_page"] = size;

    await this.setState({
      paginationData: data,
    });
  };

  // 选择器搜索
  SelectItem(label, val) {
    let data = this.state.searchFrom;
    data[label] = val ? val.value : 0;
    this.setState({
      searchFrom: data,
    });
  }

  // 输入框搜索
  InputItem(label, val) {
    let data = this.state.searchFrom;
    data[label] = val.target.value;
    this.setState({
      searchFrom: data,
    });
  }

  // 日期搜索
  PickerItem(start, end, val, stringVal) {
    console.log(start, end, stringVal);
    let newData = this.state.searchFrom;
    newData[start] = stringVal[0]
      ? stringVal[0]
      : this.$moment().subtract(3, "days").format("YYYY-MM-DD");
    newData[end] = stringVal[1] ? stringVal[1] : this.$moment().format("YYYY-MM-DD");
    this.setState({
      searchFrom: newData,
    });
  }

  // 筛选查询按钮
  serachBtn() {
    sessionStorage.setItem("orderList", JSON.stringify(this.state.searchFrom));
    this.getDataList();
  }

  render() {
    return (
      <div className="inlandList">
        <div className="inlandList__content_div">
          <div className="list_div">
            <div className="list_title">机票订单</div>
            <div className="list_nav">
              <div className="nav_item">
                <div className="item_title">乘机人</div>
                <div className="item_import">
                  <Input
                    placeholder="请填写"
                    allowClear
                    value={this.state.searchFrom.passengerName}
                    onChange={this.InputItem.bind(this, "passengerName")}
                  />
                </div>
              </div>
              <div className="nav_item">
                <div className="item_title">行程日期</div>
                <RangePicker
                  value={[
                    this.$moment(this.state.searchFrom.created_at),
                    this.$moment(this.state.searchFrom.created_at_end),
                  ]}
                  onChange={this.PickerItem.bind(this, "created_at", "created_at_end")}
                />
              </div>
              <div className="nav_item">
                <div className="item_title">订单号</div>
                <div className="item_import">
                  <Input
                    allowClear
                    placeholder="请输入订单号"
                    value={this.state.searchFrom.order_no}
                    onChange={this.InputItem.bind(this, "order_no")}
                  />
                </div>
              </div>
              <div className="nav_item">
                <div className="item_title">订单状态</div>
                <div className="item_import">
                  <Select
                    labelInValue
                    placeholder="请选择"
                    value={{ value: this.state.searchFrom.status }}
                    onChange={this.SelectItem.bind(this, "status")}
                  >
                    <Option value={0}>全部</Option>
                    <Option value={1}>已预订</Option>
                    <Option value={2}>待出票</Option>
                    <Option value={3}>已出票</Option>
                    <Option value={4}>已取消</Option>
                  </Select>
                </div>
              </div>
              <div className="nav_item" style={{ marginLeft: 20 }}>
                <Button type="primary" onClick={() => this.serachBtn()}>
                  查询
                </Button>
              </div>
            </div>
            <div className="order_table">
              <Table rowKey="id" pagination={false} dataSource={this.state.dataList}>
                <Column
                  width={"12%"}
                  title="类型"
                  dataIndex="segment_type"
                  render={(text) => (
                    <>
                      {text === 1
                        ? "单程"
                        : text === 2
                        ? "往返"
                        : text === 3
                        ? "多程"
                        : ""}
                    </>
                  )}
                ></Column>
                <Column
                  width={"17%"}
                  title="乘机人"
                  render={(text, render) => (
                    <div className="table_passenger">
                      {render.ticket_passenger.map((item, index) => (
                        <span key={item.id} className="table_passenger_list">
                          {item.PassengerName}
                        </span>
                      ))}
                    </div>
                  )}
                ></Column>
                <Column
                  width={"17%"}
                  title="行程"
                  render={(text, render) => (
                    <>
                      {
                        <div className="route">
                          <p>{render.ticket_segments[0].departure_CN.city_name}</p>
                          <div className="direction">
                            <img
                              src={
                                render.segment_type === 1
                                  ? singleDirectionIcon
                                  : mulDirectionIcon
                              }
                              alt="单向图标"
                            ></img>
                          </div>

                          <p>
                            {
                              render.ticket_segments[render.ticket_segments.length - 1]
                                .arrive_CN.city_name
                            }
                          </p>
                        </div>
                      }
                    </>
                  )}
                ></Column>
                <Column
                  width={"17%"}
                  title="行程时间"
                  render={(text, render) => (
                    <>
                      {
                        <div className="route_time">
                          <div className="depart_time">
                            {render.ticket_segments[0].departure_time}
                          </div>
                          <div className="arrive_time">
                            {
                              render.ticket_segments[render.ticket_segments.length - 1]
                                .departure_time
                            }
                          </div>
                        </div>
                      }
                    </>
                  )}
                ></Column>
                <Column width={"10%"} title="金额" dataIndex="total_price"></Column>
                <Column
                  title="状态"
                  width={"10%"}
                  dataIndex="status"
                  render={(text, render) => (
                    <>
                      {text !== 0 && text !== 5 && text === 1
                        ? "待支付"
                        : text === 1 || text === 2
                        ? "待出票"
                        : text === 3
                        ? "已出票"
                        : text === 5
                        ? "已取消"
                        : text === 1 && render.left_min < 0
                        ? "已取消"
                        : text}
                    </>
                  )}
                ></Column>
                <Column
                  title="操作"
                  render={(text, render) => (
                    <div className="action_div">
                      {render.status === 1 && render.pay_status !== 2 ? (
                        <Tag color="#F87C2E">支付</Tag>
                      ) : render.status === 3 ? (
                        <div className="ticket_issue">
                          <Tag onClick={() => this.jumpRefundDetail(render.order_no)}>退票</Tag>
                          <Tag>改签</Tag>
                        </div>
                      ) : (
                        ""
                      )}
                      <div
                        className="action_detail"
                        onClick={() => this.jumpDetail(render.order_no)}
                      >
                        <span></span>
                      </div>
                    </div>
                  )}
                ></Column>
              </Table>
              {/* 分页 */}
              <div className="table_pagination">
                <Pagination
                  showSizeChanger
                  pageSizeOptions={[10, 15, 20]}
                  showTitle={false}
                  total={Number(this.state.paginationData.total)}
                  current={Number(this.state.paginationData.current_page)}
                  pageSize={Number(this.state.paginationData.per_page)}
                  onChange={this.changePagination}
                  onShowSizeChange={this.changePageSize.bind(this)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
