/*
 * @Description: 城市选择弹窗 组件
 * @Author: wish.WuJunLong
 * @Date: 2021-04-08 10:39:43
 * @LastEditTime: 2021-04-08 10:57:04
 * @LastEditors: wish.WuJunLong
 */

import React, { Component } from "react";

import { Modal, Tabs } from "antd";

import "./SelectCity.scss";

const { TabPane } = Tabs;

export default class index extends Component {
  selectAir(val, type) {
    this.props.selectAir(val, type);
  }
  render() {
    return (
      <Modal
        title={false}
        mask={false}
        maskClosable={false}
        keyboard={false}
        getContainer={false}
        closable={false}
        footer={null}
        visible={this.props.cityModal}
        onCancel={() => this.props.closeAirModal()}
        width="670px"
        wrapClassName="select_city_modal"
      >
        <div className="citySelectModal">
          <div className="citySelectModal__header">
            <div className="citySelectModal__header__title">
              <span>支持中文/拼音/简拼/三字输入</span>
              <div
                className="citySelectModal__header__title__closeBtn"
                onClick={() => this.props.closeAirModal()}
              ></div>
            </div>
          </div>

          <div className="citySelectModal__cityChecked">
            <Tabs tabPosition="left" tabBarGutter={0}>
              <TabPane tab="热门城市" key="hot">
                <div className="city_list_box">
                  {this.props.hotCity.map((item) => (
                    <div
                      className="city_list"
                      key={item.id}
                      onClick={() => this.selectAir(item, this.props.airType)}
                    >
                      {item.city_name}
                    </div>
                  ))}
                </div>
              </TabPane>

              {this.props.cityList.map((item) => (
                <TabPane tab={item.unit} key={item.unit}>
                  <div className="city_list_box">
                    {item.data.map((oitem) => (
                      <div className="city_list_main" key={oitem.unit}>
                        <span>{oitem.unit}</span>

                        {oitem.data.map((pitem) => (
                          <div
                            className="city_list"
                            key={pitem.id}
                            onClick={() => this.selectAir(pitem, this.props.airType)}
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
    );
  }
}
