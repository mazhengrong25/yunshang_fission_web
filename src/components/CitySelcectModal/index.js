/*
 * @Description:
 * @Author: wish.WuJunLong
 * @Date: 2021-01-13 11:59:43
 * @LastEditTime: 2021-01-13 12:01:36
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import { Modal } from "antd";

export default class index extends Component {

  componentDidMount(){
    this.props.onRef(this)
}
  render() {
    return (
      <Modal
        title={false}
        mask={false}
        maskClosable={false}
        keyboard={false}
        getContainer={false}
        footer={null}
        visible={this.state.cityModal}
        onCancel={() => this.setState({ cityModal: false })}
      >
        <p>Some contents...</p>
        <p>Some contents...</p>
        <p>Some contents...</p>
      </Modal>
    );
  }
}
