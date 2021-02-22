/*
 * @Description: 机票预订页面
 * @Author: wish.WuJunLong
 * @Date: 2021-02-19 13:54:59
 * @LastEditTime: 2021-02-20 16:18:12
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import { Modal, Tag, Button, DatePicker, Input } from "antd";

import "./flightScheduled.scss";
import AddPassengerIcon from "../../static/add_passenger_icon.png"; // 添加乘机人图标
import PassengerAvatar from "../../static/passenger_avatar.png"; // 乘机人头像

const { CheckableTag } = Tag;

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reserveMessage: {}, // 航班信息
      contactList: [], // 乘客列表

      selectContactList: [], // 选中乘客列表
    };
  }

  async componentDidMount() {
    let key = React.$filterUrlParams(decodeURI(this.props.location.search)).key;
    // await this.getReserveData(key);
    await this.getContactList();
  }

  // 获取航班预定信息
  getReserveData(key) {
    let data = {
      keys: [key],
    };
    this.$axios.post("/api/entryReserve", data).then((res) => {
      if (res.errorcode === 10000) {
        this.setState({
          reserveMessage: res.data[key],
        });
      } else {
        let secondsToGo = 5;

        const modal = Modal.warning({
          title: res.msg,
          content: `将在 ${secondsToGo} 秒后返回航班列表，您也可以点击确定按钮手动返回。`,
          okText: "确定",
          onOk: () => {
            clearInterval(timer);
            Modal.destroyAll();
            this.props.history.goBack();
          },
        });

        const timer = setInterval(() => {
          secondsToGo -= 1;
          modal.update({
            content: `将在 ${secondsToGo} 秒后返回航班列表，您也可以点击确定按钮手动返回。`,
          });
        }, 1000);

        setTimeout(() => {
          clearInterval(timer);
          Modal.destroyAll();
          this.props.history.goBack();
        }, secondsToGo * 1001);
      }
    });
  }

  // 获取旅客列表
  getContactList() {
    let data = {
      except_cert_no: "", //类型：String  必有字段  备注：需要排除的证件号多个，号隔开
      group_id: "", //类型：Number  必有字段  备注：分组id
      page: 1, //类型：String  可有字段  备注：页数
      // name: "", //类型：String  可有字段  备注：姓名模糊查询
    };

    this.$axios.post("/api/passenger/index", data).then((res) => {
      if (res.errorcode === 10000) {
        this.setState({
          contactList: res.data.data,
        });
      } else {
      }
    });
  }

  // 选择常用联系人
  checkedContact(tag, checked) {
    const { selectContactList } = this.state;
    const nextSelectedTags = checked
      ? [...selectContactList, tag]
      : selectContactList.filter((t) => t.id !== tag.id);
    console.log(nextSelectedTags);
    this.setState({ selectContactList: nextSelectedTags });
  }

  render() {
    return (
      <div className="flight_scheduled">
        <div className="scheduled_main">
          {/* 常用联系人版块 */}
          <div className="template_main common_contact">
            <div className="main_title">
              <p>常用联系人</p>
              <Button className="add_passenger" type="primary" ghost>
                <img src={AddPassengerIcon} alt="添加乘机人图标" />
                添加乘机人
              </Button>
            </div>

            <div className="contact_box">
              {this.state.contactList.map((item, index) => {
                if (index < 6 && item.name) {
                  return (
                    <CheckableTag
                      className="contact_checked"
                      key={index}
                      checked={this.state.selectContactList.indexOf(item) > -1}
                      onChange={(checked) => this.checkedContact(item, checked)}
                    >
                      {item.name}
                    </CheckableTag>
                  );
                } else {
                  return "";
                }
              })}
            </div>
          </div>

          {/* 乘机人列表 */}

          <div
            className="template_main passenger_list"
            style={{
              display: this.state.selectContactList.length > 0 ? "block" : "none",
            }}
          >
            {this.state.selectContactList.map((item, index) => (
              <div className="passenger_box" key={item.id}>
                <div className="main_title">
                  <p>乘机人{index + 1}</p>
                </div>

                <div className="box_list">
                  <div className="list_info">
                    <div className="info_name">
                      <div className="info_avatar">
                        <img src={PassengerAvatar} alt="乘机人头像" />
                      </div>
                      <p>{item.name}</p>
                      <span></span>
                    </div>

                    <div className="info_card">
                      <div className="info_title">证件：</div>
                      {item.cert_type}
                    </div>

                    <div className="info_idNumber">
                      <div className="info_title">证件号：</div>
                      {item.cert_no}
                    </div>
                  </div>

                  <div className="list_input">
                    <div className="input_box">
                      <div className="box_title">手机</div>

                      <Input placeholder="请输入手机号" value={item.phone} />
                    </div>

                    <div className="input_box">
                      <div className="box_title">出生日期</div>

                      <DatePicker
                        placeholder="请选择出生日期"
                        value={this.$moment(item.birthday)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 联系人列表 */}

          <div className="template_main contact_main">
            <div className="main_title">
              <p>联系人</p>
            </div>

            <div className="contact_box">
              <div className=""></div>
            </div>
          </div>
        </div>
        {/* 航班信息版块 */}
        <div className="scheduled_message"></div>
      </div>
    );
  }
}
