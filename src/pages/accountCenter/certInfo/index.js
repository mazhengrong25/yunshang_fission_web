/*
 * @Description: 个人中心---证件信息
 * @Author: mzr
 * @Date: 2021-03-05 14:37:15
 * @LastEditTime: 2021-03-09 17:26:07
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import { Button, Modal, Select, DatePicker, Input } from 'antd';

import './certInfo.scss'

import modalColse from '../../../static/modalColse.png'

const { Option } = Select;

export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
          
           showModal: false, //添加证件弹出
        }
    }

    // 添加证件弹窗
    addCert = () => {
        this.setState({
            showModal : true
        })
    }
    render() {
        return (
            <div className="certInfo">
                <div className="certInfo_content_div">
                    <div className="cerInfo_div_title">证件信息</div>
                    {/* 证件列表 */}
                    <div className="cerInfo_div_item">
                        <div className="card_item">
                            <div className="card_photo"></div>
                            <div className="card_right">
                                <p>身份证</p>
                                <span>证件号：511325199404130000</span>
                                <span>有效期至：2026-03-12</span>
                                <span>国籍：CN</span>
                            </div>
                        </div>
                        <div className="card_item">
                            <div className="card_photo"></div>
                            <div className="card_right">
                                <p>身份证</p>
                                <span>证件号：511325199404130000</span>
                                <span>有效期至：2026-03-12</span>
                                <span>国籍：CN</span>
                            </div>
                        </div>
                        <div className="card_item">
                            <div className="card_photo"></div>
                            <div className="card_right">
                                <p>身份证</p>
                                <span>证件号：511325199404130000</span>
                                <span>有效期至：2026-03-12</span>
                                <span>国籍：CN</span>
                            </div>
                        </div>
                        <div className="card_item">
                            <div className="card_photo"></div>
                            <div className="card_right">
                                <p>身份证</p>
                                <span>证件号：511325199404130000</span>
                                <span>有效期至：2026-03-12</span>
                                <span>国籍：CN</span>
                            </div>
                        </div>
                    </div>
                    {/* 按钮 */}
                    <div className="card_button">
                        <Button type="primary" onClick={() => this.addCert()}>添加证件</Button>
                    </div>
                </div>
                {/* 添加证件对话框 */}
                <Modal 
                    title="添加证件"
                    width={920}
                    visible={this.state.showModal}
                    onCancel={() => this.setState({
                        showModal: false
                    })}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>取消</Button>,
                        <Button key="submit" type="primary" onClick={this.handleOk}>保存</Button>,
                    ]}
                >
                    <div className="modal_content">
                        <div className="modal_item">
                            <div className="item_title">证件类型</div>
                            <div className="item_select">
                                <Select 
                                    style={{ width: 200 }}>
                                    <Option value={1}>身份证</Option>
                                    <Option value={2}>护照</Option>
                                    <Option value={3}>港澳通行证</Option>
                                </Select>
                            </div>
                        </div>
                        <div className="modal_item">
                            <div className="item_title">证件号码</div>
                            <div className="item_select">
                                <Input style={{ width: 200 }} placeholder="请输入证件号码" />
                            </div>
                        </div>
                        <div className="modal_item">
                            <div className="item_title">有效期</div>
                            <div className="item_select">
                                <DatePicker style={{ width: 200 }}/>
                            </div>
                            <span><img src={modalColse} alt="关闭"/></span>
                        </div>
                        <div className="modal_item">
                            <div className="item_title">国籍</div>
                            <div className="item_select">
                                <DatePicker style={{ width: 200 }}/>
                            </div>
                        </div>
                        <div className="modal_item">
                            <div className="item_title">签发国</div>
                            <div className="item_select">
                                <DatePicker style={{ width: 200 }}/>
                            </div>
                        </div>
                    </div>
                    <div className="add_cert">+ 添加证件</div>
                </Modal>
            </div>
        )
    }
}
