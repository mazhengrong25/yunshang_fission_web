/*
 * @Description: 退票详情
 * @Author: mzr
 * @Date: 2021-04-12 15:08:44
 * @LastEditTime: 2021-04-12 16:24:54
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import './refundDetail.scss'

import { 
    Breadcrumb 

} from 'antd';
export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
          
        };
      }
    render() {
        return (
            <div className="inland_redund_Detail">
               <div className="content_div">
                    <div className="content_nav">
                        <Breadcrumb separator="<">
                            <Breadcrumb.Item>我的订单</Breadcrumb.Item>
                            <Breadcrumb.Item href="">机票订单</Breadcrumb.Item>
                            <Breadcrumb.Item href="">订单详情</Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    {/* 订单信息 */}
                    <div className="content_status">
                        <div className="order_space">
                            <div className="order_div">
                                <div className="order_number">退票单号</div>
                                <div className="input_number" style={{ fontSize: 18 }}>
                                    2020202104081145483848
                                </div>
                                {/* <div
                                    style={{ display: this.state.detailData.order_no ? "block" : "none" }}
                                    className="number_copy"
                                    onClick={() => this.copyOrderNo(this.state.detailData.order_no)}
                                ></div> */}
                            </div>
                            <div
                                className="order_status"
                            // style={{
                            //     color:
                            //     this.state.detailData.status === 1
                            //         ? "#F36969"
                            //         : this.state.detailData.status === 2
                            //         ? "#5B7CF0"
                            //         : this.state.detailData.status === 3
                            //         ? "#32D197"
                            //         : this.state.detailData.status === 5
                            //         ? "#3A3B50"
                            //         : "",
                            // }}
                            >
                            {/* {this.state.detailData.status !== 0 &&
                            this.state.detailData.status !== 5 &&
                            this.state.detailData.status === 1
                                ? "待支付"
                                : this.state.detailData.status === 1 ||
                                this.state.detailData.status === 2
                                ? "待出票"
                                : this.state.detailData.status === 3
                                ? "已出票"
                                : this.state.detailData.status === 5
                                ? "已取消"
                                : this.state.detailData.status === 1 &&
                                this.state.detailData.left_min < 0
                                ? "已取消"
                                : this.state.detailData.status} */}
                                申请中
                            </div>
                        </div>
                        <div className="order_space">
                        <div className="order_message">
                            <div className="order_div">
                                <div className="order_number">分销商</div>
                                <div className="input_number_crease">
                                   南坪庆洋
                                </div>
                            </div>
                        </div>
                        <div className="order_space"></div>
                        <div className="order_message">
                            <div className="order_div">
                                <div className="order_number">订单PNR</div>
                                <div className="input_number_crease">
                                    KW7WD6
                                </div>
                            </div>
                        </div>
                        <div className="order_space"></div>
                        <div className="order_message">
                            <div className="order_div">
                                <div className="order_number">是否自愿</div>
                                <div className="input_number_crease">
                                    自愿
                                </div>
                            </div>
                        </div>
                        <div className="order_space"></div>
                        <div className="order_message">
                            <div className="order_div">
                                <div className="order_number">退票时间</div>
                                <div className="input_number_crease">
                                    2021-04-08 11:45:49
                                </div>
                            </div>
                        </div>
                    </div>
                    </div>
                    {/* 联系人信息 */}
                    <div className="content_item">
                        <div className="item_title">联系人</div>
                        <div className="contact_div">
                            <div className="item_space">
                                <div className="div_item">
                                    <div className="div_title">姓名:</div>
                                    <div className="div_input">南坪庆洋</div>
                                </div>
                                <div className="div_item">
                                    <div className="div_title">手机:</div>
                                    <div className="div_input">13983913067</div>
                                </div>
                            </div>
                            <div className="item_space">
                                <div className="div_item">
                                    <div className="div_title">备注:</div>
                                    <div className="div_input">无</div>
                                </div>
                            </div>
                            <div className="item_space">
                                {/* <Button
                                    type="link"
                                    style={{ padding: 0 }}
                                    onClick={() =>
                                    this.openModal(
                                        this.state.detailData.contact,
                                        this.state.detailData.phone
                                    )
                                    }
                                >
                                    给该联系人发送行程通知
                                </Button> */}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
