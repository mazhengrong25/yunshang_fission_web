/*
 * @Description: 个人中心---钱包流水
 * @Author: mzr
 * @Date: 2021-03-10 10:30:20
 * @LastEditTime: 2021-04-12 17:02:23
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import { Button, DatePicker, Table, Pagination, Popover } from "antd";

import "./walletInfo.scss";
import Column from "antd/lib/table/Column";
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dataList: [], //流水列表
      paginationData: {
        current_page: 1, //当前页数
        per_page: 10, //每页条数
        total: 0,
      },
      searchFrom: {},
      start_time: "2021-03-01",
      end_time: this.$moment(),
    };
  }

  async componentDidMount() {
    await this.getDataList();
  }

  // 获取钱包流水列表
  async getDataList() {
    let data = this.state.searchFrom;
    data["start_time"] = this.state.start_time;
    data["end_time"] = this.state.end_time;
    data["page"] = this.state.paginationData.page;
    data["limit"] = this.state.paginationData.per_page;

    this.$axios.post("/api/wallet/list", data).then((res) => {
      console.log("流水", res);
      if (res.errorcode === 10000) {
        let newPage = this.state.paginationData;
        newPage.total = res.data.total;
        newPage.current_page = res.data.current_page;

        this.setState({
          dataList: res.data.data,
          paginationData: newPage,
        });
      }
    });
  }

  // 日期筛选
  DateItem = (date, dateString) => {
    console.log(dateString);
    this.setState({
      start_time: dateString,
    });
  };

  // 筛选查询
  serachBtn() {
    this.getDataList();
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

  render() {
    return (
      <div className="walletInfo">
        <div className="walletInfo_content_div">
          <div className="walletInfo_div_title">钱包流水</div>
          <div className="content_div">
            <div className="content_nav">
              <div className="content_item">
                <div className="item_title">收款时间</div>
                <div className="wallet_picker">
                  <DatePicker style={{ width: 200 }} onChange={this.DateItem} />
                </div>{" "}
                -
                <div className="wallet_picker">
                  <DatePicker
                    style={{ width: 200 }}
                    allowClear={false}
                    value={this.state.end_time}
                  />
                </div>
              </div>
              <Button type="primary" onClick={() => this.serachBtn()}>
                查询
              </Button>
            </div>
            <div className="content_list">
              <Table rowKey="id" pagination={false} dataSource={this.state.dataList}>
                <Column title="订单号" dataIndex="order_no"></Column>
                <Column
                  title="订单类型"
                  dataIndex="order_type"
                  render={(text) => (
                    <>
                      {text === 1
                        ? "国内正常单"
                        : text === 2
                        ? "国际正常单"
                        : text === 3
                        ? "国内退票单"
                        : text === 4
                        ? "国际退票单"
                        : text === 5
                        ? "国内改签单"
                        : text === 6
                        ? "国际改签单"
                        : text === 7
                        ? "短信"
                        : text === 8
                        ? "流量"
                        : text === 9
                        ? "保险单"
                        : text === 10
                        ? "现金充值"
                        : text === 11
                        ? "余额冻结"
                        : text === 12
                        ? "余额提现"
                        : text === 13
                        ? "国内反冲"
                        : text === 14
                        ? "国际反冲"
                        : text === 15
                        ? "保险退保"
                        : text === 16
                        ? "调账"
                        : ""}
                    </>
                  )}
                ></Column>
                <Column
                  title="支付方式"
                  dataIndex="trans_type"
                  render={(text) => (
                    <>
                      {text === 1
                        ? "钱包充值"
                        : text === 2
                        ? "钱包消费"
                        : text === 3
                        ? "短信充值"
                        : text === 4
                        ? "短信消费"
                        : text === 5
                        ? "信用额度调整"
                        : text === 6
                        ? "冻结金额调整"
                        : text === 7
                        ? "三方支付"
                        : text === 8
                        ? "三方支付全退"
                        : text === 9
                        ? "三方支付部分退"
                        : text === 10
                        ? "提现"
                        : text === 11
                        ? "流量充值"
                        : text === 12
                        ? "预付款调整"
                        : ""}
                    </>
                  )}
                ></Column>
                <Column title="支付金额" dataIndex="amount"></Column>
                <Column title="收款时间" dataIndex="created_at"></Column>
                <Column
                  title="操作"
                  render={(text, render) => (
                    <Popover
                      placement="bottomRight"
                      color="#fff"
                      overlayClassName="wall_popover"
                      content={() => (
                        <div className="popover_div">
                          <div className="wall_title">流水详情</div>
                          <div className="wall_table">
                            <div className="table_title">订单：{render.order_no}</div>
                            <div className="table_content">
                              <div className="row">
                                <div className="col_fir">订单类型</div>
                                <div className="col_sec">
                                  {render.order_type === 1
                                    ? "国内正常单"
                                    : render.order_type === 2
                                    ? "国际正常单"
                                    : render.order_type === 3
                                    ? "国内退票单"
                                    : render.order_type === 4
                                    ? "国际退票单"
                                    : render.order_type === 5
                                    ? "国内改签单"
                                    : render.order_type === 6
                                    ? "国际改签单"
                                    : render.order_type === 7
                                    ? "短信"
                                    : render.order_type === 8
                                    ? "流量"
                                    : render.order_type === 9
                                    ? "保险单"
                                    : render.order_type === 10
                                    ? "现金充值"
                                    : render.order_type === 11
                                    ? "余额冻结"
                                    : render.order_type === 12
                                    ? "余额提现"
                                    : render.order_type === 13
                                    ? "国内反冲"
                                    : render.order_type === 14
                                    ? "国际反冲"
                                    : render.order_type === 15
                                    ? "保险退保"
                                    : render.order_type === 16
                                    ? "调账"
                                    : ""}
                                </div>
                              </div>
                              <div className="row">
                                <div className="col_fir">分销商</div>
                                <div className="col_sec">
                                  {render.userinfo.company_name}
                                </div>
                              </div>
                              <div className="row">
                                <div className="col_fir">交易类型</div>
                                <div className="col_sec">
                                  {render.trans_type === 1
                                    ? "钱包充值"
                                    : render.trans_type === 2
                                    ? "钱包消费"
                                    : render.trans_type === 3
                                    ? "短信充值"
                                    : render.trans_type === 4
                                    ? "短信消费"
                                    : render.trans_type === 5
                                    ? "信用额度调整"
                                    : render.trans_type === 6
                                    ? "冻结金额调整"
                                    : render.trans_type === 7
                                    ? "三方支付"
                                    : render.trans_type === 8
                                    ? "三方支付全退"
                                    : render.trans_type === 9
                                    ? "三方支付部分退"
                                    : render.trans_type === 10
                                    ? "提现"
                                    : render.trans_type === 11
                                    ? "流量充值"
                                    : render.trans_type === 12
                                    ? "预付款调整"
                                    : ""}
                                </div>
                              </div>
                              <div className="row">
                                <div className="col_fir">交易前余额</div>
                                <div className="col_sec">{render.before_balance}</div>
                              </div>
                              <div className="row">
                                <div className="col_fir">交易金额</div>
                                <div className="col_sec">{render.amount}</div>
                              </div>
                              <div className="row">
                                <div className="col_fir">交易后余额</div>
                                <div className="col_sec">{render.after_balance}</div>
                              </div>
                              <div className="row">
                                <div className="col_fir">实际操作员</div>
                                <div className="col_sec">{render.admin_code}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    >
                      <span className="details_btn">详情</span>
                    </Popover>
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
