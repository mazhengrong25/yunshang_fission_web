/*
 * @Description: 国内订单详情
 * @Author: mzr
 * @Date: 2021-02-04 15:19:50
 * @LastEditTime: 2021-02-07 18:33:53
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import { Checkbox , Table , Radio, Button } from "antd"

import HeaderTemplate from "../../../components/Header"; // 导航栏

import './inlandDetail.scss'
import Column from 'antd/lib/table/Column';

export default class index extends Component {
    render() {
        return (
            <div className="inlandDetail">
                <HeaderTemplate/>
                <div className="content_div">
                    <div className="content_nav">我的订单 &lt; 机票订单 &lt; 订单详情 </div>
                    {/* 订单信息 */}
                    <div className="content_status">
                        <div className="order_space">
                            <div className="order_div">
                                <div className="order_number">订单编号</div>
                                <div className="input_number">54548661457846161313</div>
                                <div className="number_copy"></div>
                            </div>
                            <div style={{ flex:1 }}></div>
                            <div className="order_status">待支付</div>
                        </div>
                        <div className="order_space">
                            <div className="order_div">
                                <div className="order_number">预定人</div>
                                <div className="input_number_crease">赵玲艺</div>
                            </div>
                            <div className="order_div">
                                <div className="order_number">下单时间</div>
                                <div className="input_number_crease">2020-08-19 11:30:52</div>
                            </div>
                            <div className="order_div">
                                <div className="order_number">出差申请单</div>
                                <div className="input_number_crease">
                                    54548661457846161313
                                </div>
                            </div>
                            <div style={{ flex:1 }}></div>
                            <div className="order_div">
                                <div className="order_number">金额</div>
                                <div className="input_number">&yen;394</div>
                            </div>
                        </div>
                    </div>
                    {/* 乘机人信息 */}
                    <div className="content_item">
                        <div className="item_title">乘机人信息</div>
                        <div className="passenger_message">
                            <div className="message_nav">
                                <div className="passenger_number">乘机人1</div>
                                <Checkbox>给该乘机人发送行程通知（短信，邮件）</Checkbox>
                            </div>
                            <div className="message_div">
                                <div className="item_space">
                                    <div className="message_item">
                                        <div className="message_head"></div>
                                        <div className="passenger_name">赵玲艺</div>
                                        <div className="passenger_identity">信息中心</div>
                                    </div>
                                    <div className="div_item">
                                        <div className="div_title">证件:</div>
                                        <div className="div_input">身份证</div>
                                    </div>
                                    <div className="div_item">
                                        <div className="div_title">证件号:</div>
                                        <div className="div_input">511325199404130023</div>
                                    </div>
                                    <div className="div_item">
                                        <div className="div_title">成本中心:</div>
                                        <div className="div_input">云上航空信息技术中心</div>
                                    </div>
                                </div>
                                <div className="item_space">
                                    <div className="div_item">
                                        <div className="div_title">手机:</div>
                                        <div className="div_input">15123826971</div>
                                    </div>
                                    <div className="div_item">
                                        <div className="div_title">邮箱:</div>
                                        <div className="div_input">296324796@qq.com</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* 联系人 */}
                    <div className="content_item">
                        <div className="item_title">联系人</div>
                        <div className="contact_div">
                            <div className="item_space">
                                <div className="div_item">
                                    <div className="div_title">姓名:</div>
                                    <div className="div_input">赵玲艺</div>
                                </div>
                                <div className="div_item">
                                    <div className="div_title">手机:</div>
                                    <div className="div_input">15123826971</div>
                                </div>
                                <div className="div_item">
                                    <div className="div_title">邮箱:</div>
                                    <div className="div_input">296324796@qq.com</div>
                                </div>
                            </div>
                            <div className="item_space">
                                <div className="div_item">
                                    <div className="div_title">备注:</div>
                                    <div className="div_input">无</div>
                                </div>
                            </div>
                            <Checkbox>给该乘机人发送行程通知（短信，邮件）</Checkbox>
                        </div>
                    </div>
                    {/* 保险服务 */}
                    <div className="content_item">
                        <div className="item_title">保险服务</div>
                        <div className="contact_div">
                            <div className="item_space">
                                <div className="div_item">
                                    <div className="div_title">姓名:</div>
                                    <div className="div_input">赵玲艺</div>
                                </div>
                                <div className="div_item">
                                    <div className="div_title">手机:</div>
                                    <div className="div_input">15123826971</div>
                                </div>
                                <div className="div_item">
                                    <div className="div_title">邮箱:</div>
                                    <div className="div_input">296324796@qq.com</div>
                                </div>
                            </div>
                            <div className="item_space">
                                <div className="div_item">
                                    <div className="div_title">备注:</div>
                                    <div className="div_input">无</div>
                                </div>
                            </div>
                            <Checkbox>给该乘机人发送行程通知（短信，邮件）</Checkbox>
                        </div>
                    </div>
                    {/* 价格明细 */}
                    <div className="content_item">
                        <div className="item_title">价格明细</div>
                        <div className="price_div">
                            <Table
                                pagination={false}
                            >
                                <Column title="票价"/>
                                <Column title="机建"/>
                                <Column title="燃油"/>
                                <Column title="保险"/>
                                <Column title="服务费"/>
                                <Column title="共计"/>

                            </Table>
                            <div className="price_button">
                                <Button>返回</Button>
                                <Button>退票</Button>
                                <Button>改签</Button>
                            </div>
                        </div>
                    </div>
                    {/* 支付方式 */}
                    <div className="content_item">
                        <div className="item_title">支付方式</div>
                        <div className="payment_div">
                            <Radio.Group>
                                <Radio value={1}>方式待定</Radio>
                                <Radio value={2}>待定</Radio>
                            </Radio.Group>
                            <div className="payment_button">
                                <Button>取消订单</Button>
                                <Button>立即支付</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
