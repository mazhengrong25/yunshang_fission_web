/*
 * @Description: 个人中心---常用人员
 * @Author: mzr
 * @Date: 2021-03-11 11:45:49
 * @LastEditTime: 2021-04-13 11:31:40
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import {
  Input,
  Button,
  Table,
  Pagination,
  Modal,
  Select,
  DatePicker,
  message,
  Popover,
  Row,
  Col,
  Tooltip,
} from "antd";

import "./usedPerson.scss";
import Column from "antd/lib/table/Column";

import WarningModal from "../../../components/WarningModal"; // 警告弹窗

import EditBtn from "../../../static/edit_btn.png";
import BlueWarn from "../../../static/warn_blue.png";
import ModalColse from "../../../static/modalColse.png";
import AddCert from "../../../static/add_cert.png";

import GroupSettingIcon from "../../../static/banner_action.png"; // 分组设置图标
import GroupActiveIcon from "../../../static/banner_action_icon.png"; // 分组选中图标

const { Option } = Select;
const { Search } = Input;
// 新增人员 --- 证件信息添加
let newPassengerList = {
  cert_type: "身份证",
  cert_no: "",
  birthday: "",
};
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],

      dataList: [], // 常用人员列表
      getPassengerLoading: true, // 常用人员加载
      groupList: [], // 分组列表
      divItem: [newPassengerList], // 添加证件列表

      paginationData: {
        current_page: 1, //当前页数
        per_page: 10, //每页条数
        total: 0,
      },

      showModal: false, //人员弹出
      showGroup: false, //分组弹出
      showDelete: false, //删除分组 弹出

      searchFrom: {
        name: "",
        phone: "",
      },

      groupName: "", // 分组名称
      activeGroupId: "", // 选中分组ID
      tableItemID: "", // 表格id

      activeGroupName: "全部人员", // 选中分组名称

      groupClass: true, // 默认新增分组
      personClass: true, // 默认新增人员

      handleData: {
        // 新增/编辑人员
        en_first_name: "",
        en_last_name: "",
        group_id: null,
        name: "",
        phone: "",
        sex: null,
        remark: "", // 备注
      },

      showRemovePassenger: false,
      checkedPassengerId: "", // 删除乘客ID
    };
  }

  async componentDidMount() {
    await this.getGroupList();
    await this.getDataList();
  }

  // 获取常用人员列表
  async getDataList() {
    let data = this.state.searchFrom;
    data["phone"] = this.state.searchFrom.phone;
    data["page"] = this.state.paginationData.page;
    data["limit"] = this.state.paginationData.per_page;
    data["remark"] = this.state.handleData.remark;
    if (this.state.activeGroupId || this.state.activeGroupId === 0) {
      if (this.state.activeGroupId !== -1) {
        data["group_id"] = this.state.activeGroupId ?? "";
      } else {
        delete data["group_id"];
      }
    }

    await this.$axios.post("/api/passenger/index", data).then((res) => {
      this.setState({ getPassengerLoading: false });
      if (res.errorcode === 10000) {
        let newPage = this.state.paginationData;
        newPage.total = res.data.total;
        newPage.current_page = res.data.current_page;

        // 分组
        let dataList = res.data.data;
        dataList.forEach((item) => {
          this.state.groupList.forEach((oitem) => {
            if (item.group_id === oitem.id) {
              item["groupName"] = oitem.group_name;
            } else if (!item.group_id) {
              item["groupName"] = "未分组";
              item["group_id"] = 0;
            }
          });
        });
        this.setState({
          dataList: dataList,
          paginationData: newPage,
        });
      }
    });
  }

  // 表格搜索 姓名查询
  searchItem = (value, event) => {
    console.log(value, event);
    let newData = this.state.searchFrom;
    newData["name"] = value;
    this.setState({
      searchFrom: newData,
    });
    this.getDataList();
  };

  // 获取分组列表
  async getGroupList() {
    await this.$axios.post("/api/passenger/groupIndex").then((res) => {
      if (res.errorcode === 10000) {
        this.setState({
          groupList: res.data.data,
        });

        // 判断
        if (this.state.groupList.indexOf("未分组") === -1) {
          let newGroupList = this.state.groupList;
          newGroupList.unshift({
            group_name: "未分组",
            id: 0,
          });
          this.setState({
            groupList: newGroupList,
          });
        }
      }
    });
  }

  // 分页
  changePagination = async (page, pageSize) => {
    console.log(page, pageSize);

    let data = this.state.paginationData;
    data["page"] = page;
    data["limit"] = pageSize;

    console.log(data);

    await this.setState({
      paginationData: data,
    });
    await this.getDataList();
  };

  // 每页显示条数
  changePageSize = async (current, size) => {
    console.log("current, size", current, size);
    let data = this.state.paginationData;
    data["current_page"] = current;
    data["per_page"] = size;

    await this.setState({
      paginationData: data,
    });
  };

  // 表格选中项
  onSelectChange = (selectedRowKeys) => {
    this.setState({ selectedRowKeys });
  };

  // 打开批量删除弹窗
  openRemovePassengerModal() {
    if (this.state.selectedRowKeys.length < 1) {
      return message.warn("请勾选选项");
    }

    this.setState({
      checkedPassengerId: "",
      showRemovePassenger: true,
    });
  }

  // 表格批量删除
  deleteBatch() {
    let dataList = [];
    this.state.dataList.forEach((item) => {
      this.state.selectedRowKeys.forEach((oitem) => {
        if (item.id === oitem) {
          dataList.push(item);
        }
      });
    });
    let data = {
      ids: this.state.selectedRowKeys,
    };
    this.$axios.post("/api/passenger/dels", data).then((res) => {
      if (res.errorcode === 10000) {
        message.success(res.msg);
        this.setState({
          showRemovePassenger: false,
        });
        this.getDataList();
      } else {
        message.error(res.msg);
      }
    });
  }

  // 表格---添加证件
  addCert = () => {
    return message.info("功能开发中");

    // let newList = this.state.divItem;
    // newList.push(newPassengerList);
    // this.setState({
    //     divItem: newList,
    // });
  };

  // 表格---删除证件
  delCert(val) {
    let newList = this.state.divItem;

    newList.splice(
      newList.findIndex((item, index) => index === val),
      1
    );
    console.log(val, newList);
    this.setState({
      divItem: newList,
    });
  }

  //   乘客信息数组输入值
  arrInputBind = (e, index, val) => {
    let data = JSON.parse(JSON.stringify(this.state.divItem));
    data[index][e] = val.target.value;
    this.setState({
      divItem: data,
    });
  };

  // 乘客信息数组日期选择器
  arrDateBind = (e, index, val) => {
    console.log(e, index, val);
    let data = JSON.parse(JSON.stringify(this.state.divItem));
    data[index][e] = val;
    this.setState({
      divItem: data,
    });
  };

  // 乘客信息数组选择器
  arrSelectBind = (e, index, val) => {
    console.log(e, index, val);
    let data = JSON.parse(JSON.stringify(this.state.divItem));
    data[index][e] = val;
    this.setState({
      divItem: data,
    });
  };

  //  弹窗---新增人员
  addPerson() {
    let newPassengerData = {
      en_first_name: "",
      en_last_name: "",
      group_id: this.state.activeGroupId || null,
      name: "",
      phone: "",
      sex: null,
      remark: "", // 备注
    };
    this.setState({
      handleData: newPassengerData,
      divItem: [newPassengerList],
      showModal: true,
      personClass: true,
    });
  }

  //  弹窗---编辑人员
  eidtPerson(val) {
    let data = JSON.parse(JSON.stringify(this.state.divItem));

    data[0] = {
      cert_type: val.cert_type,
      cert_no: val.cert_no,
      birthday: val.birthday,
    };

    this.setState({
      showModal: true,
      personClass: false,
      handleData: val,
      divItem: data,
      tableItemID: val.id, //获取表格中每条数据的id
    });
  }

  // 新增/编辑人员  提交
  submitPerson() {
    let newCard = this.state.divItem[0];
    let data = {
      name: this.state.handleData.name, //类型：String  必有字段  备注：姓名 ()
      nationality: "CN", //类型：String  必有字段  备注：国籍/区域 ()
      sex: parseInt(newCard.cert_no.substr(16, 1)) % 2 === 1 ? 1 : 0, //类型：Number  必有字段  备注：性别 %2 === 0 女   男
      birthday: this.$moment(newCard.birthday).format("YYYY-MM-DD"), //类型：String  必有字段  备注：生日 ()
      phone: this.state.handleData.phone, //类型：Number  必有字段  备注：手机号 ()
      cert_type: newCard.cert_type, //类型：String  必有字段  备注：证件类型，身份证；护照；港澳通行证；台胞证；回乡证；台湾通行证；入台证；国际海员证；其它证件
      cert_no: newCard.cert_no, //类型：String  必有字段  备注：证件号
      group_id: this.state.handleData.group_id, //类型：Number  必有字段  备注：分组id ()

      en_first_name: this.state.handleData.en_first_name, //类型：String  可有字段  备注：英文FirstName ()
      en_last_name: this.state.handleData.en_last_name, //类型：String  可有字段  备注：英文LastName ()
      birthplace: "", //类型：String  可有字段  备注：出生地 ()
      email: this.state.handleData.email, //类型：String  可有字段  备注：邮箱 ()
      cert_ex_date: null, //类型：String  可有字段  备注：证件过期时间 ()
      remark: this.state.handleData.remark || "",
    };
    console.log(data);
    if (this.state.personClass) {
      this.$axios.post("/api/passenger/add", data).then((res) => {
        if (res.errorcode === 10000) {
          message.success(res.msg);
          this.getDataList();
          this.setState({
            showModal: false,
          });
        } else {
          message.warn(res.msg);
        }
      });
    } else {
      this.$axios
        .post("/api/passenger/edit/" + this.state.tableItemID, data)
        .then((res) => {
          if (res.errorcode === 10000) {
            message.success(res.msg);
            this.getDataList();
            this.setState({
              showModal: false,
            });
          } else {
            message.error(res.msg);
          }
        });
    }
  }

  // 输入框
  inputBind = (e, val) => {
    let data = this.state.handleData;
    data[e] = val.target.value;
    this.setState({
      handleData: data,
    });
  };

  // 选择器
  selectBind = (e, val) => {
    console.log(e, val);
    let data = this.state.handleData;
    data[e] = val;
    this.setState({
      handleData: data,
    });
  };

  // 弹窗---新增分组
  addGroup() {
    this.setState({
      groupName: "",
      showGroup: true,
      groupClass: true,
    });
  }

  // 弹窗---编辑分组
  editGroup(val) {
    this.setState({
      groupName: val,
      showGroup: true,
      groupClass: false,
    });
  }

  // 新增/编辑分组  提交
  async submitGroup() {
    let data = {
      group_name: this.state.groupName,
    };
    if (this.state.groupClass) {
      // 新增
      await this.$axios.post("/api/passenger/groupAdd", data).then((res) => {
        console.log(res);
        if (res.errorcode === 10000) {
          message.success(res.msg);
          this.getGroupList();
          this.getDataList();
          this.setState({
            showGroup: false,
          });
        } else {
          message.error(res.msg);
        }
      });
    } else {
      // 编辑
      this.$axios
        .post("/api/passenger/groupEdit/" + this.state.activeGroupId, data)
        .then((res) => {
          console.log("编辑", res);
          if (res.errorcode === 10000) {
            message.success(res.msg);
            this.setState({
              showGroup: false,
            });
            this.getGroupList();
            this.getDataList();
          } else {
            message.error(res.msg);
          }
        });
    }
  }

  // 输入值
  InputItem = (val) => {
    this.setState({
      groupName: val.target.value,
    });
  };

  // 选中分组
  async activeGroup(val) {
    console.log(val);
    await this.setState({
      activeGroupName: val.group_name,
      activeGroupId: val.id,
    });
    await this.getDataList();
  }

  // 删除分组---弹出
  deleteRroup() {
    this.setState({
      showDelete: true,
    });
  }

  // 删除分组---接口
  removeRroup() {
    this.$axios
      .post("/api/passenger/groupDel/" + this.state.activeGroupId)
      .then((res) => {
        console.log(res);
        if (res.errorcode === 10000) {
          message.success(res.msg);
          this.getGroupList();
          this.setState({
            activeGroupName: "全部人员",
            activeGroupId: -1,
            showDelete: false,
          });
          this.getDataList();
        } else {
          message.error(res.msg);
        }
      });
  }

  // 表格---删除人员
  deleteItem() {
    this.$axios
      .post("/api/passenger/del/" + this.state.checkedPassengerId)
      .then((res) => {
        if (res.errorcode === 10000) {
          message.success(res.msg);
          this.getDataList();
          this.setState({
            showRemovePassenger: false,
          });
        } else {
          message.error(res.msg);
        }
      });
  }

  render() {
    const { selectedRowKeys } = this.state;
    const rowSelection = {
      selectedRowKeys,
      onChange: this.onSelectChange,
    };
    return (
      <div className="usedPerson">
        <div className="usedPerson_content_div">
          <div className="usedPerson_div_title">
            <div className="title_left">常用人员</div>
            <div className="title_right">
              <Search
                placeholder="姓名"
                style={{ width: 168 }}
                allowClear
                onSearch={this.searchItem}
              />
            </div>
          </div>
          <div className="usedPerson_content">
            <div className="usedPerson_div_menu">
              <div className="menu_title">常用人员分组</div>
              <div className="add_group">
                <Button onClick={() => this.addGroup()}>+添加分组</Button>
              </div>
              {this.state.groupList.map((item, index) => (
                <div
                  key={index}
                  className={
                    this.state.activeGroupId === item.id
                      ? "group_list group_active"
                      : "group_list"
                  }
                  onClick={() => this.activeGroup(item)}
                >
                  <div className="list_name">{item.group_name}</div>
                  <Popover
                    placement="bottomLeft"
                    overlayClassName="group_popover"
                    autoAdjustOverflow={false}
                    trigger="click"
                    content={() => (
                      <div className="divide_div">
                        <div
                          className="edit_modal"
                          onClick={() => this.editGroup(item.group_name)}
                        >
                          编辑分组
                        </div>
                        <div className="edit_modal" onClick={() => this.deleteRroup()}>
                          删除分组
                        </div>
                      </div>
                    )}
                  >
                    <div className="list_action">
                      <div className="action_doted">
                        <img
                          className="active_icon"
                          src={GroupActiveIcon}
                          alt="分组选中图标"
                        ></img>
                        <img
                          className="setting_icon"
                          src={GroupSettingIcon}
                          alt="分组设置图标"
                        ></img>
                      </div>
                    </div>
                  </Popover>
                </div>
              ))}
            </div>
            <div className="usedPerson_div_right">
              <div className="content_nav">
                <div className="content_table_title">
                  <div className="nav_item">{this.state.activeGroupName}</div>
                  <span></span>
                  <div className="nav_item_action">
                    人员总数：{this.state.paginationData.total}
                  </div>
                </div>
                <div className="content_action">
                  {/* <Button>文件导入</Button> */}
                  <Button onClick={() => this.openRemovePassengerModal()}>
                    批量删除
                  </Button>
                  <Button type="primary" onClick={() => this.addPerson()}>
                    新增人员
                  </Button>
                </div>
              </div>
              <div className="content_list">
                <Table
                  rowKey="id"
                  className="person_table"
                  pagination={false}
                  rowSelection={rowSelection}
                  dataSource={this.state.dataList}
                  loading={this.state.getPassengerLoading}
                  locale={
                    this.state.getPassengerLoading
                      ? {}
                      : {
                          emptyText: (
                            <div className="table_emptyText">
                              <p>当前分组暂无人员，请去添加</p>
                              <Button type="link" onClick={() => this.addPerson()}>
                                +新增人员
                              </Button>
                            </div>
                          ),
                        }
                  }
                >
                  <Column
                    title="姓名"
                    width="15%"
                    render={(item, record) => {
                      return record.name
                        ? record.name
                        : record.en_first_name + " " + record.en_last_name;
                    }}
                  ></Column>
                  <Column
                    width="20%"
                    title="手机号"
                    dataIndex="phone"
                    render={(text) => {
                      return text ? text : "-";
                    }}
                  ></Column>
                  <Column
                    width="18%"
                    title="分组"
                    dataIndex="groupName"
                    render={(text) => {
                      return text ? text : "-";
                    }}
                  ></Column>
                  <Column
                    width="24%"
                    title="备注"
                    dataIndex="remark"
                    render={(text) => (
                      <Tooltip title={text}>
                        <span className="person_remark">{text || "-"}</span>
                      </Tooltip>
                    )}
                  ></Column>
                  <Column
                    title="操作"
                    render={(item, record) => (
                      <div className="table_action">
                        <div className="edit_btn" onClick={() => this.eidtPerson(record)}>
                          <img src={EditBtn} alt="编辑" />
                        </div>
                        <div
                          className="delete_btn"
                          onClick={() =>
                            this.setState({
                              showRemovePassenger: true,
                              checkedPassengerId: record.id,
                            })
                          }
                        >
                          <img src={ModalColse} alt="删除" />
                        </div>
                      </div>
                    )}
                  ></Column>
                </Table>
                {/* 分页 */}
                <div className="table_pagination">
                  <Pagination
                    showSizeChanger
                    pageSizeOptions={[10, 15, 20]}
                    showTitle={false}
                    total={Number(this.state.paginationData.total)}
                    current={Number(this.state.paginationData.current_page)}
                    pageSize={Number(this.state.paginationData.per_page)}
                    onChange={this.changePagination}
                    onShowSizeChange={this.changePageSize.bind(this)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* 新增/编辑人员 */}
        <Modal
          title={this.state.personClass ? "新增人员" : "编辑人员"}
          width={920}
          centered
          visible={this.state.showModal}
          onCancel={() =>
            this.setState({
              showModal: false,
            })
          }
          footer={[
            <Button onClick={() => this.setState({ showModal: false })}>取消</Button>,
            <Button type="primary" onClick={() => this.submitPerson()}>
              保存
            </Button>,
          ]}
        >
          <div className="add_modal">
            <div className="modal_title">基本信息</div>
            <div className="modal_div">
              <div className="item_system">
                <Row gutter={16}>
                  <Col span={8}>
                    <div className="div_item">
                      <div className="item_title">姓名</div>
                      <div className="item_input">
                        <Input
                          style={{ width: "100%" }}
                          placeholder="请填写"
                          allowClear
                          value={this.state.handleData.name}
                          onChange={this.inputBind.bind(this, "name")}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="div_item">
                      <div className="item_title">LastName</div>
                      <div className="item_input">
                        <Input
                          style={{ width: "100%" }}
                          placeholder="请填写"
                          allowClear
                          value={this.state.handleData.en_first_name}
                          onChange={this.inputBind.bind(this, "en_last_name")}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="div_item">
                      <div className="item_title">FirstName</div>
                      <div className="item_input">
                        <Input
                          style={{ width: "100%" }}
                          placeholder="请填写"
                          allowClear
                          value={this.state.handleData.en_first_name}
                          onChange={this.inputBind.bind(this, "en_first_name")}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="item_system">
                <Row gutter={16}>
                  <Col span={8}>
                    <div className="div_item">
                      <div className="item_title">手机号</div>
                      <div className="item_input">
                        <Input
                          style={{ width: "100%" }}
                          placeholder="请填写"
                          allowClear
                          value={this.state.handleData.phone}
                          onChange={this.inputBind.bind(this, "phone")}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="div_item">
                      <div className="item_title">邮箱</div>
                      <div className="item_input">
                        <Input
                          style={{ width: "100%" }}
                          placeholder="请填写"
                          allowClear
                          value={this.state.handleData.email}
                          onChange={this.inputBind.bind(this, "email")}
                        />
                      </div>
                    </div>
                  </Col>
                  <Col span={8}>
                    <div className="div_item">
                      <div className="item_title">分组</div>
                      <div className="item_input">
                        <Select
                          style={{ width: "100%" }}
                          placeholder="请选择"
                          value={this.state.handleData.group_id}
                          onChange={this.selectBind.bind(this, "group_id")}
                        >
                          {this.state.groupList.map((item, index) => (
                            <Option key={index} value={item.id}>
                              {item.group_name}
                            </Option>
                          ))}
                        </Select>
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="item_system">
                <Row gutter={16}>
                  <Col span={24}>
                    <div className="div_item">
                      <div className="item_title">备注</div>
                      <div className="item_input">
                        <Input
                          style={{ width: "100%" }}
                          placeholder="添加备注"
                          allowClear
                          value={this.state.handleData.remark}
                          onChange={this.inputBind.bind(this, "remark")}
                        />
                      </div>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            {this.state.divItem.map((item, index) => (
              <div key={index}>
                <div className="modal_title">证件信息{index + 1}</div>
                <div className="modal_div">
                  <div className="item_system">
                    <Row gutter={16}>
                      <Col span={8}>
                        <div className="div_item">
                          <div className="item_title">证件类型</div>
                          <div className="item_input">
                            <Select
                              style={{ width: "100%" }}
                              placeholder="请选择"
                              value={item.cert_type}
                              onChange={this.arrSelectBind.bind(this, "cert_type", index)}
                            >
                              <Option value="身份证">身份证</Option>
                              <Option value="护照">护照</Option>
                              <Option value="港澳通行证">港澳通行证</Option>
                              <Option value="台胞证">台胞证</Option>
                              <Option value="回乡证">回乡证</Option>
                              <Option value="台湾通行证">台湾通行证</Option>
                              <Option value="入台证">入台证</Option>
                              <Option value="国际海员证">国际海员证</Option>
                              <Option value="其它证件">其它证件</Option>
                            </Select>
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="div_item">
                          <div className="item_title">证件号码</div>
                          <div className="item_input">
                            <Input
                              style={{ width: "100%" }}
                              placeholder="请输入"
                              allowClear
                              value={item.cert_no}
                              onChange={this.arrInputBind.bind(this, "cert_no", index)}
                            />
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="div_item">
                          <div className="item_title">生日</div>
                          <div className="item_input">
                            <DatePicker
                              value={item.birthday ? this.$moment(item.birthday) : null}
                              onChange={this.arrDateBind.bind(this, "birthday", index)}
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {index > 0 ? (
                    <span onClick={() => this.delCert(index)}>
                      <img src={ModalColse} alt="关闭" />
                    </span>
                  ) : (
                    ""
                  )}

                  <div className="item_system">
                    <Row gutter={16}>
                      <Col span={8}>
                        <div className="div_item">
                          <div className="item_title">国籍</div>
                          <div className="item_input">
                            <Select
                              style={{ width: "100%" }}
                              placeholder="请选择"
                              defaultValue="1"
                              disabled
                            >
                              <Option value="1">中国</Option>
                            </Select>
                          </div>
                        </div>
                      </Col>
                      <Col span={8}>
                        <div className="div_item">
                          <div className="item_title">签发国</div>
                          <div className="item_input">
                            <Select
                              style={{ width: "100%" }}
                              placeholder="请选择"
                              defaultValue="1"
                              disabled
                            >
                              <Option value="1">中国</Option>
                            </Select>
                          </div>
                        </div>
                      </Col>
                      <Col span={8}></Col>
                    </Row>
                  </div>
                </div>
              </div>
            ))}

            <div className="add_button" onClick={this.addCert}>
              <div className="button_icon">
                <img src={AddCert} alt="添加证件图标" />
              </div>
              添加证件
            </div>
          </div>
        </Modal>
        {/* 新增/编辑分组 */}
        <Modal
          title={this.state.groupClass ? "新增分组" : "编辑分组"}
          width={520}
          className="add_group"
          zIndex={9999}
          visible={this.state.showGroup}
          centered
          onCancel={() =>
            this.setState({
              showGroup: false,
            })
          }
          footer={[
            <Button type="primary" onClick={() => this.submitGroup()}>
              {this.state.groupClass ? "确定" : "修改"}
            </Button>,
          ]}
        >
          <div className="add_group">
            <div className="group_item">
              <div className="item_title">分组名称</div>
              <Input
                placeholder="请输入"
                value={this.state.groupName}
                allowClear
                onChange={this.InputItem}
              />
            </div>
          </div>
        </Modal>
        {/* 删除分组弹窗 */}
        <Modal
          width={400}
          className="remove_group"
          visible={this.state.showDelete}
          centered
          zIndex={9999}
          onCancel={() =>
            this.setState({
              showDelete: false,
            })
          }
          footer={[
            <Button onClick={() => this.setState({ showDelete: false })}>取消</Button>,
            <Button type="primary" onClick={() => this.removeRroup()}>
              确定
            </Button>,
          ]}
        >
          <div className="delete_group">
            <div className="middle_warn">
              <img src={BlueWarn} alt="警告图标" />
            </div>
            <p>是否确定删除分组？</p>
            {this.state.dataList.length > 0 ? (
              <span>该分组内人员将会归为未分组</span>
            ) : (
              ""
            )}
          </div>
        </Modal>

        {/* 删除乘客弹窗 */}
        <WarningModal
          modalStatus={this.state.showRemovePassenger}
          modalMessage="是否确认删除所选择乘客？"
          modalSubmit={() =>
            this.state.checkedPassengerId ? this.deleteItem() : this.deleteBatch()
          }
          modalClose={() =>
            this.setState({
              showRemovePassenger: false,
            })
          }
        ></WarningModal>
      </div>
    );
  }
}
