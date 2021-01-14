/*
 * @Description: 导航栏
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:43:50
 * @LastEditTime: 2021-01-12 11:38:49
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import { Menu, Dropdown, Badge } from "antd";
import { DownOutlined } from "@ant-design/icons";

import "./header.scss";

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      badgeNumber: 5,
    };
  }
  render() {
    return (
      <div className="header">
        <div className="header__top">
          <div className="header__top__message">
            <div className="header__top__message__left">下午好，云上航空科技</div>
            <div className="header__top__message__right">023-6865-1111</div>
          </div>
        </div>
        <div className="header__nav">
          <div className="header__nav__main">
            <div className="header__nav__main__logo"></div>
            <div className="header__nav__main__box">
              <div className="header__nav__main__box__item active">首页</div>
              <div className="header__nav__main__box__item">
                <Badge count={this.state.badgeNumber} offset={[5, -3]}>
                  我的订单
                </Badge>
              </div>
              <div className="header__nav__main__box__userInfo">
                <Dropdown
                  trigger={["click"]}
                  overlay={() => (
                    <Menu>
                      <Menu.Item>个人中心</Menu.Item>
                      <Menu.Item>钱包</Menu.Item>
                    </Menu>
                  )}
                >
                  <div
                    className="header__nav__main__box__userInfo__userBtn"
                    onClick={(e) => e.preventDefault()}
                  >
                    测试账号
                    <DownOutlined style={{ marginLeft: "10px" }} />
                  </div>
                </Dropdown>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
