/*
 * @Description: 机票列表
 * @Author: wish.WuJunLong
 * @Date: 2021-02-05 18:31:03
 * @LastEditTime: 2021-02-09 09:47:50
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import { Button, Radio, Input, Select } from "antd";

import "./flightList.scss";

const { Option } = Select;
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      urlData: {},
      flightList: [],
    };
  }
  async componentDidMount() {
    await this.setState({
      urlData: React.$filterUrlParams(decodeURI(this.props.location.search)),
    });

    await this.getFlightList();
  }

  // 获取航班列表
  async getFlightList() {
    let data = {
      departure: this.state.urlData.start, //类型：String  必有字段  备注：起飞机场
      arrival: this.state.urlData.end, //类型：String  必有字段  备注：到达机场
      departureTime: this.state.urlData.date, //类型：String  必有字段  备注：起飞日期
      page: 1, //类型：Number  可有字段  备注：1
      per_page: 1, //类型：Number  可有字段  备注：5
      only_segment: 1, //类型：Number  可有字段  备注：仅返回航程信息：1
      only_cabin: 1, //类型：Number  可有字段  备注：仅返回仓位信息：1
    };
    await this.$axios.post("/api/inland/air", data).then((res) => {
      if (res.errorcode === 10000) {
        this.setState({
          flightList: res.data.IBE.list,
        });
      }
    });

    // await console.log(
    //   this.state.flightList[0].first_cabin.routing.segments[0].depAirport_CN.city_name
    // );
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
              <Button type="primary">搜索航班</Button>
            </div>
          </div>
        </div>

        <div className="flight_content">
          <div className="flight_search">
            <div className="header_title">航班筛选</div>

            <div className="search_list">
              <div className="list_title">起飞时段</div>
            </div>
          </div>
          <div className="flight_main">
            <div className="main_header">
              <div className="flight_number">共{this.state.flightList.length}条航班</div>

              <div className="flight_sort">
                <Select placeholder="排序" allowClear>
                  <Option value="price">价格高低</Option>
                  <Option value="time">时间早晚</Option>
                </Select>
              </div>
            </div>
            <div className="main_list">
              {this.state.flightList.length > 0 &&
                this.state.flightList.map((item) => (
                  <div className="list_card" key={item.segments_key}>
                    <div className="card_air">
                      <img className="air_icon" src={``} />

                      <div className="air_message">
                        <div className="air_name">澳门航空</div>
                        <div className="air_number">PN6229 机型 320</div>
                        <div className="air_meals"></div>
                      </div>
                    </div>

                    <div className="flight_message">
                      <div className="message_info">
                        <div className="time">11:00</div>
                        <div className="address">重庆江北机场T3</div>
                      </div>
                      <div className="message_time">
                        <div className="time_date">2h30m</div>
                        <div className="time_icon"></div>
                      </div>
                      <div className="message_info">
                        <div className="time">11:00</div>
                        <div className="address">重庆江北机场T3</div>
                      </div>
                    </div>

                    <div className="flight_account">
                      <p>&yen;</p>
                      <div>370</div>
                      <span>起</span>
                    </div>


                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}
