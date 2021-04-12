/*
 * @Description: 机票预订页面
 * @Author: wish.WuJunLong
 * @Date: 2021-02-19 13:54:59
 * @LastEditTime: 2021-04-12 16:49:43
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import {
  Modal,
  Button,
  DatePicker,
  Input,
  Select,
  Table,
  Pagination,
  Switch,
  message,
} from "antd";

import "./flightScheduled.scss";
import AddPassengerIcon from "../../static/add_passenger_icon.png"; // 添加乘机人图标
import PassengerAvatar from "../../static/passenger_avatar.png"; // 乘机人头像

import TicketImage from "../../static/flight_fly.png";

import AircraftTypePopover from "../../components/AircraftTypePopover"; // 航班信息 机型信息组件
import RefundsAndChangesPopover from "../../components/RefundsAndChangesPopover"; // 退改签说明弹窗

const { Option } = Select;
const { Column } = Table;
const { TextArea } = Input;

let defaultPassenger = {
  name: "", // 乘客姓名
  userType: "ADT", // 乘客类型
  phone: "", // 手机号
  cert_type: "身份证", // 证件类型
  cert_no: "", // 证件号
  birthday: "", // 出生日期
  IsInsure: false, // 保险
};

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orderKey: "", // 验价返回key

      reserveMessage: {}, // 航班信息

      showSegment: false, // 航班详细信息

      contactList: [], // 乘客列表
      selectedRowKeys: [], // 乘客列表选择
      saveSelectList: [], // 存储已选择乘客列表

      passengerTypeNumber: {}, // 乘客类型列表

      groupList: [], // 分组列表
      newPassenger: {
        name: "",
        birthday: "",
        phone: "",
        email: "",
        cert_type: "身份证",
        cert_no: "",
        group_id: null,
        remark: "",
      }, // 新增乘客信息

      contactSearch: {
        // 联系人筛选及分页
        except_cert_no: "", //类型：String  必有字段  备注：需要排除的证件号多个，号隔开
        page: 1, //类型：String  可有字段  备注：页数
        limit: 5, // 条数
        total: 0, // 总条数
        name: "", //类型：String  可有字段  备注：姓名模糊查询
      },
      commonlyContact: [], // 常用联系人列表

      selectContactList: [defaultPassenger], // 选中乘客列表

      passengerActive: "contact", // 常用乘机人弹窗切换状态 contact 联系人页面

      isPassengerModal: false, // 常用乘机人弹窗

      contactsMessage: {
        role_name: "",
        phone: "",
        // email: "",
      }, // 联系人信息

      insuranceList: [], // 保险列表
      selectInsurance: {}, // 选中保险数据
    };
  }

  async componentDidMount() {
    let key = React.$filterUrlParams(decodeURI(this.props.location.search)).key;
    await this.setState({
      orderKey: key,
    });
    await this.getReserveData(key);
    await this.getContactMessage();
    await this.getInsuranceList();
    await this.getCommonlyContact();
    await this.getGroupList();

    if (sessionStorage.getItem("activePassengerList")) {
      let passengerList = JSON.parse(sessionStorage.getItem("activePassengerList"));

      if (passengerList.length > 0) {
        let newList = [];
        passengerList.forEach((item) => {
          newList.push(item);
        });
        this.setState({
          selectContactList: newList,
        });
      }
    }
  }

  // 获取航班预定信息
  async getReserveData(key) {
    let data = {
      keys: [key],
    };
    this.$axios.post("/api/entryReserve", data).then((res) => {
      if (res.errorcode === 10000) {
        this.setState({
          reserveMessage: res.data[key],
        });

        console.log(res.data[key]);
      } else {
        let secondsToGo = 5;

        const timer = setInterval(() => {
          secondsToGo -= 1;
          modal.update({
            content: `将在 ${secondsToGo} 秒后返回航班列表，您也可以点击确定按钮手动返回。`,
          });
        }, 1000);

        const timerOut = setTimeout(() => {
          clearInterval(timer);
          Modal.destroyAll();
          this.props.history.goBack(-1);
        }, secondsToGo * 1001);

        const modal = Modal.warning({
          title: res.msg,
          content: `将在 ${secondsToGo} 秒后返回航班列表，您也可以点击确定按钮手动返回。`,
          okText: "确定",
          onOk: () => {
            clearInterval(timer);
            clearTimeout(timerOut);
            Modal.destroyAll();
            this.props.history.goBack(-1);
          },
        });
      }
    });
  }

  // 获取联系人信息
  async getContactMessage() {
    this.$axios.post("/api/me").then((res) => {
      let thisList = this.state.commonlyContact
      let thisPassenger = {
        birthday: res.birthday || null,
        cert_no: res.cert_no || "",
        cert_type: res.cert_type || "身份证",
        id: res.id,
        name: res.role_name,
        phone: res.phone,
        sex: res.sex || null,
        userType: res.birthday
          ? this.$moment().diff(res.birthday, "years") < 2
            ? "INF"
            : this.$moment().diff(res.birthday, "years") >= 2 &&
              this.$moment().diff(res.birthday, "years") < 12
            ? "CHD"
            : this.$moment().diff(res.birthday, "years") >= 12
            ? "ADT"
            : ""
          : "ADT",
      };
      thisList.unshift(thisPassenger)
      this.setState({
        contactsMessage: res,
        commonlyContact: thisList
      });
    });
  }

  // 获取旅客列表
  async getContactList() {
    let data = this.state.contactSearch;
    this.$axios.post("/api/passenger/index", data).then((res) => {
      if (res.errorcode === 10000) {
        let newList = res.data.data;

        if (newList.length > 0) {
          newList.forEach((item) => {
            item["userType"] =
              this.$moment().diff(item.birthday, "years") < 2
                ? "INF"
                : this.$moment().diff(item.birthday, "years") >= 2 &&
                  this.$moment().diff(item.birthday, "years") < 12
                ? "CHD"
                : this.$moment().diff(item.birthday, "years") >= 12
                ? "ADT"
                : "";
            item["IsInsure"] = false;
          });
        }
        // 分页组装
        data.total = res.data.total;
        data.page = res.data.current_page;

        let checkedId = [];

        let savePassenger = sessionStorage.getItem("activePassengerList")
          ? JSON.parse(sessionStorage.getItem("activePassengerList"))
          : [];

        if (savePassenger.length > 0) {
          savePassenger.forEach((item) => {
            checkedId.push(item.cert_no);
          });
        }
        console.log(data);
        this.setState({
          contactSearch: data,
          contactList: newList,
          selectedRowKeys: [...new Set(checkedId)],
        });
        this.statsPriceTotal();
      }
    });
  }

  // 获取最新下单乘客
  async getCommonlyContact() {
    this.$axios.post("/api/passenger/new/6").then((res) => {
      if (res.errorcode === 10000) {
        // 组装当前账号人员信息
        console.log(this.state.contactsMessage);
        
        let thisCommonlyContact = this.state.commonlyContact;

        let passengerList = JSON.parse(sessionStorage.getItem("activePassengerList"));

        let getApiList = [];
        res.data.forEach((item) => {
          item["id"] = item.passenger_id;
          item["cert_type"] =
            item.cert_type === "0"
              ? "身份证"
              : item.cert_type === "1"
              ? "护照"
              : item.cert_type === "2"
              ? "港澳通行证"
              : item.cert_type === "3"
              ? "台胞证"
              : item.cert_type === "4"
              ? "回乡证"
              : item.cert_type === "5"
              ? "台湾通行证"
              : item.cert_type === "6"
              ? "入台证"
              : item.cert_type === "7"
              ? "国际海员证"
              : item.cert_type === "8"
              ? "其他证件"
              : item.cert_type;
          item["userType"] = item.birthday
            ? this.$moment().diff(item.birthday, "years") < 2
              ? "INF"
              : this.$moment().diff(item.birthday, "years") >= 2 &&
                this.$moment().diff(item.birthday, "years") < 12
              ? "CHD"
              : this.$moment().diff(item.birthday, "years") >= 12
              ? "ADT"
              : ""
            : "ADT";
          item["sex"] = item.sex === "M" ? 0 : item.sex === "F" ? 1 : 2;
          item["IsInsure"] = false;
          delete item.passenger_id;

          if (sessionStorage.getItem("activePassengerList")) {
            item["checked"] = passengerList.find((oitem) => {
              return item.cert_no === oitem.cert_no;
            });
          }

          getApiList.push(item);
        });

        thisCommonlyContact = thisCommonlyContact.concat(getApiList);
        console.log(thisCommonlyContact);

        this.setState({
          commonlyContact: thisCommonlyContact,
        });
      }
    });
  }

  // 获取保险列表
  async getInsuranceList() {
    this.$axios.get("/api/insurance/list").then((res) => {
      if (res.errorcode === 10000) {
        this.setState({
          insuranceList: res.data,
        });
      }
    });
  }

  // 获取分组列表
  async getGroupList() {
    this.$axios.post("/api/passenger/groupIndex").then((res) => {
      if (res.errorcode === 10000) {
        this.setState({
          groupList: res.data.data,
        });
      }
    });
  }

  // 选择常用联系人
  checkedContact(tag, checked) {
    let passengerList = this.state.selectContactList; // 选中乘客列表

    let commonlyList = this.state.commonlyContact; // 常用乘客
    let addPassenger = false; // 乘客状态控制器

    let oldPassenger = sessionStorage.getItem("activePassengerList")
      ? JSON.parse(sessionStorage.getItem("activePassengerList"))
      : [];

    if (
      oldPassenger.find((item) => {
        return item.cert_no === tag.cert_no;
      })
    ) {
      oldPassenger.splice(
        oldPassenger.findIndex((item) => item.cert_no === tag.cert_no),
        1
      );
      passengerList.splice(
        passengerList.findIndex((item) => item.cert_no === tag.cert_no),
        1
      );
      commonlyList[checked]["checked"] = false;
    } else {
      passengerList.forEach((item, index) => {
        if (!item.name && !item.phone && !item.cert_no && !addPassenger) {
          passengerList[index] = tag;
          addPassenger = true;
        }
      });
      commonlyList[checked]["checked"] = true;

      if (!addPassenger) {
        passengerList.push(tag);
      }
      oldPassenger.push(tag);
    }

    sessionStorage.setItem(
      "activePassengerList",
      JSON.stringify([...new Set(oldPassenger)])
    );

    if (passengerList.length < 1) {
      passengerList = [defaultPassenger];
    }

    this.setState({
      commonlyContact: commonlyList,
      selectedRowKeys: [...new Set(oldPassenger)],
      selectContactList: [...new Set(passengerList)],
    });
    this.statsPriceTotal();
  }

  // 添加乘机人按钮
  addPassengerList() {
    let newList = this.state.selectContactList;
    newList.push(defaultPassenger);
    console.log(newList);
    this.setState({ selectContactList: newList });
    this.statsPriceTotal();
  }

  // 删除乘机人按钮
  async removePassenger(val, index) {
    console.log(val, index);
    let newList = JSON.parse(JSON.stringify(this.state.selectContactList));
    let savePassengerList = sessionStorage.getItem("activePassengerList")
      ? JSON.parse(sessionStorage.getItem("activePassengerList"))
      : [];

    let commonlyList = this.state.commonlyContact;
    commonlyList.forEach((item) => {
      if (item.cert_no === val.cert_no) {
        item["checked"] = false;
      }
    });

    console.log(commonlyList);

    if (savePassengerList.length > 0) {
      let newPassengerList = [];
      savePassengerList.forEach((item) => {
        if (item.id !== val.id) {
          newPassengerList.push(item);
        }
      });

      sessionStorage.setItem("activePassengerList", JSON.stringify(newPassengerList));
    }
    if (index === 0 && newList.length <= 1) {
      newList[index] = defaultPassenger;
      return this.setState({ selectContactList: newList });
    }

    newList.splice(
      newList.findIndex((item) => item.cert_no === val.cert_no),
      1
    );

    await this.setState({
      selectContactList: newList,
      commonlyContact: commonlyList,
    });
    await this.statsPriceTotal();
  }

  // 编辑乘机人  输入框
  editPassenger = (name, index, val) => {
    let newData = JSON.parse(JSON.stringify(this.state.selectContactList));

    let thisInput = val.target.value;

    if (
      name === "cert_no" &&
      newData[index].cert_type === "身份证" &&
      thisInput.length === 18
    ) {
      let thisBirthday =
        thisInput.substring(6, 10) +
        "-" +
        thisInput.substring(10, 12) +
        "-" +
        thisInput.substring(12, 14);
      newData[index].birthday = thisBirthday;
      newData[index]["userType"] =
        this.$moment().diff(thisBirthday, "years") < 2
          ? "INF"
          : this.$moment().diff(thisBirthday, "years") >= 2 &&
            this.$moment().diff(thisBirthday, "years") < 12
          ? "CHD"
          : this.$moment().diff(thisBirthday, "years") >= 12
          ? "ADT"
          : "";
    }

    newData[index][name] = thisInput;

    this.setState({ selectContactList: newData });
    this.statsPriceTotal();
  };
  // 编辑乘机人 选择器
  editPassengerSelect = async (name, index, val) => {
    let newData = JSON.parse(JSON.stringify(this.state.selectContactList));
    newData[index][name] = val;

    if (name === "IsInsure") {
      let savePassenger = sessionStorage.getItem("activePassengerList")
        ? JSON.parse(sessionStorage.getItem("activePassengerList"))
        : [];

      if (savePassenger.length > 0) {
        savePassenger.forEach((item) => {
          if (item.cert_no === val.cert_no) {
            item = val;
          }
        });
        sessionStorage.setItem("activePassengerList", JSON.stringify(savePassenger));
      }
    }

    await this.setState({ selectContactList: newData });
    await this.statsPriceTotal();
  };

  // 编辑乘机人 时间选择器
  editPassengerDate = (name, index, val, stringVal) => {
    let newData = this.state.selectContactList;
    if (name === "birthday") {
      console.log(this.$moment().diff(stringVal, "years"));
      newData[index]["userType"] =
        this.$moment().diff(stringVal, "years") < 2
          ? "INF"
          : this.$moment().diff(stringVal, "years") >= 2 &&
            this.$moment().diff(stringVal, "years") < 12
          ? "CHD"
          : this.$moment().diff(stringVal, "years") >= 12
          ? "ADT"
          : "";
    }

    newData[index][name] = stringVal;

    console.log(newData);
    this.setState({ selectContactList: newData });
    this.statsPriceTotal();
  };

  // 打开常用联系人弹窗
  openPassengerModal() {
    if (this.state.contactList.length < 1) {
      this.getContactList();
    }
    let checkedId = [];

    let savePassenger = sessionStorage.getItem("activePassengerList")
      ? JSON.parse(sessionStorage.getItem("activePassengerList"))
      : [];

    if (savePassenger.length > 0) {
      savePassenger.forEach((item) => {
        checkedId.push(item.cert_no);
      });
    }

    this.setState({
      passengerActive: "contact",
      isPassengerModal: true,
      selectedRowKeys: [...new Set(checkedId)],
    });
  }

  // 关闭联系人弹窗
  closePassengerModal() {
    this.setState({ isPassengerModal: false, selectedRowKeys: [] });
  }

  // 表格多选
  onInvertChange = (record, selected) => {
    console.log(record, selected);
    let oldPassenger = sessionStorage.getItem("activePassengerList")
      ? JSON.parse(sessionStorage.getItem("activePassengerList"))
      : [];
    let selectId = [];
    if (oldPassenger.length > 0) {
      oldPassenger.forEach((item) => {
        selectId.push(item.cert_no);
      });
    }
    if (!selected && oldPassenger.length > 0) {
      console.log(oldPassenger);
      oldPassenger.splice(
        oldPassenger.findIndex((item) => item.cert_no === record.cert_no),
        1
      );
      selectId.splice(
        selectId.findIndex((item) => item === record.cert_no),
        1
      );
      sessionStorage.setItem("activePassengerList", JSON.stringify(oldPassenger));
      this.setState({ selectedRowKeys: [...new Set(selectId)] });
    }
    if (selected) {
      selectId.push(record.cert_no);
      oldPassenger.push(record);
      console.log(oldPassenger);
      sessionStorage.setItem("activePassengerList", JSON.stringify(oldPassenger));
      this.setState({ selectedRowKeys: [...new Set(selectId)] });
    }
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
  async submitPassengerModal() {
    let selectPassenger = sessionStorage.getItem("activePassengerList")
      ? JSON.parse(sessionStorage.getItem("activePassengerList"))
      : [];

    let commonlyList = this.state.commonlyContact; // 常用乘客

    let activePassenger = [];
    selectPassenger.forEach((item) => {
      activePassenger.push(item);
    });

    commonlyList.forEach((item) => {
      item["checked"] = selectPassenger.find((oitem) => {
        return item.cert_no === oitem.cert_no;
      });
    });
    if (activePassenger.length < 1) {
      activePassenger = [defaultPassenger];
    }

    await this.setState({
      selectContactList: [...new Set(activePassenger)],
      isPassengerModal: false,
      selectedRowKeys: [],
    });
    await this.statsPriceTotal();
  }

  // 打开新增乘客界面
  addNewPassenger() {
    let data = {
      name: "",
      birthday: "",
      phone: "",
      email: "",
      cert_type: "身份证",
      cert_no: "",
      group_id: null,
      remark: "",
    };
    this.setState({
      passengerActive: "add",
      newPassenger: data,
    });
  }

  // 新增乘客输入框
  inputNewPassenger = (label, val) => {
    let data = this.state.newPassenger;
    data[label] = val.target.value;
    this.setState({
      newPassenger: data,
    });
  };
  // 新增乘客选择器
  selectNewPassenger = (label, val) => {
    let data = this.state.newPassenger;
    data[label] = val;
    this.setState({
      newPassenger: data,
    });
  };

  // 新增乘客提交
  submitNewPassenger() {
    let data = JSON.parse(JSON.stringify(this.state.newPassenger));
    if (!data.cert_no || !data.email || !data.name || !data.phone || !data.birthday) {
      return message.warning("请完整乘客信息");
    }

    data["nationality"] = "CN";
    data["sex"] = parseInt(data.cert_no.substr(16, 1)) % 2 === 1 ? 1 : 0;
    data["birthday"] = this.$moment(data.birthday).format("YYYY-MM-DD");

    console.log(data);

    this.$axios.post("/api/passenger/add", data).then((res) => {
      if (res.errorcode === 10000) {
        message.success("添加成功");
        this.getContactList();
        this.setState({
          passengerActive: "contact",
        });
      } else {
        message.warning(res.msg);
      }
    });
  }

  // 联系人信息输入
  changeContacts = (name, val) => {
    let data = this.state.contactsMessage;
    data[name] = val.target.value;
    this.setState({
      contactsMessage: data,
    });
  };

  // 保险选择
  insuranceSelect = async (val) => {
    console.log(val);
    await this.state.insuranceList.forEach((item) => {
      if (item.id === val) {
        this.setState({
          selectInsurance: item,
        });
      }
    });
    await this.statsPriceTotal();
  };

  // 计算价格明细
  async statsPriceTotal() {
    let passenger = JSON.parse(JSON.stringify(this.state.selectContactList));

    let data = {
      adtNumber: 0, // 成人数量
      chdNumber: 0, // 儿童数量
      infNumber: 0, // 婴儿数量
      insureNumber: 0, // 购买保险人数
      totalPrice: 0, // 总价
    };

    passenger.forEach((item) => {
      data.adtNumber += item.userType === "ADT";
      data.chdNumber += item.userType === "CHD";
      data.infNumber += item.userType === "INF";
      data.insureNumber = item.IsInsure ? data.insureNumber + 1 : data.insureNumber;
    });

    data.totalPrice =
      data.adtNumber * this.state.reserveMessage.ItineraryInfo.cabinPrices.ADT.price +
      data.adtNumber * this.state.reserveMessage.ItineraryInfo.cabinPrices.ADT.build +
      data.chdNumber * this.state.reserveMessage.ItineraryInfo.cabinPrices.CHD.price +
      data.insureNumber * (Number(this.state.selectInsurance.sell_price) || 0) +
      data.infNumber * this.state.reserveMessage.ItineraryInfo.cabinPrices.INF.price -
      data.adtNumber *
        this.state.reserveMessage.ItineraryInfo.cabinPrices.ADT.rulePrice.reward;

    console.log(data);
    this.setState({
      passengerTypeNumber: data,
    });
  }

  // 预定下单按钮
  submitOrderBtn() {
    let passengers = [];

    this.state.selectContactList.forEach((item) => {
      passengers.push({
        PassengerName: item.name,
        PassengerType: item.userType,

        Gender: parseInt(item.cert_no.substr(16, 1)) % 2 === 1 ? "F" : "M",
        Birthday: item.birthday,
        Credential:
          item.cert_type === "身份证"
            ? "0"
            : item.cert_type === "护照"
            ? "1"
            : item.cert_type === "港澳通行证"
            ? "2"
            : item.cert_type === "台胞证"
            ? "3"
            : item.cert_type === "回乡证"
            ? "4"
            : item.cert_type === "台湾通行证"
            ? "5"
            : item.cert_type === "入台证"
            ? "6"
            : item.cert_type === "国际海员证"
            ? "7"
            : item.cert_type === "其他证件"
            ? "8"
            : "",
        CredentialNo: item.cert_no,
        Phone: item.phone,
        IsInsure: item.IsInsure ? 1 : 0,
      });
    });

    let newContacts = {
      name: this.state.contactsMessage.role_name,
      phone: this.state.contactsMessage.phone,
    };

    let data = {
      keys: this.state.orderKey,
      insurance_id: this.state.selectInsurance.id || 0,
      contacts: newContacts,
      passengers: passengers,
    };

    this.$axios.post("/api/insert/order", data).then((res) => {
      if (res.errorcode === 10000) {
        this.props.history.push(`/inlandDetail?detail=${res.data[0].order_no}`);
      }
    });
  }

  // 重选航班按钮
  returnSearchAir() {
    let data = this.state.reserveMessage.segments[0];
    let url = `/flightList?start=${data.depAirport}&startAddress=${
      data.depAirport_CN.province + "(" + data.depAirport + ")"
    }&end=${data.arrAirport}&endAddress=${
      data.arrAirport_CN.province + "(" + data.arrAirport + ")"
    }&date=${this.$moment(data.departure_time).format("YYYY-MM-DD")}`;

    console.log(url);

    this.props.history.push(encodeURI(url));
  }

  render() {
    const { selectedRowKeys } = this.state;

    const rowSelection = {
      selectedRowKeys,
      hideSelectAll: true,
      onSelect: this.onInvertChange,
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
                    <div
                      className={["contact_checked", item.checked ? "active" : ""].join(
                        " "
                      )}
                      onClick={() => this.checkedContact(item, index)}
                      key={index}
                    >
                      {item.name
                        ? item.name
                        : `${item.en_last_name} ${item.en_first_name}`}
                    </div>
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

                  <div className="passenger_insurance">
                    <p>是否购买保险</p>
                    <Switch
                      checked={item.IsInsure}
                      onChange={this.editPassengerSelect.bind(this, "IsInsure", index)}
                    />
                  </div>

                  <div
                    className="remove_passenger"
                    onClick={() => this.removePassenger(item, index)}
                  ></div>
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
                          <Option value="ADT">成人</Option>
                          <Option value="CHD">儿童</Option>
                          <Option value="INF">婴儿</Option>
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
                          style={{ width: 200 }}
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
              <div className="box_list">
                <div className="list_title">姓名</div>
                <div className="list_input">
                  <Input
                    placeholder="联系人姓名"
                    value={this.state.contactsMessage.role_name}
                    onChange={this.changeContacts.bind(this, "role_name")}
                  ></Input>
                </div>
              </div>
              <div className="box_list">
                <div className="list_title">手机</div>
                <div className="list_input">
                  <Input
                    placeholder="联系人手机"
                    value={this.state.contactsMessage.phone}
                    onChange={this.changeContacts.bind(this, "phone")}
                  ></Input>
                </div>
              </div>
              <div className="box_list">
                <div className="list_title">{/* 邮箱 */}</div>
                <div className="list_input">
                  {/* <Input
                    placeholder="联系人邮箱"
                    value={this.state.contactsMessage.phone}
                    onChange={this.changeContacts.bind(this, "phone")}
                  ></Input> */}
                </div>
              </div>
            </div>
            <div className="contact_box">
              <div className="box_list">
                <div className="list_title">备注</div>
                <div className="list_input">
                  <TextArea
                    autoSize={{ minRows: 3, maxRows: 5 }}
                    placeholder="添加备注"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 保险服务 */}
          <div className="template_main insurance_main">
            <div className="main_title">
              <p>保险服务</p>
            </div>

            <div className="insurance_box">
              <p className="insurance_tips">如乘机人存在多个航段，多个航段将全部购保险</p>
              <div className="box_select">
                <div className="select_title">选择保险</div>

                <Select
                  style={{ width: 300 }}
                  placeholder="请选择保险"
                  onChange={this.insuranceSelect}
                >
                  {this.state.insuranceList.map((item) => (
                    <Option key={item.id} value={item.id}>
                      {item.insure_desc}
                    </Option>
                  ))}
                </Select>
              </div>

              <div className="insurance_price">
                <span>&yen;</span>
                {this.state.selectInsurance.sell_price || 0}
                <p>/份</p>
              </div>
            </div>
          </div>

          {/* 订单提交 */}
          <div className="template_main submit_main">
            <Button className="return_flight_btn" onClick={() => this.returnSearchAir()}>
              重选航班
            </Button>
            <Button
              type="primary"
              className="submit_btn"
              onClick={() => this.submitOrderBtn()}
            >
              提交订单
            </Button>
          </div>
        </div>
        {/* 航班信息版块 */}
        <div className="scheduled_message">
          <div className="message_box">
            <div className="box_title">航班信息</div>
            <div className="flight_info">
              <div className="info_title">
                <div className="info_type">
                  {this.state.reserveMessage.segments
                    ? this.state.reserveMessage.segments.length === 1
                      ? "单程"
                      : "往返"
                    : ""}
                </div>
                <div className="info_time">
                  {this.state.reserveMessage.segments
                    ? `${this.$moment(
                        this.state.reserveMessage.segments[0].depTime
                      ).format("YYYY-MM-DD")} ${this.$moment(
                        this.state.reserveMessage.segments[0].depTime
                      ).format("ddd")}`
                    : ""}
                </div>
                <div className="info_address">
                  {this.state.reserveMessage.segments
                    ? `${this.state.reserveMessage.segments[0].depAirport_CN.province}-${
                        this.state.reserveMessage.segments[
                          this.state.reserveMessage.segments.length - 1
                        ].arrAirport_CN.province
                      }`
                    : ""}
                </div>
              </div>

              <div className="info_content">
                <div className="content_address">
                  {this.state.reserveMessage.segments
                    ? `${this.$moment(
                        this.state.reserveMessage.segments[0].depTime
                      ).format("HH:mm")}`
                    : ""}
                </div>

                <img src={TicketImage} alt="航班飞行图标" />

                <div className="content_address">
                  {this.state.reserveMessage.segments
                    ? `${this.$moment(
                        this.state.reserveMessage.segments[0].arrTime
                      ).format("HH:mm")}`
                    : ""}
                </div>
              </div>
              <div className="info_address">
                <p>
                  {this.state.reserveMessage.segments
                    ? `${this.state.reserveMessage.segments[0].depAirport_CN.province}
                          ${this.state.reserveMessage.segments[0].depAirport_CN.air_port_name}
                          ${this.state.reserveMessage.segments[0].depTerminal}`
                    : ""}
                </p>
                <p>
                  {this.state.reserveMessage.segments
                    ? `${
                        this.state.reserveMessage.segments[
                          this.state.reserveMessage.segments.length - 1
                        ].arrAirport_CN.province
                      }
                          ${
                            this.state.reserveMessage.segments[
                              this.state.reserveMessage.segments.length - 1
                            ].arrAirport_CN.air_port_name
                          }
                          ${
                            this.state.reserveMessage.segments[
                              this.state.reserveMessage.segments.length - 1
                            ].arrTerminal
                          }`
                    : ""}
                </p>
              </div>

              <div
                className="info_segment_message"
                style={{ display: this.state.showSegment ? "block" : "none" }}
              >
                <div className="segment_message_line"></div>
                <div className="segment_title">
                  <div className="middle_icon">
                    <img
                      src={
                        this.$url +
                        (this.state.reserveMessage.segments
                          ? this.state.reserveMessage.segments[0].image
                          : "")
                      }
                      alt=""
                    />
                  </div>
                  <div className="middle_fly_type">
                    {this.state.reserveMessage.segments
                      ? this.state.reserveMessage.segments[0].airline_CN
                      : ""}
                  </div>

                  <div className="middle_fly_modal">
                    <AircraftTypePopover
                      aircraftTypeData={
                        this.state.reserveMessage.segments
                          ? this.state.reserveMessage.segments[0]
                          : {}
                      }
                    ></AircraftTypePopover>
                  </div>

                  <div className="middle_fly_cabin">
                    {` ${
                      this.state.reserveMessage.ItineraryInfo
                        ? this.state.reserveMessage.ItineraryInfo.cabinInfo.cabinDesc
                        : ""
                    } 
                    ${
                      this.state.reserveMessage.ItineraryInfo
                        ? this.state.reserveMessage.ItineraryInfo.cabinInfo.cabinCode
                        : ""
                    }`}
                  </div>
                </div>

                <div className="segment_content">
                  <div className="open_left">
                    <div className="left_div">
                      <div className="open_left_date">
                        <span>
                          {this.$moment(
                            this.state.reserveMessage.segments
                              ? this.state.reserveMessage.segments[0].depTime
                              : ""
                          ).format("MM-DD")}
                        </span>
                        <p>
                          {this.$moment(
                            this.state.reserveMessage.segments
                              ? this.state.reserveMessage.segments[0].depTime
                              : ""
                          ).format("HH:mm")}
                        </p>
                      </div>
                      <div className="open_left_date">
                        <span>
                          {this.$moment(
                            this.state.reserveMessage.segments
                              ? this.state.reserveMessage.segments[0].arrTime
                              : ""
                          ).format("MM-DD")}
                        </span>
                        <p>
                          {this.$moment(
                            this.state.reserveMessage.segments
                              ? this.state.reserveMessage.segments[0].arrTime
                              : ""
                          ).format("HH:mm")}
                        </p>
                      </div>
                    </div>
                    <div className="left_icon"></div>
                    <div className="left_div">
                      <div className="open_left_address">
                        {`${
                          this.state.reserveMessage.segments
                            ? this.state.reserveMessage.segments[0].depAirport
                            : ""
                        }
                        ${
                          this.state.reserveMessage.segments
                            ? this.state.reserveMessage.segments[0].depAirport_CN
                                .city_name
                            : ""
                        }
                        ${
                          this.state.reserveMessage.segments
                            ? this.state.reserveMessage.segments[0].depAirport_CN
                                .air_port_name
                            : ""
                        }机场
                        ${
                          this.state.reserveMessage.segments
                            ? this.state.reserveMessage.segments[0].depTerminal
                            : ""
                        }`}
                      </div>
                      <div className="open_left_address">
                        {`${
                          this.state.reserveMessage.segments
                            ? this.state.reserveMessage.segments[0].arrAirport
                            : ""
                        }
                        ${
                          this.state.reserveMessage.segments
                            ? this.state.reserveMessage.segments[0].arrAirport_CN
                                .city_name
                            : ""
                        }
                         ${
                           this.state.reserveMessage.segments
                             ? this.state.reserveMessage.segments[0].arrAirport_CN
                                 .air_port_name
                             : ""
                         }机场
                         ${
                           this.state.reserveMessage.segments
                             ? this.state.reserveMessage.segments[0].arrTerminal
                             : ""
                         }`}
                      </div>
                    </div>
                  </div>

                  <div className="open_right">
                    <div className="right_icon"></div>
                    <div className="right_consume">
                      {Math.floor(
                        (this.state.reserveMessage.segments
                          ? this.state.reserveMessage.segments[0].duration
                          : "") / 60
                      ) +
                        "h" +
                        ((this.state.reserveMessage.segments
                          ? this.state.reserveMessage.segments[0].duration
                          : "") %
                          60) +
                        "m"}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className="info_more_message_btn"
                onClick={() =>
                  this.setState({
                    showSegment: !this.state.showSegment,
                  })
                }
              >
                {this.state.showSegment ? "收起" : "展开"}
              </div>
            </div>
          </div>

          {/* 退改信息 */}
          <div className="baggage_info">
            <RefundsAndChangesPopover
              refundsAndChangesData={
                this.state.reserveMessage.ItineraryInfo
                  ? this.state.reserveMessage.ItineraryInfo.ruleInfos
                  : {}
              }
            ></RefundsAndChangesPopover>
            <p>
              行李额
              {this.state.reserveMessage.ItineraryInfo
                ? this.state.reserveMessage.ItineraryInfo.cabinInfo.baggage_config
                : 0}
              KG
            </p>
          </div>

          <div className="message_box">
            <div className="box_title">价格明细</div>
            <div className="price_message">
              <div className="message_list">
                <p>成人票价</p>
                <p>
                  &yen;{" "}
                  {this.state.reserveMessage.ItineraryInfo
                    ? this.state.reserveMessage.ItineraryInfo.cabinPrices.ADT.price
                    : 0 || 0}{" "}
                  x {this.state.passengerTypeNumber.adtNumber || 0}
                </p>
              </div>
              <div className="message_list">
                <p>儿童票价</p>
                <p>
                  &yen;{" "}
                  {this.state.reserveMessage.ItineraryInfo
                    ? this.state.reserveMessage.ItineraryInfo.cabinPrices.CHD.price
                    : 0 || 0}{" "}
                  x {this.state.passengerTypeNumber.chdNumber || 0}
                </p>
              </div>
              <div className="message_list">
                <p>婴儿票价</p>
                <p>
                  &yen;{" "}
                  {this.state.reserveMessage.ItineraryInfo
                    ? this.state.reserveMessage.ItineraryInfo.cabinPrices.INF.price
                    : 0 || 0}{" "}
                  x {this.state.passengerTypeNumber.infNumber || 0}
                </p>
              </div>
              <div className="message_list">
                <p>机建</p>
                <p>
                  &yen;{" "}
                  {this.state.reserveMessage.ItineraryInfo
                    ? this.state.reserveMessage.ItineraryInfo.cabinPrices.ADT.build
                    : 0 || 0}{" "}
                  x {this.state.passengerTypeNumber.adtNumber || 0}
                </p>
              </div>
              <div className="message_list">
                <p>保险</p>
                <p>
                  &yen; {this.state.selectInsurance.sell_price || 0} x{" "}
                  {this.state.passengerTypeNumber.insureNumber || 0}
                </p>
              </div>
              <div className="message_list">
                <p>服务费</p>
                <p>
                  &yen;{" "}
                  {this.state.reserveMessage.ItineraryInfo
                    ? this.state.reserveMessage.ItineraryInfo.cabinPrices.INF.service
                    : 0 || 0}{" "}
                  x {this.state.passengerTypeNumber.infNumber || 0}
                </p>
              </div>
              <div className="message_list">
                <p>奖励金</p>
                <p>
                  &yen;{" "}
                  {this.state.reserveMessage.ItineraryInfo
                    ? this.state.reserveMessage.ItineraryInfo.cabinPrices.ADT.rulePrice
                        .reward
                    : 0 || 0}{" "}
                  x {this.state.passengerTypeNumber.adtNumber || 0}
                </p>
              </div>

              <div className="message_total_Price">
                共计 <span>&yen;</span>{" "}
                <p>{this.state.passengerTypeNumber.totalPrice || 0}</p>
              </div>
            </div>
          </div>
        </div>

        <Modal
          title="乘机人弹窗"
          getContainer={false}
          className="passenger_modal"
          visible={this.state.isPassengerModal}
          footer={false}
          keyboard={false}
          maskClosable={false}
          centered
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
              onClick={() => this.addNewPassenger()}
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
                  rowKey={(record) => record.cert_no}
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
                  pageSize={5}
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
            >
              <div className="add_title">基本信息</div>
              <div className="add_list">
                <div className="list_item">
                  <p>姓名</p>
                  <div>
                    <Input
                      onChange={this.inputNewPassenger.bind(this, "name")}
                      value={this.state.newPassenger.name}
                      placeholder="请输入姓名"
                    ></Input>
                  </div>
                </div>
                <div className="list_item">
                  <p>出生日期</p>
                  <div>
                    <DatePicker
                      style={{ width: "100%" }}
                      allowClear={false}
                      showToday={false}
                      placeholder="出生日期"
                      value={this.state.newPassenger.birthday}
                      onChange={this.selectNewPassenger.bind(this, "birthday")}
                    />
                  </div>
                </div>
              </div>
              <div className="add_list">
                <div className="list_item">
                  <p>分组</p>
                  <div>
                    <Select
                      onChange={this.selectNewPassenger.bind(this, "group_id")}
                      placeholder="请选择分组"
                      value={this.state.newPassenger.group_id}
                      style={{ width: "100%" }}
                    >
                      {this.state.groupList.map((item) => (
                        <Option key={item.id} value={item.id}>
                          {item.group_name}
                        </Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="list_item">
                  <p>手机号</p>
                  <div>
                    <Input
                      onChange={this.inputNewPassenger.bind(this, "phone")}
                      value={this.state.newPassenger.phone}
                      placeholder="请输入手机号"
                    ></Input>
                  </div>
                </div>
              </div>
              <div className="add_list">
                <div className="list_item">
                  <p>证件</p>
                  <div>
                    <Select
                      onChange={this.selectNewPassenger.bind(this, "cert_type")}
                      value={this.state.newPassenger.cert_type}
                      style={{ width: "100%" }}
                    >
                      <Option value="身份证">身份证</Option>
                      <Option value="护照">护照</Option>
                      <Option value="其他证件">其他证件</Option>
                    </Select>
                  </div>
                </div>
                <div className="list_item">
                  <p>证件号</p>
                  <div>
                    <Input
                      onChange={this.inputNewPassenger.bind(this, "cert_no")}
                      value={this.state.newPassenger.cert_no}
                      placeholder="请输入证件号"
                    ></Input>
                  </div>
                </div>
              </div>
              <div className="add_list">
                <div className="list_item" style={{ width: "50%" }}>
                  <p>邮箱</p>
                  <div>
                    <Input
                      onChange={this.inputNewPassenger.bind(this, "email")}
                      value={this.state.newPassenger.email}
                      placeholder="请输入邮箱"
                    ></Input>
                  </div>
                </div>
              </div>
              <div className="add_list add_remarks">
                <div className="list_item">
                  <p>备注</p>
                  <div>
                    <Input
                      onChange={this.inputNewPassenger.bind(this, "remark")}
                      value={this.state.newPassenger.remark}
                      placeholder="请填写备注"
                    ></Input>
                  </div>
                </div>
              </div>

              <div className="box_option">
                <Button onClick={() => this.setState({ passengerActive: "contact" })}>
                  取消
                </Button>
                <Button type="primary" onClick={() => this.submitNewPassenger()}>
                  确定
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      </div>
    );
  }
}
