/*
 * @Description: 警告弹窗
 * @Author: wish.WuJunLong
 * @Date: 2021-04-09 17:42:35
 * @LastEditTime: 2021-04-09 18:03:27
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import { Button, Modal } from "antd";

import BlueWarn from "../../static/warn_blue.png";

import "./WarningModal.scss";

export default class index extends Component {
  render() {
    return (
      <Modal
        width={400}
        centered
        className="warning_modal"
        visible={this.props.modalStatus}
        onCancel={() => {
          this.props.modalClose();
        }}
        footer={[
          <Button
            onClick={() => {
              this.props.modalClose();
            }}
          >
            取消
          </Button>,
          <Button
            type="primary"
            onClick={() => {
              this.props.modalSubmit();
            }}
          >
            确定
          </Button>,
        ]}
      >
        <div className="modal_content">
          <div className="middle_warn">
            <img src={BlueWarn} alt="警告图标" />
          </div>
          <p>{this.props.modalMessage || ''}</p>
        </div>
      </Modal>
    );
  }
}
