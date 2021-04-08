/*
 * @Description:  航班信息 机型信息 popover弹窗
 * @Author: wish.WuJunLong
 * @Date: 2021-04-06 16:08:36
 * @LastEditTime: 2021-04-06 17:02:19
 * @LastEditors: wish.WuJunLong
 */

import React, { Component } from "react";
import { Popover } from "antd";

import "./AircraftTypePopover.scss";

export default class index extends Component {
  render() {
    return (
      <Popover
        placement="bottomLeft"
        color="#fff"
        overlayClassName="air_popover"
        content={() => (
          <div className="air_info">
            <div className="info_title">
              <img
                className="title_icon"
                src={`${this.$url}` + this.props.aircraftTypeData.image}
                alt="航班logo"
              />
              {(this.props.aircraftTypeData.airline_info &&
                this.props.aircraftTypeData.airline_info.airline.replace(
                  /航空.*/,
                  "航空"
                )) ||
                this.props.aircraftTypeData.airline_CN +
                  (this.props.aircraftTypeData.flightNumber ||
                    this.props.aircraftTypeData.flight_no)}
            </div>
            <div className="info_main">
              <div className="info_main_list">
                <div className="info_main_list_title">机型</div>
                <div className="info_main_list_message">
                  {this.props.aircraftTypeData.aircraftCode ||
                    this.props.aircraftTypeData.model}
                </div>
              </div>

              <div className="info_main_list">
                <div className="info_main_list_title">机型代码</div>
                <div className="info_main_list_message">
                  {this.props.aircraftTypeData.aircraft_code ||
                    this.props.aircraftTypeData.model}
                </div>
              </div>

              <div className="info_main_list">
                <div className="info_main_list_title">经停次数</div>
                <div className="info_main_list_message">
                  {this.props.aircraftTypeData.stopCount > 0
                    ? `${this.props.aircraftTypeData.stopCount} 次`
                    : "直达"}
                </div>
              </div>

              <div className="info_main_list">
                <div className="info_main_list_title">飞行时长</div>
                <div className="info_main_list_message">
                  {this.props.dateStatus ? (
                    <>
                      {Math.floor(this.props.aircraftTypeData.duration / 60 / 60)}小时
                      {Math.floor((this.props.aircraftTypeData.duration / 60) % 60)}分钟
                    </>
                  ) : (
                    <>
                      {Math.floor(this.props.aircraftTypeData.duration / 60)}小时
                      {Math.floor(this.props.aircraftTypeData.duration % 60)}分钟
                    </>
                  )}
                </div>
              </div>

              <div className="info_main_list">
                <div className="info_main_list_title">是否有餐食</div>
                <div className="info_main_list_message">
                  {this.props.aircraftTypeData.hasMeal ? "有" : "无"}
                </div>
              </div>

              <div className="info_main_list">
                <div className="info_main_list_title">餐食等级</div>
                <div className="info_main_list_message">
                  {this.props.aircraftTypeData.MealCode || "无"}
                </div>
              </div>
            </div>

            <div className="info_bottom">机型仅供参考，具体请以实际执行航班为准</div>
          </div>
        )}
      >
        <div className="air_number">
          {this.props.aircraftTypeData.flightNumber ||
            this.props.aircraftTypeData.flight_no}{" "}
          机型{" "}
          {this.props.aircraftTypeData.aircraftCode || this.props.aircraftTypeData.model}
        </div>
      </Popover>
    );
  }
}
