/*
 * @Description: 个人中心---常用人员
 * @Author: mzr
 * @Date: 2021-03-11 11:45:49
 * @LastEditTime: 2021-03-25 11:20:20
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
} from "antd";

import "./usedPerson.scss";
import Column from "antd/lib/table/Column";

import EditBtn from "../../../static/edit_btn.png";
import BlueWarn from "../../../static/warn_blue.png";
import modalColse from "../../../static/modalColse.png";

const { Option } = Select;
const { Search } = Input;
// 新增人员 --- 证件信息添加
let newPassengerList = {
  cert_type: "",
  cert_no: "",
  birthday: "",
};
export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],

      dataList: [], // 常用人员列表
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

      groupClass: true, // 默认新增分组
      personClass: true, // 默认新增人员

      handleData: {}, // 新增/编辑人员
      birthday: "", // 生日
    };
  }

  async componentDidMount() {
    await this.getDataList();
    await this.getGroupList();
  }

  // 获取常用人员列表
  async getDataList(id) {
    let data = this.state.searchFrom;
    data["page"] = this.state.paginationData.page;
    data["limit"] = this.state.paginationData.per_page;
    data["group_id"] = id || "";

    await this.$axios.post("/api/passenger/index", data).then((res) => {
      if (res.errorcode === 10000) {
        let newPage = this.state.paginationData;
        newPage.total = res.data.to;
        newPage.current_page = res.data.current_page;

        // 分组
        let dataList = [];
        this.state.dataList.forEach((item) => {
          this.state.groupList.forEach((oitem) => {
            if (item.group_id === oitem.id) {
              dataList.push(item);
            }
          });
        });

        this.setState({
          dataList: res.data.data,
          paginationData: newPage,
        });
      }
    });
  }

  // 表格搜索 姓名查询
  searchItem = (value) => {
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

  // 表格批量删除
  deleteBatch() {
    if (this.state.selectedRowKeys.length < 1) {
      message.warn("请勾选选项");
    } else {
      let dataList = [];
      this.state.dataList.forEach((item) => {
        this.state.selectedRowKeys.forEach((oitem) => {
          if (item.id === oitem) {
            dataList.push(item);
          }
        });
      });

      // let data = {
      //     ids:this.state.selectedRowKeys
      // }
      this.$axios
        .post("/api/passenger/dels/" + this.state.selectedRowKeys)
        .then((res) => {
          if (res.errorcode === 10000) {
            message.success(res.msg);
            this.getDataList();
          } else {
            message.error(res.msg);
          }
        });
    }
  }

  // 表格---添加证件
  addCert = () => {
    let newList = this.state.divItem;
    newList.push(newPassengerList);
    this.setState({
      divItem: newList,
    });
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

  //  弹窗---新增人员
  addPerson() {
      
    console.log(this.state.divItem)
    this.setState({
      showModal: true,
      personClass: true,
    });
  }

  //  弹窗---编辑人员
  eidtPerson(val) {
    console.log(val);
    this.setState({
      showModal: true,
      personClass: false,
      tableItemID: val, //获取表格中每条数据的id
    });
  }

  // 新增/编辑人员  提交
  submitPerson() {
    let data = {
      name: this.state.handleData.name, //类型：String  必有字段  备注：姓名 ()
      nationality: "CN", //类型：String  必有字段  备注：国籍/区域 ()
      sex: 0, //类型：Number  必有字段  备注：性别 %2 === 0 女   男
      birthday: this.state.birthday, //类型：String  必有字段  备注：生日 ()
      phone: this.state.handleData.phone, //类型：Number  必有字段  备注：手机号 ()
      cert_type: "身份证", //类型：String  必有字段  备注：证件类型，身份证；护照；港澳通行证；台胞证；回乡证；台湾通行证；入台证；国际海员证；其它证件
      cert_no: this.state.handleData.cert_no, //类型：String  必有字段  备注：证件号
      group_id: 1, //类型：Number  必有字段  备注：分组id

      en_first_name: "mock", //类型：String  可有字段  备注：英文FirstName ()
      en_last_name: "mock", //类型：String  可有字段  备注：英文LastName ()
      birthplace: "mock", //类型：String  可有字段  备注：出生地 ()
      email: this.state.handleData.email, //类型：String  可有字段  备注：邮箱 ()
      cert_ex_date: "1991-11-11", //类型：String  可有字段  备注：证件过期时间 ()
    };
    if (this.state.personClass) {
      this.$axios.post("/api/passenger/add", data).then((res) => {
        if (res.errorcode === 10000) {
          message.success(res.msg);
          this.getDataList();
          this.showModal = false;
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
            this.showModal = false;
            this.getDataList();
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

  // 日期选择框
  dateBind = (date, dateString) => {
    console.log(date, dateString);
    this.setState({
      birthday: dateString,
    });
  };

  // 弹窗---新增分组
  addGroup() {
    this.setState({
      showGroup: true,
      groupClass: true,
    });
  }

  // 弹窗---编辑分组
  editGroup() {
    this.setState({
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
  activeGroup(val) {
    console.log(val);
    this.setState({
      activeGroupId: val.id,
    });

    this.getDataList(val.id);
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
          this.setState({
            showDelete: false,
          });
          this.getGroupList();
        } else {
          message.error(res.msg);
        }
      });
  }

  // 表格---删除人员
  deleteItem(val) {
    this.$axios.post("/api/passenger/del/" + val).then((res) => {
      if (res.errorcode === 10000) {
        message.success(res.msg);
        this.getDataList();
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
                placeholder="姓名/手机号"
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
                {" "}
                <Button onClick={() => this.addGroup()}>+添加分组</Button>
              </div>
              {this.state.groupList.map((item, index) => (
                <div
                  className={
                    this.state.activeGroupId === item.id
                      ? "group_list group_active"
                      : "group_list"
                  }
                  key={item.id}
                  onClick={() => this.activeGroup(item)}
                >
                  <div className="list_name">{item.group_name}</div>
                  <Popover
                    key={item.id}
                    placement="bottomLeft"
                    overlayClassName="group_popover"
                    content={() => (
                      <div className="divide_div">
                        <div className="edit_modal" onClick={() => this.editGroup()}>
                          编辑分组
                        </div>
                        <div className="edit_modal" onClick={() => this.deleteRroup()}>
                          删除分组
                        </div>
                      </div>
                    )}
                  >
                    <div className="list_action">
                      <div className="action_doted"></div>
                      <div className="action_doted"></div>
                      <div className="action_doted"></div>
                    </div>
                  </Popover>
                </div>
              ))}
            </div>
            <div className="usedPerson_div_right">
              <div className="content_nav">
                <div className="content_action">
                  <Button>文件导入</Button>
                  <Button onClick={() => this.deleteBatch()}>批量删除</Button>
                  <Button type="primary" onClick={() => this.addPerson()}>
                    新增人员
                  </Button>
                </div>
              </div>
              <div className="content_list">
                <Table
                  rowKey="id"
                  pagination={false}
                  rowSelection={rowSelection}
                  dataSource={this.state.dataList}
                  locale={{
                    emptyText: (
                      <div className="table_emptyText">
                        <p>当前分组暂无人员，请去添加</p>
                        <Button type="link" onClick={() => this.addPerson()}>
                          +新增人员
                        </Button>
                      </div>
                    ),
                  }}
                >
                  <Column title="姓名" dataIndex="name"></Column>
                  <Column title="手机号" dataIndex="phone"></Column>
                  <Column title="分组" dataIndex=""></Column>
                  <Column title="备注" dataIndex=""></Column>
                  <Column
                    title="操作"
                    render={(item, record) => (
                      <div className="table_action">
                        <div className="edit_btn" onClick={() => this.eidtPerson(record)}>
                          <img src={EditBtn} alt="编辑" />
                        </div>
                        <div
                          className="delete_btn"
                          onClick={() => this.deleteItem(record.id)}
                        >
                          <span></span>
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
              <div className="div_item">
                <div className="item_title">姓名</div>
                <div className="item_input">
                  <Input
                    style={{ width: 200 }}
                    placeholder="请填写"
                    allowClear
                    onChange={this.inputBind.bind(this, "name")}
                  />
                </div>
              </div>
              <div className="div_item">
                <div className="item_title">英文名</div>
                <div className="item_input">
                  <Input
                    style={{ width: 200 }}
                    placeholder="请填写"
                    allowClear
                    onChange={this.inputBind.bind(this, "englishName")}
                  />
                </div>
              </div>
              <div className="div_item">
                <div className="item_title">手机号</div>
                <div className="item_input">
                  <Input
                    style={{ width: 200 }}
                    placeholder="请填写"
                    allowClear
                    onChange={this.inputBind.bind(this, "phone")}
                  />
                </div>
              </div>
              <div className="div_item">
                <div className="item_title">邮箱</div>
                <div className="item_input">
                  <Input
                    style={{ width: 200 }}
                    placeholder="请填写"
                    allowClear
                    onChange={this.inputBind.bind(this, "email")}
                  />
                </div>
              </div>
              <div className="div_item">
                <div className="item_title">分组</div>
                <div className="item_input">
                  <Select
                    style={{ width: 200 }}
                    placeholder="请选择"
                    onChange={this.selectBind.bind(this, "id")}
                  >
                    {this.state.groupList.map((item, index) => (
                      <Option key={item.id}>{item.group_name}</Option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="div_item">
                <div className="item_title">备注</div>
                <div className="item_input">
                  <Input style={{ width: 782 }} placeholder="添加备注" allowClear />
                </div>
              </div>
            </div>

            {this.state.divItem.map((item, index) => (
              <div key={index}>
                <div className="modal_title">证件信息{index + 1}</div>
                <div className="modal_div">
                  <div className="div_item">
                    <div className="item_title">证件类型</div>
                    <div className="item_input">
                      <Select
                        style={{ width: 200 }}
                        placeholder="请选择"
                        defaultValue="身份证"
                        value={item.cert_type}
                        onChange={this.selectBind.bind(this, "cert_type")}
                      >
                        <Option value={1}>身份证</Option>
                        <Option value={2}>护照</Option>
                        <Option value={3}>港澳通行证</Option>
                        <Option value={4}>台胞证</Option>
                        <Option value={5}>回乡证</Option>
                        <Option value={6}>台湾通行证</Option>
                        <Option value={7}>入台证</Option>
                        <Option value={8}>国际海员证</Option>
                        <Option value={9}>其它证件</Option>
                      </Select>
                    </div>
                  </div>
                  <div className="div_item">
                    <div className="item_title">证件号码</div>
                    <div className="item_input">
                      <Input
                        style={{ width: 200 }}
                        placeholder="请输入"
                        allowClear
                        value={item.cert_no}
                        onChange={this.arrInputBind.bind(this, "cert_no", index)}
                      />
                    </div>
                  </div>
                  <div className="div_item">
                    <div className="item_title">生日</div>
                    <div className="item_input">
                      <DatePicker
                        // value={item.birthday}
                        onChange={this.dateBind}
                      />
                    </div>
                  </div>
                  <span onClick={() => this.delCert(index)}>
                    <img src={modalColse} alt="关闭" />
                  </span>
                  <div className="div_item">
                    <div className="item_title">国籍</div>
                    <div className="item_input">
                      <Select
                        style={{ width: 200 }}
                        placeholder="请选择"
                        defaultValue="1"
                        disabled
                      >
                        <Option value="1">中国</Option>
                      </Select>
                    </div>
                  </div>
                  <div className="div_item">
                    <div className="item_title">签发国</div>
                    <div className="item_input">
                      <Select
                        style={{ width: 200 }}
                        placeholder="请选择"
                        defaultValue="1"
                        disabled
                      >
                        <Option value="1">中国</Option>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div className="add_button" onClick={this.addCert}>
              +添加证件
            </div>
          </div>
        </Modal>
        {/* 新增/编辑分组 */}
        <Modal
          title={this.state.groupClass ? "新增分组" : "编辑分组"}
          width={520}
          className="add_group"
          visible={this.state.showGroup}
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
              <Input placeholder="请输入" allowClear onChange={this.InputItem} />
            </div>
          </div>
        </Modal>
        {/* 删除分组弹窗 */}
        <Modal
          width={400}
          className="remove_group"
          visible={this.state.showDelete}
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
            <span>该分组内人员将会一并删除</span>
          </div>
        </Modal>
      </div>
    );
  }
}
