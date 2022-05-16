/*
 * @Description: 警告弹窗
 * @Author: wish.WuJunLong
 * @Date: 2021-04-09 17:42:35
 * @LastEditTime: 2021-04-16 10:51:06
 * @LastEditors: mzr
 */
import React, { Component } from "react";

import { Button, Input, Modal } from "antd";

import BlueWarn from "../../static/warn_blue.png";

import "./WarningModal.scss";

export default class index extends Component {

 
  // 输入框内容
  changeInput = (val) => {
    this.props.changeModalInput(val.target.value)
  }

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
        title={this.props.modalInput?'取消原因':''}
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
              this.props.modalSubmit(this.props.modalInputMessage);
            }}
          >
            确定
          </Button>,
        ]}
      >
        {this.props.modalInput ? (
          <div className="modal_input">
            <Input 
              onChange={this.changeInput} 
              placeholder={this.props.modalInputDesc} 
              value={this.props.modalInputMessage}/>
          </div>
        ) : (
          <div className="modal_content">
            <div className="middle_warn">
              <img src={BlueWarn} alt="警告图标" />
            </div>
            <p>{this.props.modalMessage || ''}</p>
          </div>
        )}
      </Modal>
    );
  }
}
