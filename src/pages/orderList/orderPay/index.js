/*
 * @Description: 支付回调
 * @Author: wish.WuJunLong
 * @Date: 2021-03-05 10:18:22
 * @LastEditTime: 2021-03-05 14:04:54
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import "./orderPay.scss";

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderId: "", // 订单号
      orderMessage: {}, // 订单信息
    };
  }

  async componentDidMount() {
    if (!this.props.location.query) {
      return this.props.history.push(
        `/inlandDetail?detail=${
          React.$filterUrlParams(this.props.location.search).detail
        }`
      );
    }
    console.log(this.props.location.query)
    await this.setState({
      orderId: React.$filterUrlParams(this.props.location.search).detail,
      orderMessage: this.props.location.query,
    });
  }

  render() {
    return (
      <div className="orderPay">
        <div className="pay_status">
          


        </div>




      </div>
    )
  }
}
