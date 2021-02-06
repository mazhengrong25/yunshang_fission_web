/*
 * @Description:
 * @Author: wish.WuJunLong
 * @Date: 2021-02-05 18:31:03
 * @LastEditTime: 2021-02-06 09:51:15
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      urlData: {},
    };
  }
  async componentDidMount() {
    await this.setState({
      urlData: React.$filterUrlParams(this.props.location.search),
    });

    await this.getFlightList();
  }

  // 获取航班列表
  getFlightList() {
    let data = {
      departure: this.state.urlData.start, //类型：String  必有字段  备注：起飞机场
      arrival: this.state.urlData.end, //类型：String  必有字段  备注：到达机场
      departureTime: this.state.urlData.date, //类型：String  必有字段  备注：起飞日期
      page: 1, //类型：Number  可有字段  备注：1
      per_page: 1, //类型：Number  可有字段  备注：5
      only_segment: 1, //类型：Number  可有字段  备注：仅返回航程信息：1
      only_cabin: 1, //类型：Number  可有字段  备注：仅返回仓位信息：1
    };
    this.$axios.post("/api/inland/air", data);
  }

  render() {
    return <div></div>;
  }
}
