/*
 * @Description: 机票搜索
 * @Author: wish.WuJunLong
 * @Date: 2021-01-12 14:07:43
 * @LastEditTime: 2021-02-03 15:47:46
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import "./flightSearch.scss";

import { Radio, Select, message, Modal, Tabs } from "antd";
const { Option } = Select;
const { TabPane } = Tabs;

let timeout;
let currentValue;

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      checkActive: "inland", // 机票状态 inland 国内查询，inter 国际查询
      flightType: 0, // 机票查询状态 0 单程，1 往返，2 多程

      searchCity: {
        startAir: "",
      }, // 城市搜索
      searchCityList: [], // 城市搜索框返回值列表

      cityModal: false, // 城市弹窗

      cityList: [], // 城市列表
      hotCity: [], // 热门城市列表
      cityUnitList: [...Array(26).keys()].map((i) => String.fromCharCode(i + 65)), // 生成A-Z数组
    };
  }

  async componentDidMount() {
    this.getAirList();
  }

  // 国内国际机票切换
  checkFightType(e) {
    this.setState({
      checkActive: e,
    });
  }
  // 单程往返多程切换
  changeFlightType = (e) => {
    console.log("航班状态切换", e.target.value);
    this.setState({ flightType: e.target.value });
  };

  // 出发城市选择器
  selectFromCity = (e) => {
    console.log(e);
    this.setState({ searchCity: e });
  };
  // 城市搜索框
  selectCitySearch = async (e) => {
    console.log("搜索框", e);
    if (e) {
      await this.setState({ searchCity: e, cityModal: false });
      await this.fetch(e, (searchCityList) => {
        console.log(searchCityList);
        this.setState({ searchCityList });
      });
    } else {
      this.setState({ searchCityList: [] });
    }
  };
  // 城市三字码搜索
  fetch(val, callback) {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
    currentValue = val;
    let _that = this;
    function fake() {
      let data = {
        key: val,
        range: "CN",
      };
      _that.$axios.get("/api/searchAirs", { params: data }).then((res) => {
        console.log(res.data);
        if (res.errorcode === 10000) {
          if (currentValue === val) {
            callback(res.data);
          }
        } else {
          message.warning(res.message);
        }
      });
    }
    timeout = setTimeout(fake, 500);
  }
  // 出发城市选择框失去焦点
  clearFromCity = () => {
    this.setState({ searchCityList: [] });
  };

  // 城市选择器获取焦点时
  openCityModal = async () => {
    await this.setState({ cityModal: true });
  };

  // 获取机场列表
  async getAirList() {
    let data = {
      range: "CN",
    };

    await this.$axios.get("/api/getAirList", { params: data }).then((res) => {
      let cityAirList = res;
      let hotCity = [];
      let cityList = [];
      // 热门城市组装
      cityAirList.forEach((item) => {
        if (
          item.air_port_name === "首都" ||
          item.city_name === "重庆" ||
          item.city_name === "成都" ||
          item.city_name === "广州" ||
          item.city_name === "上海" ||
          item.city_name === "杭州" ||
          item.city_name === "乌鲁木齐" ||
          item.city_name === "深圳"
        ) {
          hotCity.push(item);
        }
      });

      // 城市首字母组装
      let unitCityList = [];
      this.state.cityUnitList.forEach((item, index) => {
        unitCityList.push({
          unit: "",
          data: [],
        });
        cityAirList.forEach((oitem) => {
          if (
            String(oitem.city_ename[0]).toUpperCase() === item &&
            oitem.air_port !== "MY2" &&
            item
          ) {
            unitCityList[index]["unit"] = item;
            unitCityList[index]["data"].push(oitem);
          }
        });
      });

      console.log(unitCityList);

      // 组装首字母数组
      let A = "ABCDEF";
      let G = "GHIJ";
      let K = "KLMN";
      let P = "PQRSTUVW";
      let X = "XYZ";

      let AList = [];
      let GList = [];
      let KList = [];
      let PList = [];
      let XList = [];

      unitCityList.forEach((item, index) => {
        if (index < A.length && item.unit) {
          AList.push(item);
        }
        if (index < G.length + A.length && index >= A.length && item.unit) {
          GList.push(item);
        }
        if (
          index < K.length + A.length + G.length &&
          index >= G.length + A.length &&
          item.unit
        ) {
          KList.push(item);
        }
        if (
          index <= P.length + A.length + G.length + K.length &&
          index >= K.length + A.length + G.length &&
          item.unit
        ) {
          PList.push(item);
        }
        if (
          index <= X.length + A.length + G.length + K.length + P.length &&
          index > P.length + A.length + G.length + K.length &&
          item.unit
        ) {
          XList.push(item);
        }
      });

      cityList.push(
        {
          unit: A,
          data: AList,
        },
        {
          unit: G,
          data: GList,
        },
        {
          unit: K,
          data: KList,
        },
        {
          unit: P,
          data: PList,
        },
        {
          unit: X,
          data: XList,
        }
      );

      this.setState({
        hotCity: hotCity,
        cityList: cityList,
      });

      console.log(this.state.cityList);
    });
  }

  // 获取选中城市数据
  selectAir(val,label) {
    let data = this.state.searchCity

    data[label] = val.city_name + `(${val.city_code})`

    this.setState({
      searchCity: data,
      cityModal: false 
    })
  }

  render() {
    return (
      <div className="flightSearch">
        <div className="flightSearch__header">
          <div className="flightSearch__header__checkbox">
            <div
              className="flightSearch__header__checkbox__slider"
              style={{
                left: this.state.checkActive === "inland" ? "3px" : "calc(50% - 3px)",
              }}
            ></div>
            <div
              className={`flightSearch__header__checkbox__checkboxBtn ${
                this.state.checkActive === "inland" ? "active" : null
              }`}
              onClick={() => this.checkFightType("inland")}
            >
              国内机票
            </div>
            <div
              className={`flightSearch__header__checkbox__checkboxBtn ${
                this.state.checkActive === "inter" ? "active" : null
              }`}
              onClick={() => this.checkFightType("inter")}
            >
              国际机票
            </div>
          </div>
        </div>

        <div className="flightSearch__main">
          <div className="flightSearch__main__list">
            <div className="flightSearch__main__list__item">
              <div className="flightSearch__main__list__item__title">航班类型</div>
              <div className="flightSearch__main__list__item__input">
                <Radio.Group
                  onChange={this.changeFlightType}
                  value={this.state.flightType}
                >
                  <Radio value={0}>单程</Radio>
                  <Radio value={1}>往返</Radio>
                </Radio.Group>
              </div>
            </div>
          </div>
          <div className="flightSearch__main__list">
            <div className="flightSearch__main__list__item">
              <div className="flightSearch__main__list__item__title">起飞城市</div>
              <div className="flightSearch__main__list__item__input">
                <Select
                  showSearch
                  labelInValue
                  style={{ width: "200px" }}
                  placeholder="请选择"
                  optionLabelProp="label"
                  defaultActiveFirstOption={false}
                  showArrow={false}
                  filterOption={false}
                  onSearch={this.selectCitySearch}
                  onChange={this.selectFromCity}
                  notFoundContent={null}
                  value={{ value: this.state.searchCity.startAir }}
                  onBlur={this.clearFromCity}
                  onFocus={this.openCityModal}
                >
                  {this.state.searchCityList.map((e) => (
                    <Option
                      value={e.city_code}
                      label={e.city_name + `(${e.city_code})`}
                      key={e.id}
                    >
                      <div className="search_city_message">
                        <span>{e.province}</span>
                        <span>{e.air_port_name}</span>
                        <span>{e.city_code}</span>
                      </div>
                    </Option>
                  ))}
                </Select>
                <Modal
                  title={false}
                  mask={false}
                  maskClosable={false}
                  keyboard={false}
                  getContainer={false}
                  closable={false}
                  footer={null}
                  visible={this.state.cityModal}
                  onCancel={() => this.setState({ cityModal: false })}
                  width="640px"
                >
                  <div className="citySelectModal">
                    <div className="citySelectModal__header">
                      <div className="citySelectModal__header__title">
                        <span>支持中文/拼音/简拼/三字输入</span>
                        <div
                          className="citySelectModal__header__title__closeBtn"
                          onClick={() => this.setState({ cityModal: false })}
                        ></div>
                      </div>
                    </div>

                    <div className="citySelectModal__cityChecked">
                      <Tabs tabPosition="left" tabBarGutter={0}>
                        <TabPane tab="热门城市" key="hot">
                          <div className="city_list_box">
                            {this.state.hotCity.map((item) => (
                              <div
                                className="city_list"
                                key={item.id}
                                onClick={() => this.selectAir(item,'startAir')}
                              >
                                {item.city_name}
                              </div>
                            ))}
                          </div>
                        </TabPane>

                        {this.state.cityList.map((item) => (
                          <TabPane tab={item.unit} key={item.unit}>
                            <div className="city_list_box">
                              {item.data.map((oitem) => (
                                <div key={oitem.unit}>
                                  <span>{oitem.unit}</span>

                                  {oitem.data.map((pitem) => (
                                    <div
                                      className="city_list"
                                      key={pitem.id}
                                      onClick={() => this.selectAir(pitem,'startAir')}
                                    >
                                      {pitem.city_name}
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </div>
                          </TabPane>
                        ))}
                      </Tabs>
                    </div>
                  </div>
                </Modal>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}