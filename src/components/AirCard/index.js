/*
 * @Description: 航班列表卡片
 * @Author: wish.WuJunLong
 * @Date: 2021-04-14 15:38:38
 * @LastEditTime: 2021-04-14 16:45:12
 * @LastEditors: wish.WuJunLong
 */

import React, { Component } from "react";

import {Button} from "antd"

import AirIcon from "../../static/flight_fly.png";  // 航班图标

import AircraftTypePopover from "../AircraftTypePopover"; // 航班信息 机型信息组件

import "./AirCard.scss";

export default class index extends Component {

  // 获取舱位信息
  searchCabinBox(val){
    this.props.openCabinBox(val);
  }


  render() {
    return (
      <div className="list_card">
        <div className="card_air">
          <img
            className="air_icon"
            src={`${this.$url}` + this.props.airMessage.segments[0].image}
            alt="航班logo"
          />

          <div className="air_message">
            <div className="air_name">
              {this.props.airMessage.segments[0].airline_info.airline.replace(/航空.*/, "航空")}
            </div>

            <AircraftTypePopover
              aircraftTypeData={this.props.airMessage.segments[0]}
            ></AircraftTypePopover>
            {this.props.airMessage.segments[0].hasMeal ? <div className="air_meals"></div> : ""}
          </div>
        </div>

        <div className="flight_message">
          <div className="message_info">
            <div className="time">
              {this.$moment(this.props.airMessage.segments[0].depTime).format("HH:mm")}
            </div>
            <div className="address">
              {this.props.airMessage.segments[0].depAirport_CN.city_name}
              {this.props.airMessage.segments[0].depAirport_CN.air_port_name}
              {this.props.airMessage.segments[0].depTerminal}
            </div>
          </div>
          <div className="message_time">
            <div className="time_date">
              {Math.floor(this.props.airMessage.segments[0].duration / 60)}h
              {Math.floor(this.props.airMessage.segments[0].duration % 60)}m
            </div>
            <div className="time_icon">
              <img src={AirIcon} alt="航程图标"></img>
            </div>
          </div>
          <div className="message_info">
            <div className="time">
              {this.$moment(this.props.airMessage.segments[this.props.airMessage.segments.length - 1].arrTime).format(
                "HH:mm"
              )}
            </div>
            <div className="address">
              {this.props.airMessage.segments[this.props.airMessage.segments.length - 1].arrAirport_CN.city_name}
              {this.props.airMessage.segments[this.props.airMessage.segments.length - 1].arrAirport_CN.air_port_name}
              {this.props.airMessage.segments[this.props.airMessage.segments.length - 1].arrTerminal}
            </div>
          </div>
        </div>

        {this.props.airMessage.available_cabin > 0 ? (
          <>
            <div className="flight_account">
              <p>&yen;</p>
              <div>{this.props.airMessage.min_price}</div>
              <span>起</span>
            </div>
            <Button
              className="cabin_switch"
              onClick={() => this.searchCabinBox(this.props.airMessage.segments_key)}
              loading={
                this.props.airMessage.segments_key === this.props.segmentsKey &&
                this.props.cabinListLength < 1
              }
            >
              {this.props.segmentsKey === this.props.airMessage.segments_key &&
              this.props.cabinListLength > 1
                ? "收起"
                : this.props.segmentsKey === this.props.airMessage.segments_key &&
                  this.props.cabinListLength < 1
                ? "加载中"
                : "展开"}
            </Button>
          </>
        ) : (
          <div className="not_cabin">售罄</div>
        )}
      </div>
    );
  }
}
