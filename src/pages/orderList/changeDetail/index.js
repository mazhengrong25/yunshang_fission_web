/*
 * @Description: 改签详情
 * @Author: mzr
 * @Date: 2021-04-14 09:12:40
 * @LastEditTime: 2021-04-15 10:18:28
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import './changeDetail.scss'

import {
    message,
    Spin,
    Breadcrumb,
    Table,
    Button,
} from 'antd';

import AircraftTypePopover from "../../../components/AircraftTypePopover"; // 航班信息 机型信息组件

import copy from "copy-to-clipboard";
import Column from "antd/lib/table/Column";

export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isShow: false, //航班信息展开收起
            loadDetail: true, // 加载详情页面
            detailData: [], // 改签详情
            passengerData: [], // 乘客列表
            oldFlight: {}, // 原航班
            newFlight: {}, // 新航班
        };
    }

    async componentDidMount() {
        await this.setState({
            urlData: React.$filterUrlParams(this.props.location.search),
        });
        await this.getDetail();
    }

    getDetail() {
        let data = {
            order_no:this.state.urlData.detail || ""
        }
        this.$axios.post("/api/change/detail",data).then((res) => {
            console.log(res)
            if(res.errorcode === 10000) {

                this.setState({
                    loadDetail: false, 
                    detailData: res.data,
                    passengerData: res.data.change_passengers,
                    oldFlight: res.data.ticket_order.ticket_segments,
                    newFlight: res.data.change_segments
                })
                console.log(this.state.newFlight)
            }else {
                message.warning(res.msg)
                this.setState({
                    loadDetail: false, 
                })
            }
        })
    }

    // 拷贝订单号
    copyOrderNo(val) {
        if (copy(val)) {
            message.success("已复制订单号至剪切板");
        } else {
            message.success("复制订单号失败，请手动复制");
        }
    }

    // 返回到列表
    backList() {
        try {
            this.props.history.go(-1);
        } catch (error) {
            this.props.history.push("/orderList?type=inland_change");
        }
    }

    // 打开航班信息折叠栏
    openFoldBar() {
        
        this.setState({
            isShow: !this.state.isShow,
        });
    }

    render() {
        return (
            <div className="inland_change_Detail">
                <Spin spinning={this.state.loadDetail}>
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
                                    <div className="order_number">改签单号</div>
                                    <div className="input_number" style={{ fontSize: 18 }}>
                                        {this.state.detailData.order_no}
                                    </div>
                                    <div
                                        style={{ display: this.state.detailData.order_no ? "block" : "none" }}
                                        className="number_copy"
                                        onClick={() => this.copyOrderNo(this.state.detailData.order_no)}
                                    ></div>
                                </div>
                                <div
                                    className="order_status"
                                    style={{
                                        color:
                                            this.state.detailData.change_status === 2
                                                ? "#F36969"
                                                :this.state.detailData.change_status === 4
                                                ? "#3A3B50":"#5B7CF0"
                                    }}
                                >
                                    {this.state.detailData.change_status === 1
                                        ? "申请中"
                                        : this.state.detailData.change_status === 2
                                            ? "待支付"
                                            : this.state.detailData.change_status === 3
                                                ? "待出票"
                                                : this.state.detailData.change_status === 4 
                                                    ? "成功" : ""}
                                </div>
                            </div>
                            <div className="order_space">
                                <div className="order_message">
                                    <div className="order_div">
                                        <div className="order_number">分销商</div>
                                        <div className="input_number_crease">
                                            {this.state.detailData.admin_name}
                                        </div>
                                    </div>
                                    <div className="order_div">
                                        <div className="order_number">订单PNR</div>
                                        <div className="input_number_crease">
                                            {this.state.detailData.pnr_code}
                                        </div>
                                    </div>
                                    <div className="order_div">
                                        <div className="order_number">YATP订单号</div>
                                        <div className="input_number_crease">
                                            {this.state.detailData.yatp_id}
                                        </div>
                                    </div>
                                    <div className="order_div">
                                        <div className="order_number">支付状态</div>
                                        <div 
                                            className="input_number_crease"
                                            style={{
                                                color:
                                                    this.state.detailData.pay_status === 1
                                                        ? "#F36969" :"#3A3B50"
                                            }}>
                                            {this.state.detailData.pay_status === 1 ? '未支付'
                                                : this.state.detailData.pay_status === 2 ? '已支付' 
                                                    : this.state.detailData.pay_status === 3 ? "已退款" 
                                                        : this.state.detailData.pay_status === 4 ? "已取消" : ""
                                            }
                                        </div>
                                    </div>
                                    <div className="order_div">
                                        <div className="order_number">预订时间</div>
                                        <div className="input_number_crease">
                                            {this.state.detailData.created_at}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* 航班信息 */}
                        <div className="flight_div">
                            <div className="flight_title">航班信息</div>
                            {/* 新航班 */}
                            <div className="flight_detail"> 
                                <div className="flight_message">
                                    <div className="flight_type">
                                        {this.state.newFlight.segment_num === 1 ? "新航班" : ""}
                                    </div>

                                    <div className="flight_route">
                                        <div className="flight_address">
                                            {`${this.state.newFlight.departure_CN?this.state.newFlight.departure_CN.city_name:''} - 
                                            ${this.state.newFlight.arrive_CN?this.state.newFlight.arrive_CN.city_name:''}`}  
                                        </div>
                                        <div className="flight_date">
                                            {this.state.newFlight.departure_time?this.state.newFlight.departure_time.substring(0,10):''}
                                            <span>{this.$moment(this.state.newFlight.departure_time).format("ddd")}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="route_div">
                                    <div className="center_route">
                                        <div className="flight_time">
                                            {this.$moment(this.state.newFlight.departure_time).format("HH:mm")}
                                        </div>
                                        <div className="flight_airport">
                                            {`${this.state.newFlight.departure_CN?this.state.newFlight.departure_CN.city_name:''}${this.state.newFlight.departure_CN?this.state.newFlight.departure_CN.air_port_name:''}机场${this.state.newFlight.departure_terminal?this.state.newFlight.departure_terminal:''}`} 
                                        </div>
                                    </div>
                                    <div className="flight_icon">
                                        
                                    </div>
                                    <div className="center_route" style={{ textAlign: "right" }}>
                                        <div className="flight_time">
                                            {this.$moment(this.state.newFlight.arrive_time?this.state.newFlight.arrive_time:'').format("HH:mm")}
                                        </div>
                                        <div className="flight_airport">
                                            {`${this.state.newFlight.arrive_CN?this.state.newFlight.arrive_CN.city_name:''}${this.state.newFlight.arrive_CN?this.state.newFlight.arrive_CN.air_port_name:''}机场${this.state.newFlight.arrive_CN?this.state.newFlight.arrive_terminal:''}`}
                                        </div>
                                    </div>
                                </div>

                                <div className="flight_entry">
                                    <div className="middle_icon">
                                        <img src={this.$url + this.state.newFlight.image} alt="" /> 
                                    </div>
                                    <div className="middle_fly_type">{this.state.newFlight.airline_CN}</div> 

                                    <div className="middle_fly_modal">
                                        <AircraftTypePopover
                                            className=""
                                            aircraftTypeData={this.state.newFlight}
                                            dateStatus={true}
                                        ></AircraftTypePopover>
                                    </div>

                                    <div className="middle_fly_cabin">
                                        {` ${this.state.newFlight.cabin_level_key === "ECONOMY"
                                                ? "经济舱"
                                                : this.state.newFlight.cabin_level_key === "FIRST"
                                                    ? "头等舱"
                                                    : this.state.newFlight.cabin_level_key === "BUSINESS"
                                                        ? "公务舱"
                                                        : this.state.newFlight.cabin_level_key
                                            } ${this.state.newFlight.cabin}`}
                                    </div>
                                </div>
                            </div>

                            {/* 原航班 */}
                            <div
                                className="open_content"
                                style={{ display: this.state.isShow ? "block" : "none" }}
                            >
                                <div className="flight_detail">
                                    <div className="flight_message">
                                        <div className="flight_type_old">
                                            {this.state.oldFlight.segment_num === 1 ? "原航班" : ""}
                                        </div>

                                        <div className="flight_route">
                                            <div className="flight_address">
                                                {`${this.state.oldFlight.departure_CN?this.state.oldFlight.departure_CN.city_name:''} - 
                                                ${this.state.oldFlight.arrive_CN?this.state.oldFlight.arrive_CN.city_name:this.state.oldFlight.arrive_CN}`}  
                                            </div>
                                            <div className="flight_date">
                                                {this.state.oldFlight.departure_time?this.state.oldFlight.departure_time.substring(0,10):''}
                                                <span>{this.$moment(this.state.oldFlight.departure_time).format("ddd")}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="route_div">
                                        <div className="center_route">
                                            <div className="flight_time">
                                                {this.$moment(this.state.oldFlight.departure_time).format("HH:mm")}
                                            </div>
                                            <div className="flight_airport">
                                                {`${this.state.oldFlight.departure_CN?this.state.oldFlight.departure_CN.city_name:''}${this.state.oldFlight.departure_CN?this.state.oldFlight.departure_CN.air_port_name:''}机场${this.state.oldFlight.departure_terminal}`} 
                                            </div>
                                        </div>
                                        <div className="flight_icon">
                                            
                                        </div>
                                        <div className="center_route" style={{ textAlign: "right" }}>
                                            <div className="flight_time">
                                                {this.$moment(this.state.oldFlight.arrive_time).format("HH:mm")}
                                            </div>
                                            <div className="flight_airport">
                                                {`${this.state.oldFlight.arrive_CN?this.state.oldFlight.arrive_CN.city_name:''}${this.state.oldFlight.arrive_CN?this.state.oldFlight.arrive_CN.air_port_name:''}机场${this.state.oldFlight.arrive_CN?this.state.oldFlight.arrive_terminal:''}`}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flight_entry">
                                        <div className="middle_icon">
                                            <img src={this.$url + this.state.oldFlight.image} alt="" /> 
                                        </div>
                                        <div className="middle_fly_type">{this.state.oldFlight.airline_CN}</div> 

                                        <div className="middle_fly_modal">
                                            <AircraftTypePopover
                                                className=""
                                                aircraftTypeData={this.state.oldFlight}
                                                dateStatus={true}
                                            ></AircraftTypePopover>
                                        </div>

                                        <div className="middle_fly_cabin">
                                            {` ${this.state.oldFlight.cabin_level === "ECONOMY"
                                                    ? "经济舱"
                                                    : this.state.oldFlight.cabin_level === "FIRST"
                                                        ? "头等舱"
                                                        : this.state.oldFlight.cabin_level === "BUSINESS"
                                                            ? "公务舱"
                                                            : this.state.oldFlight.cabin_level
                                                } ${this.state.oldFlight.cabin}`}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="open" onClick={() => this.openFoldBar()}>
                                {this.state.isShow ? "收起" : "展开"}
                            </div>
                        </div>
                        {/* 联系人信息 */}
                        <div className="content_item">
                            <div className="item_title">联系人</div>
                            <div className="contact_div">
                                <div className="item_space">
                                    <div className="div_item">
                                        <div className="div_title">姓名:</div>
                                        <div className="div_input">{this.state.detailData.contact}</div>
                                    </div>
                                    <div className="div_item">
                                        <div className="div_title">手机:</div>
                                        <div className="div_input">{this.state.detailData.phone}</div>
                                    </div>
                                </div>
                                <div className="item_space">
                                    <div className="div_item">
                                        <div className="div_title">备注:</div>
                                        <div className="div_input">无</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* 价格明细 */}
                        <div className="content_item">
                            <div className="item_title">价格明细</div>
                            <div className="price_div">
                                <Table
                                    rowKey="id"
                                    pagination={false}
                                    dataSource={this.state.passengerData}
                                >
                                    <Column
                                        title="票号"
                                        dataIndex="ticket_no"
                                        render={(text,render) => (
                                            <>
                                                {
                                                    <div className="ticket_part">
                                                        <div className="ticket_new">新票号：{text}</div>
                                                        <div className="ticket_old">
                                                            旧票号：{this.state.detailData.ticket_order.ticket_passenger[0].ticket_no}
                                                        </div>
                                                    </div>
                                                }
                                            </>
                                        )}
                                    />
                                    <Column
                                        title="乘机人"
                                        render={(text, render) => (
                                            <>
                                                {render.ticket_passenger.PassengerName}
                                            </>
                                        )}
                                    />
                                    <Column
                                        title="类型"
                                        render={(text, render) => (
                                            <>
                                                {render.ticket_passenger.PassengerType === "CNN"
                                                    ? "儿童"
                                                    : render.ticket_passenger.PassengerType === "ADT"
                                                        ? "成人"
                                                        : render.ticket_passenger.PassengerType === "INF"
                                                            ? "婴儿"
                                                            : ""}
                                            </>
                                        )}
                                    />
                                    <Column
                                        title="票价"
                                        dataIndex="ticket_price"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="机建"
                                        dataIndex="build_price"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="燃油"
                                        dataIndex="fuel_price"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="奖励"
                                        dataIndex="reward_price"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="保险"
                                        dataIndex="insurance_price"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="服务费"
                                        dataIndex="service_price"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="改签费"
                                        dataIndex="change_fee"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="误机费"
                                        dataIndex="delay_price"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="需支付"
                                        render={(text) => <>&yen;{this.state.detailData.need_pay_amount}</>}
                                    />
                                    <Column
                                        title="总价"
                                        dataIndex="total_price"
                                        render={(text,render) => 
                                            <p style={{ fontWeight: "bold" }}>&yen;{render.ticket_passenger.total_price}</p>
                                        }
                                    />
                                </Table>

                                <div className="price_button">
                                    <div className="back_btn">
                                        <Button onClick={() => this.backList()}>返回</Button>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </Spin>
            </div>
        )
    }
}
