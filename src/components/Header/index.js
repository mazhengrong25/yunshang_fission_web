/*
 * @Description: 导航栏
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:43:50
 * @LastEditTime: 2021-02-06 11:51:24
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import { Menu, Dropdown, Badge, Modal, Input, Button } from "antd";
import {
  DownOutlined,
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";

import "./header.scss";

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      badgeNumber: 5, // 订单列表角标

      loginStatus: false, // 账号登录状态

      account: "",
      password: "",

      loginBox: false, // 登录窗口

      userName: localStorage.getItem("userName") || "",
    };
  }

  componentDidMount() {
    this.setState({
      loginStatus: localStorage.getItem("token"),
    });
  }

  // 账号登录
  loginBtn() {
    let data = {
      login_name: this.state.account,
      password: this.state.password,
    };
    this.$axios.post("/api/login", data).then((res) => {
      if (res.errorcode === 10000) {
        let token = `${res.data.token_type} ${res.data.access_token}`;
        localStorage.setItem("token", token);

        let date = this.$moment().add(res.data.expires_in,'ms').format('x')

        localStorage.setItem("loginDate",date)
        this.setState({
          loginBox: false,
        });
        this.getUserInfo();
      }
    });
  }

  // 获取用户信息
  getUserInfo() {
    this.$axios.post("/api/me").then((res) => {
      localStorage.setItem("userName", res.company_name);
      this.setState({
        userName: res.company_name,
        loginStatus: true
      });
    });
  }

  // 账号登出
  exitLogin() {
    this.$axios.post("/api/logout").then((res) => {
      localStorage.clear();
      this.setState({
        userName: '',
        loginStatus: false
      })
    });
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
              {this.state.loginStatus ? (
                <div className="header__nav__main__box__userInfo">
                  <Dropdown
                    trigger={["click"]}
                    overlay={() => (
                      <Menu>
                        <Menu.Item>个人中心</Menu.Item>
                        <Menu.Item>钱包</Menu.Item>
                        <Menu.Item onClick={() => this.exitLogin()}>登出账号</Menu.Item>
                      </Menu>
                    )}
                  >
                    <div
                      className="header__nav__main__box__userInfo__userBtn"
                      onClick={(e) => e.preventDefault()}
                    >
                      {this.state.userName || "用户名错误"}
                      <DownOutlined style={{ marginLeft: "10px" }} />
                    </div>
                  </Dropdown>
                </div>
              ) : (
                <div className="header__nav__main__box__item" onClick={() => this.setState({loginBox: true})}>登录系统</div>
              )}
            </div>
          </div>
        </div>

        <Modal
          title="账号登录"
          visible={this.state.loginBox}
          footer={null}
          onCancel={() => this.setState({ loginBox: false })}
        >
          <div className="header__loginBox">
            <div className="header__loginBox__inputBox">
              <Input
                size="large"
                value={this.state.account}
                placeholder="请输入账号"
                onChange={(e) => this.setState({ account: e.target.value })}
                prefix={<UserOutlined />}
              />
            </div>
            <div className="header__loginBox__inputBox">
              <Input.Password
                size="large"
                value={this.state.password}
                placeholder="请输入密码"
                iconRender={(visible) =>
                  visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                }
                onChange={(e) => this.setState({ password: e.target.value })}
                prefix={<LockOutlined />}
              />
            </div>

            <Button type="primary" onClick={() => this.loginBtn()}>
              登录
            </Button>
          </div>
        </Modal>
      </div>
    );
  }
}
