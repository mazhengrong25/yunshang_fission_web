/*
 * @Description: 导航栏
 * @Author: wish.WuJunLong
 * @Date: 2021-01-11 15:43:50
 * @LastEditTime: 2021-04-09 14:17:35
 * @LastEditors: wish.WuJunLong
 * @LastEditTime: 2021-02-06 11:51:24
 * @LastEditors: wish.WuJunLong
 */
import React from "react";

import { withRouter } from "react-router-dom";

import { Menu, Dropdown, Modal, Input, Button, message } from "antd";
import {
  DownOutlined,
  UserOutlined,
  LockOutlined,
  EyeInvisibleOutlined,
  EyeTwoTone,
} from "@ant-design/icons";

import "./header.scss";

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      badgeNumber: 5, // 订单列表角标

      loginStatus: false, // 账号登录状态

      account: "ys_inland_test",
      password: "ys123456",

      loginBox: false, // 登录窗口

      userName: localStorage.getItem("userName") || "",

      activeUrl: "/",
    };
  }

  componentDidMount() {
    if (!localStorage.getItem("token")) {
      this.setState({
        loginBox: true,
      });
      this.props.history.push("/");
    }

    this.setState({
      activeUrl: this.props.history.location.pathname || "/",
      loginStatus: localStorage.getItem("token"),
    });
  }

  componentWillReceiveProps(nextProps, nextState) {
    // 路由发生变化时判断本地token是否失效
    if (
      this.props.location.pathname !== nextProps.location.pathname &&
      !localStorage.getItem("token")
    ) {
      this.setState({
        loginBox: true,
      });
      this.props.history.push("/");
    }

    if( this.props.location.pathname !== nextProps.location.pathname){
      sessionStorage.removeItem('activePassengerList')
    }

    // console.log(this.props.location.pathname)
    // // 脱离订单页时清空订单列表页筛选状态
    // if (
    //   sessionStorage.getItem("orderList") &&
    //   (this.props.location.pathname.indexOf("order") !== -1 ||
    //     this.props.location.pathname.indexOf("Detail") !== -1)
    // ) {
    //   sessionStorage.removeItem("orderList");
    // }
  }

  // 账号登录
  async loginBtn() {
    let data = {
      login_name: this.state.account,
      password: this.state.password,
    };
    await this.$axios.post("/api/login", data).then((res) => {
      console.log(res);
      if (res.errorcode === 10000) {
        let token = `${res.data.token_type} ${res.data.access_token}`;
        localStorage.setItem("token", token);

        let date = this.$moment().add(res.data.expires_in, "ms").format("x");

        localStorage.setItem("loginDate", date);
        this.setState({
          loginBox: false,
        });
        this.getUserInfo();
      } else {
        this.setState({
          loginBox: true,
        });
        message.warning(res.msg);
        this.props.history.push("/");
      }
    });
  }

  // 获取用户信息
  getUserInfo() {
    this.$axios.post("/api/me").then((res) => {
      localStorage.setItem("userName", res.company_name);
      this.setState({
        userName: res.company_name,
        loginStatus: true,
      });
      window.location.reload();
    });
  }

  // 账号登出
  exitLogin() {
    this.$axios.post("/api/logout").then((res) => {
      localStorage.clear();
      this.setState({
        userName: "",
        loginStatus: false,
        loginBox: true,
      });
      // this.props.history.push("/");
    });
  }

  // 地址跳转
  jumpUrl(val) {
    this.props.history.push(val);
    this.setState({
      activeUrl: val,
    });
  }

  render() {
    return (
      <div className="header">
        <div className="header__top">
          <div className="header__top__message">
            <div className="header__top__message__left">
              {this.$moment().format("A")}好，云上航空科技
            </div>
            <div className="header__top__message__right">023-6865-1111</div>
          </div>
        </div>
        <div className="header__nav">
          <div className="header__nav__main">
            <div
              className="header__nav__main__logo"
              onClick={() => this.jumpUrl("/home")}
            ></div>
            <div className="header__nav__main__box">
              <div
                className={[
                  this.state.activeUrl === "/" || this.state.activeUrl === "/home"
                    ? "header__nav__main__box__item active"
                    : "header__nav__main__box__item",
                ]}
                onClick={() => this.jumpUrl("/home")}
              >
                首页
              </div>
              <div
                className={[
                  this.state.activeUrl.indexOf("/orderList") !== -1
                    ? "header__nav__main__box__item active"
                    : "header__nav__main__box__item",
                ]}
                onClick={() => this.jumpUrl("/orderList?type=inland_ticket")}
              >
                {/* <Badge count={this.state.badgeNumber} offset={[5, -3]}> */}
                我的订单
                {/* </Badge> */}
              </div>
              {this.state.loginStatus ? (
                <div className="header__nav__main__box__userInfo">
                  <Dropdown
                    trigger={["click"]}
                    overlay={() => (
                      <Menu>
                        <Menu.Item
                          onClick={() => this.jumpUrl("/accountCenter?type=perInfo")}
                        >
                          个人中心
                        </Menu.Item>
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
                <div
                  className="header__nav__main__box__item"
                  onClick={() => this.setState({ loginBox: true })}
                >
                  登录系统
                </div>
              )}
            </div>
          </div>
        </div>

        <Modal
          title="账号登录"
          visible={this.state.loginBox}
          footer={null}
          centered={true}
          maskClosable={false}
          keyboard={false}
          closable={false}
          width="460px"
          onCancel={() => this.setState({ loginBox: false })}
        >
          <div className="header__loginBox">
            <div className="header__loginBox__inputBox">
              <Input
                size="large"
                value={this.state.account}
                placeholder="请输入账号"
                onChange={(e) => this.setState({ account: e.target.value })}
                onPressEnter={() => this.loginBtn()}
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
                onPressEnter={() => this.loginBtn()}
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

export default withRouter(Index);
