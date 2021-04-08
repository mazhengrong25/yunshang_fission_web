/*
 * @Description: 个人中心---个人信息
 * @Author: mzr
 * @Date: 2021-03-02 17:40:39
 * @LastEditTime: 2021-04-07 10:39:44
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import { Button, Modal, Form, Input, message } from "antd";

import "./personInfo.scss";

import personImage from "../../../static/accont_background.png";
import personIcon from "../../../static/person.png";

export default class index extends Component {
  formRef = React.createRef();

  constructor(props) {
    super(props);
    this.state = {
      personInfo: {}, // 个人信息
      walletInfo: {}, // 钱包信息

      newPass: "", //新密码

      showModal: false, //修改密码弹出
      showAvatar: false, //上传头像弹出
    };
  }

  async componentDidMount() {
    await this.getDistributor();
    await this.getWalletInfo();
  }

  // 获取分销商信息
  async getDistributor() {
    let data = {};
    await this.$axios.post("/api/me", data).then((res) => {
      this.setState({
        personInfo: res,
      });
    });
  }

  // 获取钱包信息
  async getWalletInfo() {
    let data = {
      dis_id: this.state.personInfo.dis_id,
    };
    await this.$axios.post("/api/wallet/get_msg", data).then((res) => {
      if (res.errorcode === 10000) {
        this.setState({
          walletInfo: res.data,
        });
      }
    });
  }

  // 修改账号密码
  messageSubmit() {
    console.log("提交");
    let data = {
      account_id: 2, //类型：Number  必有字段  备注：账号id
      password: this.state.newPass, //类型：String  必有字段  备注：密码   原密码：ys123456
    };
    this.$axios.post("/api/user/editPwd", data).then((res) => {
      if (res.errorcode === 10000) {
        message.success(res.msg);
        this.setState({
          showModal: false,
        });
      } else {
        message.error(res.data);
      }
    });
  }

  // 修改密码 修改钱包密码弹出
  openMessageModal() {
    this.setState({
      showModal: true,
    });
  }

  // 上传头像弹窗弹出
  uploadAvatar() {
    this.setState({
      showAvatar: true,
    });
  }

  // 修改密码重置
  onReset = () => {
    this.formRef.current.resetFields();
  };

  // 提交表单数据验证成功
  onFinish = (values) => {
    console.log("验证", values);
    let newData = values.newPassword;
    this.setState({
      newPass: newData,
    });

    if (newData) {
      this.messageSubmit();
    }

    console.log(this.state.newPass);
  };

  render() {
    return (
      <div className="personInfo">
        <div className="content_div">
          <div className="div_title">个人信息</div>
          <div className="top_content">
            <div className="item_avatar">
              <div className="default_img">
                <img src={personIcon} alt="default" />
              </div>
              {/* <div className="default_title" onClick={() => this.uploadAvatar()}>
                上传头像
              </div> */}
            </div>

            <div className="action_div">
              <div className="action_title">{this.state.personInfo.department_name}</div>
              <div className="action_time">
                登录时间：{this.state.personInfo.login_date}
              </div>
              <div className="action_button">
                <div className="button_item">
                  <Button onClick={() => this.openMessageModal()}>修改密码</Button>
                </div>
                {/* <div className="button_item_other">
                  <Button>修改钱包密码</Button>
                </div> */}
              </div>
            </div>
            <div className="top_img">
              <img src={personImage} alt="个人信息logo" />
            </div>
          </div>
        </div>
        <div className="content_recharge">
          <div className="wallt_quota">
            <div className="quota_item">
              <div className="quota_number">
                <span>&yen;</span>
                {this.state.walletInfo.storage_money || "0.00"}
              </div>
              <div className="quota_title">钱包余额</div>
            </div>
            <div className="wallt_space"></div>
            <div className="quota_item">
              <div className="quota_number">
                <span>&yen;</span>
                {this.state.walletInfo.dis_consume_credit || "0.00"}
              </div>
              <div className="quota_title">授信额度</div>
            </div>
            <div className="wallt_space"></div>
            <div className="quota_item">
              <div className="quota_number">
                <span>&yen;</span>
                {this.state.walletInfo.msg_money || "0.00"}
                {/* 993.8 四舍五入 => 向下取整  */}
                <p>
                  (
                  {Math.floor(
                    Number(this.state.walletInfo.msg_money) /
                      Number(this.state.walletInfo.msg_price)
                  )}
                  条)
                </p>
              </div>
              <div className="quota_title">短信余额</div>
            </div>
            <div className="wallt_space"></div>
            <div className="quota_item">
              <div className="quota_number">
                {this.state.walletInfo.ibe_search || 0}
                <p>条</p>
              </div>
              <div className="quota_title">国内IBE流量</div>
            </div>
            <div className="wallt_space"></div>
            <div className="quota_item">
              <div className="quota_number">
                0
                <p>条</p>
              </div>
              <div className="quota_title">国际IBE流量</div>
            </div>
          </div>
          <div className="recharge_button">
            <Button type="primary">充值</Button>
          </div>
        </div>
        <div className="content_account">
          <div className="account_title">
            账号信息
            {/* <Button type="link">修改换票单填开单位</Button>   */}
          </div>
          <div className="account_item">
            <div className="div_space">
              <div className="item_content">
                <div className="content_title">分销商</div>
                <div className="content_input">
                  {this.state.personInfo.department_name}
                </div>
              </div>
              <div className="item_content">
                <div className="content_title">登录名</div>
                <div className="content_input">{this.state.personInfo.login_name}</div>
              </div>
              <div className="item_content">
                <div className="content_title">密码</div>
                <div className="content_input">******</div>
              </div>
              <div className="item_content">
                <div className="content_title">联系人</div>
                <div className="content_input">{this.state.personInfo.contact}</div>
              </div>
              <div className="item_content">
                <div className="content_title">联系电话</div>
                <div className="content_input">{this.state.personInfo.phone}</div>
              </div>
            </div>
            <div className="div_space">
              <div className="item_content">
                <div className="content_title">账号等级</div>
                <div className="content_input">
                  {this.state.personInfo.is_master === 1 ? "主账号" : "子账号"}
                </div>
              </div>
              <div className="item_content">
                <div className="content_title">账号情况</div>
                <div className="content_input">
                  {this.state.personInfo.status === 1 ? "正常" : "异常"}
                </div>
              </div>
              <div className="item_content">
                <div className="content_title">登陆IP</div>
                <div className="content_input">{this.state.personInfo.ip}</div>
              </div>
            </div>
          </div>
        </div>
        {/* 修改密码弹窗 */}
        <Modal
          width={400}
          title="修改密码"
          footer={null}
          centered
          visible={this.state.showModal}
          onCancel={() =>
            this.setState({
              showModal: false,
            })
          }
        >
          <div className="edit_message">
            <Form ref={this.formRef} onFinish={this.onFinish}>
              <Form.Item
                label="旧密码"
                name="oldPassword"
                rules={[{ required: true, message: "请输入旧密码" }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                label="新密码"
                name="newPassword"
                rules={[{ required: true, message: "请输入新密码" }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item
                label="确认新密码"
                name="confirm"
                rules={[{ required: true, message: "再次确认新密码" }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item>
                <div className="edit_button">
                  <Button htmlType="submit">确定</Button>
                  <Button type="primary" onClick={this.onReset}>
                    重置
                  </Button>
                </div>
              </Form.Item>
            </Form>
          </div>
        </Modal>
        {/* <div className="avatar_modal">
                    <Modal 
                        title="上传头像"
                        width={520}
                        visible={this.state.showAvatar}
                        onCancel={() => this.setState({
                            showAvatar: false
                        })}
                        footer={[
                            <Button key="back" onClick={this.handleCancel}>取消</Button>,
                            <Button key="submit" type="primary" onClick={this.handleOk}>保存</Button>,
                        ]}
                    >
                        
                    </Modal>
                </div>               */}
      </div>
    );
  }
}
