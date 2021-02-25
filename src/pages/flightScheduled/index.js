/*
 * @Description: 机票预订页面
 * @Author: wish.WuJunLong
 * @Date: 2021-02-19 13:54:59
 * @LastEditTime: 2021-02-25 16:05:24
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import { Modal, Tag, Button, DatePicker, Input, Select, Table, Pagination } from "antd";

import "./flightScheduled.scss";
import AddPassengerIcon from "../../static/add_passenger_icon.png"; // 添加乘机人图标
import PassengerAvatar from "../../static/passenger_avatar.png"; // 乘机人头像

const { CheckableTag } = Tag;
const { Option } = Select;
const { Column } = Table;

let defaultPassenger = {
  name: "", // 乘客姓名
  userType: 0, // 乘客类型
  phone: "", // 手机号
  cert_type: "身份证", // 证件类型
  cert_no: "", // 证件号
  birthday: "", // 出生日期
};

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      reserveMessage: {}, // 航班信息
      contactList: [], // 乘客列表
      selectedRowKeys: [], // 乘客列表选择
      saveSelectList: [], // 存储已选择乘客列表
      contactSearch: {
        // 联系人筛选及分页
        except_cert_no: "", //类型：String  必有字段  备注：需要排除的证件号多个，号隔开
        group_id: "", //类型：Number  必有字段  备注：分组id
        page: 1, //类型：String  可有字段  备注：页数
        limit: 5, // 条数
        total: 0, // 总条数
        name: "", //类型：String  可有字段  备注：姓名模糊查询
      },
      commonlyContact: [], // 常用联系人列表

      selectContactList: [defaultPassenger], // 选中乘客列表

      passengerActive: "contact", // 常用乘机人弹窗切换状态

      isPassengerModal: true, // 常用乘机人弹窗
    };
  }

  async componentDidMount() {
    // let key = React.$filterUrlParams(decodeURI(this.props.location.search)).key;
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
    let data = this.state.contactSearch;
    this.$axios.post("/api/passenger/index", data).then((res) => {
      if (res.errorcode === 10000) {
        if (this.state.commonlyContact.length < 1) {
          this.setState({
            commonlyContact: res.data.data,
          });
        }
        // 分页组装
        data.total = res.data.total;
        data.page = res.data.current_page;

        this.setState({
          contactList: res.data.data,
        });
      } else {
      }
    });
  }

  // 选择常用联系人
  checkedContact(tag, checked) {
    console.log(tag, checked);
    let passengerList = this.state.selectContactList; // 选中乘客列表
    let addPassenger = false; // 乘客状态控制器

    passengerList.forEach((item, index) => {
      if (checked && !item.name && !item.phone && !item.cert_no && !addPassenger) {
        passengerList[index] = tag;
        addPassenger = true;
      }
    });

    passengerList =
      checked && !addPassenger
        ? [...passengerList, tag]
        : !checked && !addPassenger && passengerList.length > 1
        ? passengerList.filter((t) => t.id !== tag.id)
        : !checked && !addPassenger && passengerList.length === 1
        ? (passengerList = [defaultPassenger])
        : passengerList;

    this.setState({
      selectContactList: passengerList,
    });
  }

  // 添加乘机人按钮
  addPassengerList() {
    let newList = this.state.selectContactList;
    newList.push(defaultPassenger);
    this.setState({ selectContactList: newList });
  }

  // 删除乘机人按钮
  removePassenger(val, index) {
    let newList = this.state.selectContactList;
    if (index === 0 && newList.length <= 1) {
      newList[index] = defaultPassenger;
      return this.setState({ selectContactList: newList });
    }

    newList.splice(
      newList.findIndex((item) => item === val),
      1
    );
    this.setState({ selectContactList: newList });
  }

  // 编辑乘机人  输入框
  editPassenger = (name, index, val) => {
    let newData = this.state.selectContactList;
    newData[index][name] = val.target.value;

    this.setState({ selectContactList: newData });
  };
  // 编辑乘机人 选择器
  editPassengerSelect = (name, index, val) => {
    let newData = this.state.selectContactList;
    newData[index][name] = val;

    this.setState({ selectContactList: newData });
  };

  // 编辑乘机人 时间选择器
  editPassengerDate = (name, index, val, stringVal) => {
    let newData = this.state.selectContactList;
    newData[index][name] = stringVal;

    this.setState({ selectContactList: newData });
  };

  // 打开常用联系人弹窗
  openPassengerModal() {
    let checkedPassengerModal = this.state.selectedRowKeys;
    this.state.selectContactList.forEach((item) => {
      checkedPassengerModal.push(JSON.stringify(item));
    });
    this.setState({
      passengerActive: "contact",
      isPassengerModal: true,
      selectedRowKeys: [...checkedPassengerModal],
    });
  }

  // 关闭联系人弹窗
  closePassengerModal() {
    this.setState({ isPassengerModal: false, selectedRowKeys: [] });
  }

  // 表格多选
  onSelectChange = (keys, rows) => {
    console.log(keys, rows);

    // console.log(selectList, saveList);
    this.setState({ selectedRowKeys: keys });
  };

  // 联系人分页器
  async changeContactPage(page, pageSize) {
    let data = this.state.contactSearch;
    data.page = page;

    await this.setState({
      contactSearch: data,
    });
    await this.getContactList();
  }

  // 联系人表格多选提交
  submitPassengerModal() {
    let selectPassenger = this.state.selectedRowKeys;
    let activePassenger = this.state.selectContactList;
    activePassenger = [];
    selectPassenger.forEach((item) => {
      activePassenger.push(JSON.parse(item));
    });

    console.log(activePassenger);
    if (activePassenger.length < 1) {
      activePassenger = [defaultPassenger];
    }

    this.setState({
      selectContactList: [...activePassenger],
      isPassengerModal: false,
      selectedRowKeys: [],
    });
  }

  render() {
    const { selectedRowKeys } = this.state;

    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };

    return (
      <div className="flight_scheduled">
        <div className="scheduled_main">
          {/* 常用联系人版块 */}
          <div className="template_main common_contact">
            <div className="main_title">
              <p>常用联系人</p>
              <Button
                className="add_passenger"
                type="primary"
                ghost
                onClick={() => this.openPassengerModal()}
              >
                常用通讯录
              </Button>
            </div>

            <div className="contact_box">
              {this.state.commonlyContact.map((item, index) => {
                if (index < 6) {
                  return (
                    <CheckableTag
                      className="contact_checked"
                      key={index}
                      checked={this.state.selectContactList.indexOf(item) > -1}
                      onChange={(checked) => this.checkedContact(item, checked)}
                    >
                      {item.name
                        ? item.name
                        : `${item.en_last_name} ${item.en_first_name}`}
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
              <div className="passenger_box" key={index}>
                <div className="main_title">
                  <p>乘机人{index + 1}</p>

                  {index === 0 ? (
                    ""
                  ) : (
                    <div
                      className="remove_passenger"
                      onClick={() => this.removePassenger(item, index)}
                    ></div>
                  )}
                </div>

                <div className="box_list">
                  <div className="list_info">
                    <div className="info_avatar">
                      <img src={PassengerAvatar} alt="乘机人头像" />
                    </div>

                    <div className="info_left">
                      <div className="info_title">姓名</div>
                      <div className="info_input" style={{ marginRight: 8 }}>
                        <Input
                          placeholder="姓名"
                          value={item.name}
                          onChange={this.editPassenger.bind(this, "name", index)}
                        />
                      </div>
                      <div className="info_select">
                        <Select
                          value={item.userType}
                          onChange={this.editPassengerSelect.bind(
                            this,
                            "userType",
                            index
                          )}
                        >
                          <Option value={0}>成人</Option>
                          <Option value={1}>儿童</Option>
                          <Option value={1}>婴儿</Option>
                        </Select>
                      </div>
                    </div>

                    <div className="info_right">
                      <div className="info_title">手机号</div>
                      <div className="info_input">
                        <Input
                          placeholder="手机号"
                          value={item.phone}
                          onChange={this.editPassenger.bind(this, "phone", index)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="list_info">
                    <div className="info_avatar not_avatar"></div>

                    <div className="info_left">
                      <div className="info_title">证件</div>
                      <div className="info_select" style={{ marginRight: 8 }}>
                        <Select
                          value={item.cert_type}
                          onChange={this.editPassengerSelect.bind(
                            this,
                            "cert_type",
                            index
                          )}
                        >
                          <Option value="身份证">身份证</Option>
                          <Option value="护照">护照</Option>
                          <Option value="其他证件">其他证件</Option>
                        </Select>
                      </div>
                      <div className="info_input">
                        <Input
                          placeholder="证件号"
                          value={item.cert_no}
                          onChange={this.editPassenger.bind(this, "cert_no", index)}
                        />
                      </div>
                    </div>

                    <div className="info_right">
                      <div className="info_title">出生日期</div>
                      <div className="info_input">
                        <DatePicker
                          allowClear={false}
                          showToday={false}
                          placeholder="出生日期"
                          value={item.birthday ? this.$moment(item.birthday) : ""}
                          onChange={this.editPassengerDate.bind(this, "birthday", index)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="passenger_tool">
              <Button
                className="add_passenger"
                type="primary"
                ghost
                onClick={() => this.addPassengerList()}
              >
                <img src={AddPassengerIcon} alt="添加乘机人图标" />
                添加乘机人
              </Button>
            </div>
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
        <div className="scheduled_message">
          <div className="message_box">
            <div className="box_title">航班信息</div>
            <div className="flight_info">
              <div className="info_title">
                <div className="info_type"></div>
                <div className="info_time"></div>
                <div className="info_address"></div>
              </div>

              <div className="info_content">
                <div className="content_address">
                  <div></div>
                  <p></p>
                </div>

                {/* <img url={} alt="航班飞行图标" /> */}

                <div className="content_address">
                  <div></div>
                  <p></p>
                </div>
              </div>

              <div className="info_message">
                <div className="message_air">
                  {/* <img url={} alt="航司图标" /> */}
                  <div className="air_name"></div>
                  <div className="air_info"></div>
                  <div className="air_cabin"></div>
                  <div className="air_status"></div>
                </div>

                <div className="air_fly">
                  <div className=" "></div>
                </div>
              </div>
            </div>
          </div>

          <div className="message_box">
            <div className="box_title">价格明细</div>
            <div className="price_message"></div>
          </div>
        </div>

        <Modal
          title="乘机人弹窗"
          getContainer={false}
          className="passenger_modal"
          visible={this.state.isPassengerModal}
          footer={false}
          maskClosable={false}
          onCancel={() => this.closePassengerModal()}
          width={800}
        >
          <div className="passenger_title">
            <div
              className={
                this.state.passengerActive === "contact" ? "title active" : "title"
              }
              onClick={() => this.setState({ passengerActive: "contact" })}
            >
              常用人员
            </div>
            <div
              className={this.state.passengerActive === "add" ? "title active" : "title"}
              onClick={() => this.setState({ passengerActive: "add" })}
            >
              新增人员
            </div>
          </div>
          <div className="passenger_box">
            {/* 乘客列表 */}
            <div
              className="box_main"
              style={{
                display: this.state.passengerActive === "contact" ? "block" : "none",
              }}
            >
              <div className="main_search">
                <p>人员</p>
                <Input
                  className="search_input"
                  placeholder="姓名"
                  allowClear
                  value={this.state.contactSearch.name}
                  onChange={(e) => {
                    let data = this.state.contactSearch;
                    data.name = e.target.value;
                    this.setState({ contactSearch: data });
                  }}
                />
                <Button
                  className="search_btn"
                  type="primary"
                  onClick={() => this.getContactList()}
                >
                  搜索
                </Button>
              </div>

              <div className="box_table">
                <Table
                  dataSource={this.state.contactList}
                  rowKey={(record) => JSON.stringify(record)}
                  size="middle"
                  pagination={false}
                  rowSelection={rowSelection}
                >
                  <Column
                    title="姓名"
                    dataIndex="name"
                    render={(text, render) => {
                      return text
                        ? text
                        : `${render.en_last_name} ${render.en_first_name}`;
                    }}
                  />
                  <Column
                    title="类型"
                    render={(text, render) => {
                      return this.$moment().diff(render.birthday, "years", true) > 12
                        ? "成人"
                        : this.$moment().diff(render.birthday, "years", true) <= 12 &&
                          this.$moment().diff(render.birthday, "years", true) > 2
                        ? "儿童"
                        : this.$moment().diff(render.birthday, "years", true) <= 2
                        ? "婴儿"
                        : "";
                    }}
                  />
                  <Column
                    title="性别"
                    dataIndex="sex"
                    render={(text) => {
                      return text === 2 ? "男" : "女";
                    }}
                  />
                  <Column title="电话" dataIndex="phone" />
                  <Column title="证件号" dataIndex="cert_no" />
                  <Column title="证件" dataIndex="cert_type" />
                  <Column
                    title="国籍"
                    dataIndex="nationality"
                    render={(text) => {
                      return text ? text : "-";
                    }}
                  />
                  <Column
                    title="分组"
                    dataIndex="group_id"
                    render={(text, render) => {
                      return text ? text : "-";
                    }}
                  />
                </Table>
                <Pagination
                  className="contact_pagination"
                  current={this.state.contactSearch.page}
                  total={this.state.contactSearch.total}
                  onChange={this.changeContactPage.bind(this)}
                />
              </div>

              <div className="box_option">
                <Button onClick={() => this.closePassengerModal()}>取消</Button>
                <Button type="primary" onClick={() => this.submitPassengerModal()}>
                  确定
                </Button>
              </div>
            </div>

            {/* 新增乘客 */}
            <div
              className="box_add"
              style={{ display: this.state.passengerActive === "add" ? "block" : "none" }}
            ></div>
          </div>
        </Modal>
      </div>
    );
  }
}
