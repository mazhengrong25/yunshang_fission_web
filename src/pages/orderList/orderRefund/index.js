/*
 * @Description: 订单退票
 * @Author: mzr
 * @Date: 2021-04-06 13:47:26
 * @LastEditTime: 2021-04-12 14:58:41
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import {
    Spin,
    Breadcrumb,
    Radio,
    Select,
    Divider,
    Button,
    Checkbox,
    Table,
    message,
} from 'antd';

import './orderRefund.scss'

import AircraftTypePopover from "../../../components/AircraftTypePopover"; // 航班信息 机型信息组件
import RefundsAndChangesPopover from "../../../components/RefundsAndChangesPopover"; // 退改签说明弹窗

import Column from "antd/lib/table/Column";
const { Option } = Select;


const refundInfo = {
    id: 0,
    ticket_price: 0,
    build_total: 0,
    fuel_total: 0,
    service_price: 0,
    insurance_total: 0,
    reward_price: 0,
    refund_rate: 0,
    total_price: 0, // 总价
}
export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            urlData: {},
            loadStatus: true, // 进入页面加载状态
            isShow: false, // 航班信息展开收起

            detailData: {}, // 退票详情
            detailSegment: [], // 航班信息
            detailPassenger: [], // 乘机人信息
            refundPassenger: [refundInfo], // 退票
            insurancePassenger: [], // 有保险的乘客

            radioValue: "", // 单选框选定
            checkValue: [], // 多选框选定
            refundId: [], // 航段id
            selectValue: "", // 选择器选定

            refundRate: 0, // 退票费率

        };
    }

    async componentDidMount() {
        await this.setState({
            urlData: React.$filterUrlParams(this.props.location.search),
        });
        await this.getRefundDetail();

    }

    // 打开航班信息折叠栏
    openFoldBar(index) {
        let data = this.state.detailSegment;
        data[index]["isShow"] = !data[index].isShow;
        this.setState({
            detailSegment: data,
        });
    }

    // 订单详情
    getRefundDetail() {
        let data = {
            order_no: this.state.urlData.detail || ""
        }
        this.$axios.post("/api/order/details", data).then((res) => {
            if (res.errorcode === 10000) {

                // 保险
                let insuranceList = [];
                res.data.ticket_passenger.forEach((item) => {
                    if (item.insurance_total > 0) {
                        insuranceList.push(item);
                    }
                });

                //  退费率
                let refund_rate = Number(res.data.ticket_segments[0].refund_rate)

                // 航段id
                let ticket_id = []
                ticket_id.push(res.data.ticket_segments[0].id)
               
                this.setState({
                    loadStatus: false,
                    detailData: res.data,
                    detailSegment: res.data.ticket_segments,
                    detailPassenger: res.data.ticket_passenger,
                    insurancePassenger: insuranceList,
                    refundRate: refund_rate,
                    refundId: ticket_id
                })
                console.log('detailSegment',this.state.detailSegment)
                console.log(this.state.refundId)
                console.log('乘机人', this.state.detailPassenger)
            } else {
                this.setState({
                    loadStatus: false
                })
            }
        })
    }

    // 单选框选定
    getRadioValue = (e) => {
        let select = e.target.value
        this.setState({
            radioValue: select
        })
    }

    // 勾选乘机人
    getCheckValue = (e) => {
        console.log('乘机人', e)

        // 选中乘机人
        let passengerList = [];
        e.forEach(item => {

            this.state.detailPassenger.forEach(oitem => {

                if (item === oitem.id) {
                    passengerList.push(oitem)
                }
            })
        })

        let newInfo = JSON.parse(JSON.stringify(refundInfo))
        // 退票费率
        newInfo['refund_rate'] = this.state.refundRate
        console.log(newInfo)


        for (let i = 0; i < passengerList.length; i++) {
            newInfo['ticket_price'] += passengerList[i].ticket_price
            newInfo['build_total'] += passengerList[i].build_total
            newInfo['fuel_total'] += passengerList[i].fuel_total
            newInfo['service_price'] += passengerList[i].service_price
            newInfo['insurance_total'] += passengerList[i].insurance_total
            newInfo['reward_price'] += passengerList[i].reward_price
            newInfo['total_price'] += passengerList[i].total_price
        }
        console.log(newInfo)

        this.setState({
            refundPassenger: [newInfo],
            checkValue: e
        })
    }

    // 选择器选定
    getSelectValue = (val,e) => {
        console.log('选择器',val,e)
        this.setState({
            selectValue:e.children
        })
    }

    // 退票
    getRefund() {
        if(this.state.checkValue.length < 1) {
            message.warn("请勾选乘机人")
        }else {
            let data = {
                params:  {                //类型：Object  必有字段  备注：必要参数
                    is_abandon:1,                //类型：Number  必有字段  备注：1：退票 2：废票
                    contact:this.state.detailData.contact,                //类型：String  必有字段  备注：联系人
                    is_voluntary:this.state.radioValue,                //类型：Number  必有字段  备注：是否自愿 1：是 2：否
                    keep_seat:1,                //类型：Number  必有字段  备注：委托平台取消座位 1：是 0：否
                    reason:this.state.selectValue,                //类型：String  必有字段  备注：退票理由
                    remark:"",                //类型：String  必有字段  备注：备注
                    phone:this.state.detailData.phone                //类型：Number  必有字段  备注：联系手机
                },
                passenger_ids: this.state.checkValue,
                segment_ids: this.state.refundId
            }
            this.$axios.post("/api/refund/order",data).then((res) => {
                if(res.errorcode === 10000) {
                    message.success(res.msg)
                    this.backList();
                }else {
                    message.error(res.msg)
                }
            })
        }
    }

    // 关闭退票
    backList() {
        try {
            this.props.history.go(-1);
        } catch (error) {
            this.props.history.push("/refundDetail?detail=this.state.urlData.detail");
        }
    }
    
    render() {
        return (
            <div className="refundDetail">
                <Spin spinning={this.state.loadStatus}>
                    <div className="refund_content">
                        <div className="refund_content_nav">
                            <Breadcrumb separator="<">
                                <Breadcrumb.Item>我的订单</Breadcrumb.Item>
                                <Breadcrumb.Item href="">机票订单</Breadcrumb.Item>
                                <Breadcrumb.Item href="">订单详情</Breadcrumb.Item>
                            </Breadcrumb>
                        </div>
                        {/* 详情信息 */}
                        <div className="refund_content_status">
                            <div className="order_space">
                                <div className="order_div">
                                    <div className="order_number">订单编号</div>
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
                                            this.state.detailData.status === 1
                                                ? "#F36969"
                                                : this.state.detailData.status === 2
                                                    ? "#5B7CF0"
                                                    : this.state.detailData.status === 3
                                                        ? "#32D197"
                                                        : this.state.detailData.status === 5
                                                            ? "#3A3B50"
                                                            : "",
                                    }}
                                >
                                    {this.state.detailData.status !== 0 &&
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
                                                        : this.state.detailData.status}
                                </div>
                            </div>
                            <div className="order_space">
                                <div className="order_message">
                                    <div className="order_div">
                                        <div className="order_number">预定人</div>
                                        <div className="input_number_crease">
                                            {this.state.detailData.book_user}
                                        </div>
                                    </div>
                                    {this.state.detailData.status === 1 ? (
                                        <div className="order_div">
                                            <div className="order_number">下单时间</div>
                                            <div className="input_number_crease">
                                                {this.state.detailData.created_at}
                                            </div>
                                        </div>
                                    ) : this.state.detailData.status === 2 ||
                                        this.state.detailData.status === 3 ? (
                                        <>
                                            <div className="order_div">
                                                <div className="order_number">支付时间</div>
                                                <div className="input_number_crease">
                                                    {this.state.detailData.pay_time}
                                                </div>
                                            </div>
                                            <div className="order_div">
                                                <div className="order_number">支付方式</div>
                                                <div className="input_number_crease">
                                                    {this.state.detailData.pay_type === 1
                                                        ? "预存款"
                                                        : this.state.detailData.pay_type === 2
                                                            ? "授信支付"
                                                            : this.state.detailData.pay_type === 3
                                                                ? "易宝"
                                                                : this.state.detailData.pay_type === 4
                                                                    ? "支付宝"
                                                                    : ""}
                                                </div>
                                            </div>
                                        </>
                                    ) : (
                                        ""
                                    )}
                                </div>

                                <div className="order_div" style={{ alignItems: "baseline" }}>
                                    <div className="order_number">金额</div>
                                    <div className="input_number">
                                        <span>&yen;</span>
                                        {this.state.detailData.total_price}
                                    </div>
                                </div>
                            </div>
                        </div>
                        {/* 退废信息 */}
                        <div className="refund_content_item">
                            <div className="item_title">退票信息</div>
                            <div className="refund_message">
                                <div className="choice_item">
                                    <div className="choice_title">是否自愿</div>
                                    <div className="choice_content">
                                        <Radio.Group
                                            defaultValue={1}
                                            onChange={this.getRadioValue}
                                        >
                                            <Radio value={1}>自愿</Radio>
                                            <Radio value={2}>非自愿</Radio>
                                        </Radio.Group>
                                    </div>
                                </div>
                                {this.state.radioValue === 2 ? (
                                    <div className="choice_item">
                                        <div className="choice_title">退票理由</div>
                                        <div className="choice_content">
                                            <Select                                                                                                                                                                                                                  
                                                style={{ width: 200 }}
                                                placeholder="请选择"
                                                onChange={this.getSelectValue.bind()}
                                            >
                                                <Option value="a">因航班取消延误，申请全退</Option>
                                                <Option value="b">其他退票原因</Option>
                                                <Option value="c">升舱换开，申请全退</Option>
                                                <Option value="d">名字错换开重开，申请全退</Option>
                                                <Option value="e">客人因无法乘机，申请全退</Option>
                                                <Option value="f">其他退票理由</Option>
                                                <Option value="g">供应商没有出票，申请全退</Option>
                                                <Option value="h">申请退回票款差价</Option>
                                                <Option value="i">重构客票，以提交航司审核为准</Option>
                                                <Option value="j">重复支付，申请全退</Option>
                                                <Option value="k">客票不退，请供应商退回多收票款</Option>
                                                <Option value="l">供应商没有出票，已支付，申请全退</Option>
                                                <Option value="m">航空公司会员客户，申请全退</Option>
                                                <Option value="n">前段航班变动，导致后段无法乘坐，申请全退</Option>
                                                <Option value="o">特殊订票退票，已提供相关证明，申请全退</Option>
                                                <Option value="p">备降</Option>
                                                <Option value="q">扫描过期票</Option>
                                                <Option value="r">过期退票</Option>
                                                <Option value="s">关爱计划退票</Option>
                                                <Option value="t">过期客票私自退，未告知客人</Option>
                                            </Select>
                                        </div>
                                    </div>
                                ) : ""}

                            </div>
                        </div>
                        {/* 航班信息 */}
                        {this.state.detailSegment.map((item, index) => (
                            <div className="refund_content_flight" key={item.id}>
                                <div className="flight_title">航班信息</div>
                                <div className="flight_detail">
                                    <div className="flight_message">
                                        <div className="flight_type">{this.state.detailData.segment_type === 1 ? "单程" : ""}</div>
                                        <div className="flight_route">
                                            <div className="flight_address">
                                                {`${item.departure_CN.city_name} - 
                                                                        ${item.arrive_CN.city_name}`}
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
                                                {`${item.departure_CN.city_name}${item.departure_CN.air_port_name}机场${item.departure_terminal}`}
                                            </div>
                                        </div>
                                        <div className="flight_icon"></div>
                                        <div className="center_route" style={{ textAlign: "right" }}>
                                            <div className="flight_time">
                                                {this.$moment(item.arrive_time).format("HH:mm")}
                                            </div>
                                            <div className="flight_airport">
                                                {`${item.arrive_CN.city_name}${item.arrive_CN.air_port_name}机场${item.arrive_terminal}`}
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
                                                    {`${item.departure}${item.departure_CN.city_name}
                                                                            ${item.departure_CN.air_port_name}机场${item.departure_terminal}`}
                                                </div>
                                                <div className="open_left_address">
                                                    {`${item.arrive}${item.arrive_CN.city_name}
                                                                            ${item.arrive_CN.air_port_name}机场${item.arrive_terminal}`}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="open_middle">
                                            <div className="middle_icon">
                                                <img src={this.$url + item.image} alt="" />
                                            </div>
                                            <div className="middle_fly_type">{item.airline_CN}</div>
                                            <div className="middle_fly_modal">
                                                <AircraftTypePopover
                                                    className=""
                                                    aircraftTypeData={item}
                                                    dateStatus={true}
                                                ></AircraftTypePopover>
                                            </div>
                                            <div className="middle_fly_cabin">
                                                {`${item.cabin} ${item.cabin_level === "ECONOMY"
                                                    ? "经济舱"
                                                    : item.cabin_level === "FIRST"
                                                        ? "头等舱"
                                                        : item.cabin_level === "BUSINESS"
                                                            ? "公务舱"
                                                            : item.cabin_level
                                                    }`}
                                            </div>
                                            {/* <div className="middle_fly_meal"></div> */}
                                        </div>
                                        <div className="open_right">
                                            <div className="right_icon"></div>
                                            <div className="right_consume">
                                                {Math.floor(item.duration / 3600) +
                                                    "h" +
                                                    ((item.duration / 60) % 60) +
                                                    "m"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="open" onClick={() => this.openFoldBar(index)}>
                                    {item.isShow ? "收起" : "展开"}
                                </div>
                            </div>
                        ))}
                        {/* 乘机人信息 */}
                        <div className="refund_content_item">
                            <div className="item_title">乘机人信息</div>
                            <Checkbox.Group
                                onChange={this.getCheckValue}
                            >
                                {this.state.detailPassenger.map((item, index) => (
                                    <div className="passenger_message" key={item.id}>
                                        <div className="message_nav">
                                            <div className="passenger_item">
                                                <div className="passenger_checkbox">
                                                    <Checkbox value={item.id}><span className="passenger_number">乘机人{index + 1}</span></Checkbox>
                                                </div>
                                                {this.state.detailPassenger["ticket_no"] === "" ? (
                                                    <div className="passenger_ticketno">票号: {item.ticket_no}</div>
                                                ) : (
                                                    ""
                                                )}
                                            </div>
                                            {/* <Button type="link">
                                                给该乘机人发送行程通知（短信，邮件）
                                            </Button> */}
                                        </div>
                                        <div className="message_div">
                                            <div className="item_space">
                                                <div className="message_item">
                                                    <div className="message_head"></div>
                                                    <div className="passenger_name">{item.PassengerName}</div>
                                                    <div className="passenger_identity">{item.ticket_department}</div>
                                                </div>
                                                <div className="message_info">
                                                    <div className="div_item">
                                                        <div className="div_title">证件:</div>
                                                        <div className="div_input">
                                                            {item.Credential === "0"
                                                                ? "身份证"
                                                                : item.Credential === "1"
                                                                    ? "护照"
                                                                    : item.Credential === "2"
                                                                        ? "港澳通行证"
                                                                        : item.Credential === "3"
                                                                            ? "台胞证"
                                                                            : item.Credential === "4"
                                                                                ? "回乡证"
                                                                                : item.Credential === "5"
                                                                                    ? "台湾通行证"
                                                                                    : item.Credential === "6"
                                                                                        ? "入台证"
                                                                                        : item.Credential === "7"
                                                                                            ? "国际海员证"
                                                                                            : item.Credential === "8"
                                                                                                ? "其它证件"
                                                                                                : ""}
                                                        </div>
                                                    </div>
                                                    <div className="div_item">
                                                        <div className="div_title">证件号:</div>
                                                        <div className="div_input">{item.CredentialNo}</div>
                                                    </div>
                                                    <div className="div_item">
                                                        <div className="div_title">手机:</div>
                                                        <div className="div_input">{item.phone}</div>
                                                    </div>
                                                    <div className="div_item">
                                                        <div className="div_title">邮箱:</div>
                                                        <div className="div_input">{item.email || "无"}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                                }
                            </Checkbox.Group>
                        </div>
                        {/* 联系人 */}
                        <div className="refund_content_item">
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
                                {/* <div className="item_space">
                                    <Button
                                        type="link"
                                        style={{ padding: 0 }}
                                    >
                                        给该乘机人发送行程通知（短信，邮件）
                                    </Button>
                                </div> */}
                            </div>
                        </div>
                        {/* 保险服务 */}
                        <div className="refund_content_item">
                            <div className="item_title">保险服务</div>
                            {this.state.insurancePassenger.length > 0 ? (
                                <div className="insure_table">
                                    <Table 
                                        pagination={false} 
                                        dataSource={this.state.insurancePassenger}>
                                        <Column title="乘客姓名" dataIndex="PassengerName" />
                                        <Column
                                        title="保险名称"
                                        render={() => {
                                            return this.state.detailInsure.insure_desc;
                                        }}
                                        />
                                        <Column
                                        title="保险单价"
                                        render={() => {
                                            return this.state.detailInsure.default_dis_price;
                                        }}
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
                        <div className="refund_content_item">
                            <div className="item_title">价格明细</div>
                            <div className="price_div">
                                <Table
                                    rowKey="id"
                                    pagination={false}
                                    dataSource={this.state.refundPassenger}
                                >
                                    <Column
                                        title="销售价"
                                        dataIndex="ticket_price"
                                        render={(text) => <>&yen;{text} </>}
                                    />
                                    <Column
                                        title="机建"
                                        dataIndex="build_total"
                                        render={(text) => <>&yen;{text} </>}
                                    />
                                    <Column
                                        title="燃油"
                                        dataIndex="fuel_total"
                                        render={(text) => <>&yen;{text} </>}
                                    />
                                    <Column
                                        title="退费服务"
                                        dataIndex="service_price"
                                        render={(text) => <>&yen;{text} </>}
                                    />
                                    <Column
                                        title="保险"
                                        dataIndex="insurance_total"
                                        render={(text) => <>&yen;{text} </>}
                                    />
                                    <Column
                                        title="奖励"
                                        dataIndex="reward_price"
                                        render={(text) => <>&yen;{text} </>}
                                    />
                                    <Column
                                        title="退票费率"
                                        dataIndex="refund_rate"
                                        render={(text) => <>{text}%</>}
                                    />
                                    <Column
                                        title="参考退票费"
                                        render={(text, render) => 
                                            <>
                                                &yen;{((this.state.refundRate / 100) * render.total_price).toFixed(2) || 0}
                                            </>
                                        }
                                    />
                                    <Column
                                        title="参考退票金额（以最终审核金额为准）"
                                        render={(text,render) => 
                                            <>
                                                &yen;
                                                {(render.build_total) + (render.insurance_total) + (render.service_price) - (render.reward_price)}
                                            </>
                                        }
                                    />
                                </Table>
                                {/* 按钮组 */}
                                <div className="price_button">
                                    <div className="back_btn" onClick={() => this.backList()}>
                                        <Button>关闭</Button>
                                    </div>
                                    <div className="btn_item">
                                        <Button onClick={() => this.getRefund()}>退票申请</Button>
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
