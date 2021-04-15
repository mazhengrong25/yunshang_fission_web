/*
 * @Description: 退票详情
 * @Author: mzr
 * @Date: 2021-04-12 15:08:44
 * @LastEditTime: 2021-04-14 17:31:14
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import './refundDetail.scss'

import {
    Breadcrumb,
    message,
    Spin,
    Table,
    Button,
    Divider,
} from 'antd';

import copy from "copy-to-clipboard";
import Column from "antd/lib/table/Column";

import AircraftTypePopover from "../../../components/AircraftTypePopover"; // 航班信息 机型信息组件
import RefundsAndChangesPopover from "../../../components/RefundsAndChangesPopover"; // 退改签说明弹窗
export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isShow: false, //航班信息展开收起
            loadDetail: true, // 加载详情页面
            urlData: {},
            detailData: {}, // 详情信息
            passengerData: [], // 乘机人信息
            insurancePassenger: [], // 保险列表
            flightData: [], // 航班信息
        };
    }

    async componentDidMount() {
        await this.setState({
            urlData: React.$filterUrlParams(this.props.location.search),
        });
        await this.getDetail();
    }

    // 获取详情
    getDetail() {
        let data = {
            refund_no: this.state.urlData.detail || "",
        };
        this.$axios.post("/api/refund/details", data).then((res) => {
            if (res.result === 10000) {

                // 图标
                res.data.ticket_segments.forEach(item => {
                    item['image'] = res.data.image
                    item['duration'] = this.$moment(item.arrive_time).diff(item.departure_time, 's')
                    item['airline_CN'] = item.airline_cn
                })


                this.setState({
                    loadDetail: false,
                    detailData: res.data,
                    passengerData: res.data.ticket_refund_passenger,
                    insurancePassenger: res.data.insurance,
                    flightData: res.data.ticket_segments
                });
                console.log('退票详情', this.state.detailData)
            } else {
                message.warning(res.msg);
                this.setState({
                    loadDetail: false,
                });
            }
        });
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
            this.props.history.push("/orderList?type=inland_refund");
        }
    }

    // 打开航班信息折叠栏
    openFoldBar(index) {
        let data = this.state.flightData;
        data[index]["isShow"] = !data[index].isShow;
        this.setState({
            flightData: data,
        });
    }

    render() {
        return (
            <div className="inland_refund_Detail">
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
                                    <div className="order_number">退票单号</div>
                                    <div className="input_number" style={{ fontSize: 18 }}>
                                        {this.state.detailData.refund_no}
                                    </div>
                                    <div
                                        style={{ display: this.state.detailData.refund_no ? "block" : "none" }}
                                        className="number_copy"
                                        onClick={() => this.copyOrderNo(this.state.detailData.refund_no)}
                                    ></div>
                                </div>
                                <div
                                    className="order_status"
                                    style={{
                                        color:
                                            this.state.detailData.order_status === 1
                                                ? "#5B7CF0"
                                                : this.state.detailData.status === 2
                                                    ? "#3A3B50"
                                                    : this.state.detailData.status === 3
                                                        ? "#F36969"
                                                        : ""
                                    }}
                                >
                                    {this.state.detailData.order_status === 1
                                        ? "申请中"
                                        : this.state.detailData.status === 2
                                            ? "成功"
                                            : this.state.detailData.status === 3
                                                ? "失败"
                                                : ""}
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
                                        <div className="order_number">是否自愿</div>
                                        <div className="input_number_crease">
                                            {this.state.detailData.is_voluntary === 1 ? '自愿'
                                                : this.state.detailData.is_voluntary === 2 ? '非自愿' : ''
                                            }
                                        </div>
                                    </div>
                                    <div className="order_div">
                                        <div className="order_number">是否退款</div>
                                        <div className="input_number_crease">
                                            {this.state.detailData.is_refund === 0 ? '已退款'
                                                : this.state.detailData.is_refund === 1 ? '未退款' : ''
                                            }
                                        </div>
                                    </div>
                                    <div className="order_div">
                                        <div className="order_number">退票时间</div>
                                        <div className="input_number_crease">
                                            {this.state.detailData.created_at}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* 航班信息 */}
                        {this.state.flightData.map((item, index) => (
                            <div className="flight_div" key={item.id}>
                                <div className="flight_title">航班信息</div>
                                <div className="flight_detail">
                                    <div className="flight_message">
                                        <div className="flight_type">
                                            {this.state.detailData.segment_type === 1 ? "单程" : ""}
                                        </div>

                                        <div className="flight_route">
                                            <div className="flight_address">
                                                {`${item.departure_city} - ${item.arrive_city}`}
                                            </div>
                                            <div className="flight_date">
                                                {item.departure_time.substring(0, 10)}
                                                <span>{this.$moment(item.departure_time).format("ddd")}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="route_div">
                                        <div className="center_route">
                                            <div className="flight_time">
                                                {this.$moment(item.departure_time).format("HH:mm")}
                                            </div>
                                            <div className="flight_airport">
                                                {`${item.departure_city}${item.departure_cn}机场${item.departure_terminal}`}
                                            </div>
                                        </div>
                                        <div className="flight_icon">
                                            {/* <img src={airIcon} alt="航程图标"></img> */}
                                        </div>
                                        <div className="center_route" style={{ textAlign: "right" }}>
                                            <div className="flight_time">
                                                {this.$moment(item.arrive_time).format("HH:mm")}
                                            </div>
                                            <div className="flight_airport">
                                                {`${item.arrive_city}${item.arrive_cn}机场${item.arrive_terminal}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flight_entry">
                                        <div className="entry_item">
                                            <RefundsAndChangesPopover
                                                refundsAndChangesData={
                                                    item.rule_infos ? JSON.parse(item.rule_infos) : {}
                                                }
                                            ></RefundsAndChangesPopover>
                                        </div>
                                        <Divider type="vertical" />
                                        <div className="entry_item">行李额{item.baggage}KG</div>
                                    </div>
                                </div>
                                {/* 展开内容 */}
                                <div
                                    className="open_content"
                                    style={{ display: item.isShow ? "block" : "none" }}
                                >
                                    <div className="content_div_open">
                                        <div className="open_left">
                                            <div className="left_div">
                                                <div className="open_left_date">
                                                    <span>{this.$moment(item.departure_time).format("MM-DD")}</span>
                                                    <p>{this.$moment(item.departure_time).format("HH:mm")}</p>
                                                </div>
                                                <div className="open_left_date">
                                                    <span>{this.$moment(item.arrive_time).format("MM-DD")}</span>
                                                    <p>{this.$moment(item.arrive_time).format("HH:mm")}</p>
                                                </div>
                                            </div>
                                            <div className="left_icon"></div>
                                            <div className="left_div">
                                                <div className="open_left_address">
                                                    {`${item.departure}${item.departure_city}
                                                                            ${item.departure_cn}机场${item.departure_terminal}`}
                                                </div>
                                                <div className="open_left_address">
                                                    {`${item.arrive}${item.arrive_city}
                                                                        ${item.arrive_cn}机场${item.arrive_terminal}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="open_middle">
                                            <div className="middle_icon">
                                                <img src={this.$url + this.state.detailData.image} alt="" />
                                            </div>
                                            <div className="middle_fly_type">{item.airline_cn}</div>

                                            <div className="middle_fly_modal">
                                                <AircraftTypePopover
                                                    className=""
                                                    aircraftTypeData={item}
                                                    dateStatus={true}
                                                ></AircraftTypePopover>
                                            </div>

                                            <div className="middle_fly_cabin">
                                                {` ${item.cabin_level === "ECONOMY"
                                                        ? "经济舱"
                                                        : item.cabin_level === "FIRST"
                                                            ? "头等舱"
                                                            : item.cabin_level === "BUSINESS"
                                                                ? "公务舱"
                                                                : item.cabin_level
                                                    } ${item.cabin}`}
                                            </div>
                                        </div>
                                        <div className="open_right">
                                            <div className="right_icon"></div>
                                            <div className="right_consume">
                                                {
                                                    Math.floor(this.$moment(item.arrive_time).diff(item.departure_time, 'minutes') / 60) + "h" +
                                                    Math.floor(this.$moment(item.arrive_time).diff(item.departure_time, 'minutes') % 60) + "m"
                                                }
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="open" onClick={() => this.openFoldBar(index)}>
                                    {item.isShow ? "收起" : "展开"}
                                </div>
                            </div>
                        ))}
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
                        {/* 保险服务 */}
                        <div className="content_item">
                            <div className="item_title">保险服务</div>
                            {this.state.insurancePassenger.length > 0 ? (
                                <div className="insure_table">
                                    <Table
                                        rowKey="id"
                                        pagination={false}
                                        dataSource={this.state.insurancePassenger}
                                    >
                                        <Column width={"30%"} title="姓名" dataIndex="insure_name" />
                                        <Column
                                            width={"30%"}
                                            title="保险订单号"
                                            dataIndex="order_sn"
                                        />
                                        <Column
                                            width={"30%"}
                                            title="实收金额"
                                            dataIndex="actual_in_money"
                                            render={(text) => 
                                                <>
                                                    &yen;{text}
                                                </>
                                            }
                                        />
                                    </Table>
                                </div>
                            ) : (
                                <div className="contact_div">
                                    <div className="not_insure">订单未购买保险服务</div>
                                </div>
                            )}
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
                                        dataIndex="build_total"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="燃油"
                                        dataIndex="fuel_total"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="奖励"
                                        dataIndex="reward_price"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="保险"
                                        dataIndex="insurance_total"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="服务费"
                                        dataIndex="service_price"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="退票费"
                                        dataIndex="refund_money"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="误机费"
                                        dataIndex="delay_price"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="其他费用"
                                        dataIndex="sale_other_fee"
                                        render={(text) => <>&yen;{text}</>}
                                    />
                                    <Column
                                        title="总价"
                                        dataIndex="total_price"
                                        render={(text) => <p style={{ fontWeight: "bold" }}>&yen;{text}</p>}
                                    />
                                    <Column
                                        title="应退金额"
                                        dataIndex="refund_total"
                                        render={(text, record, index) => {
                                            if (index === 0) {
                                                return {
                                                    children: (
                                                        <div className="ticket_price">
                                                            <span>共计</span>
                                                            <span>&yen;</span>
                                                            {text}
                                                        </div>
                                                    ),
                                                    props: {
                                                        rowSpan: this.state.passengerData.length,
                                                    },
                                                };
                                            } else {
                                                return {
                                                    props: {
                                                        rowSpan: 0,
                                                    },
                                                };
                                            }
                                        }}
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
