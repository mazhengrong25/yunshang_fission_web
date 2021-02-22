/*
 * @Description: 国内订单详情
 * @Author: mzr
 * @Date: 2021-02-04 15:19:50
 * @LastEditTime: 2021-02-20 19:37:47
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import { Table, Divider, Button, Breadcrumb, Modal, Radio, Input, Statistic } from "antd"

import './inlandDetail.scss'
import Column from 'antd/lib/table/Column';

const { TextArea } = Input;
const { Countdown } = Statistic;

export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isShow: false, //航班信息展开收起
            urlData: {},
            detailData: {}, //详情数据
            detailPassenger: [], //乘机人信息
            detailSegment: [], //航班信息
            detailInsure: {}, //保险信息
            insurancePassenger: [], // 有保险的乘客
            showModal: false, //弹出发送短信
        };
    }

    async componentDidMount() {

        await this.setState({
            urlData: React.$filterUrlParams(this.props.location.search),

        });

        await this.getDetail()

    }

    // 打开航班信息折叠栏
    openFoldBar(index) {
        let data = this.state.detailSegment
        data[index]['isShow'] = !data[index].isShow
        this.setState({
            detailSegment: data,
        })
    }

    // 发送短信的收起展开
    openModal() {
        this.setState({
            showModal: true
        })
    }

    // 获取详情
    getDetail() {
        let data = {
            order_no: this.state.urlData.detail || ''
        }
        this.$axios.post('/api/order/details', data).then(res => {
            if (res.result === 10000) {
                let insuranceList = []
                res.data.ticket_passenger.forEach(item => {
                    if (item.insurance_total > 0) {
                        insuranceList.push(item)
                    }
                })

                // 判断当前订单支付状态以及剩余支付时间
                let data = res.data
                if (data.status === 1 && data.left_min <= 0) {
                    data.status = 5
                }

                this.setState({
                    detailData: data,
                    detailSegment: res.data.ticket_segments,
                    detailPassenger: res.data.ticket_passenger,
                    detailInsure: res.data.insurance_msg,
                    insurancePassenger: insuranceList
                })
                console.log(this.state.detailSegment)
            }
        })
    }

    // 返回到列表
    backList() {
        this.props.history.push('/inlandList')
    }


    // 支付时间结束 关闭订单
    closeOrderStatus = () => {
        let data = this.state.detailData
        data.status = 5
        this.setState({
            detailData: data
        })
    }

    render() {
        return (
            <div className="inlandDetail">
                <div className="content_div">
                    <div className="content_nav">
                        <Breadcrumb separator="<">
                            <Breadcrumb.Item>我的订单</Breadcrumb.Item>
                            <Breadcrumb.Item href="">机票订单</Breadcrumb.Item>
                            <Breadcrumb.Item href="">订单详情</Breadcrumb.Item>
                        </Breadcrumb>
                    </div>
                    {/* 待支付 */}
                    {(this.state.detailData.status === 1 && this.state.detailData.left_min > 0) ?
                        (<div className="pay_div">
                            <div className="pay_title">订单请在{this.state.detailData.left_min}分钟内完成支付</div>

                            <div className="pay_time">
                                <Countdown format="mm:ss"
                                    value={this.$moment().add(this.state.detailData.left_min, 'm')}
                                    onFinish={this.closeOrderStatus}
                                />
                            </div>
                        </div>) : ''}
                    {/* 订单信息 */}
                    <div className="content_status">
                        <div className="order_space">
                            <div className="order_div">
                                <div className="order_number">订单编号</div>
                                <div className="input_number">{this.state.detailData.order_no}</div>
                                <div className="number_copy"></div>
                            </div>
                            <div style={{ flex: 1 }}></div>
                            <div className="order_status"
                                style={{
                                    color: this.state.detailData.status === 1 ? "#F36969"
                                        : this.state.detailData.status === 2 ? "#5B7CF0"
                                            : this.state.detailData.status === 3 ? "#32D197"
                                                : this.state.detailData.status === 5 ? "#3A3B50" : ""
                                }}

                            >
                                {this.state.detailData.status === 1 ? "待支付"
                                    : this.state.detailData.status === 2 ? "出票中"
                                        : this.state.detailData.status === 3 ? "已出票"
                                            : this.state.detailData.status === 5 ? "已取消" : ""}
                            </div>
                        </div>
                        <div className="order_space">
                            <div className="order_div">
                                <div className="order_number">预定人</div>
                                <div className="input_number_crease">{this.state.detailData.book_user}</div>
                            </div>
                            {this.state.detailData.status === 1 ?
                                (
                                    <div className="order_div">
                                        <div className="order_number">下单时间</div>
                                        <div className="input_number_crease">{this.state.detailData.created_at}</div>
                                    </div>
                                ) :
                                (
                                    <div className="order_not_pay">

                                        <div className="order_div">
                                            <div className="order_number">支付时间</div>
                                            <div className="input_number_crease">{this.state.detailData.pay_time}</div>
                                        </div>
                                        <div className="order_div">
                                            <div className="order_number">支付方式</div>
                                            <div className="input_number_crease">{this.state.detailData.pay_type}</div>
                                        </div>
                                    </div>

                                )
                            }

                            <div style={{ flex: 1 }}></div>
                            <div className="order_div">
                                <div className="order_number">金额</div>
                                <div className="input_number">&yen;{this.state.detailData.total_price}</div>
                            </div>
                        </div>
                    </div>
                    {/* 航班信息 */}
                    {this.state.detailSegment.map((item, index) => (
                        <div className="flight_div" key={item.id}>
                            <div className="flight_title">航班信息</div>
                            <div className="flight_detail">

                                <div className="flight_type">
                                    {this.state.detailData.segment_type === 1 ? '单程' : ""}
                                </div>

                                <div className="flight_route">
                                    <div className="flight_address">
                                        {`${item.departure_CN.city_name} - 
                                            ${item.arrive_CN.city_name}`}
                                    </div>
                                    <div className="flight_date">
                                        {item.departure_time.substring(0, 10)}
                                        {this.$moment(item.departure_time).format('ddd')}
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}></div>
                                <div className="route_div">
                                    <div className="center_route">
                                        <div className="flight_time">
                                            {item.departure_time.substring(11, 16)}
                                        </div>
                                        <div className="flight_airport">
                                            {`${item.departure_CN.city_name}${item.departure_CN.air_port_name}机场${item.departure_terminal}`}
                                        </div>
                                    </div>
                                    <div className="flight_icon"></div>
                                    <div className="center_route">
                                        <div className="flight_time">
                                            {item.arrive_time.substring(11, 16)}
                                        </div>
                                        <div className="flight_airport">
                                            {`${item.arrive_CN.city_name}${item.arrive_CN.air_port_name}机场${item.arrive_terminal}`}
                                        </div>
                                    </div>
                                </div>
                                <div style={{ flex: 1 }}></div>
                                <div className="flight_entry">
                                    <div className="entry_item">退改20%-100%</div>
                                    <Divider type="vertical" />
                                    <div className="entry_item">行李额20KG</div>
                                </div>
                            </div>
                            {/* 展开内容 */}
                            <div className="open_content" style={{ display: item.isShow ? 'block' : 'none' }}>
                                <div className="content_div_open">
                                    <div className="open_left">
                                        <div className="left_div">
                                            <div className="open_left_date">
                                                {item.departure_time.substring(5, 10)}
                                            </div>
                                            <div className="open_left_date">
                                                {item.arrive_time.substring(5, 10)}
                                            </div>
                                        </div>
                                        <div className="left_div">
                                            <div className="open_left_time">
                                                {item.departure_time.substring(11, 16)}
                                            </div>
                                            <div className="open_left_time">
                                                {item.arrive_time.substring(11, 16)}
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
                                    <div style={{ flex: 1 }}></div>
                                    <div className="open_middle">
                                        <div className="middle_icon">
                                            <img src={this.$url + item.image} alt=""/>
                                        </div>
                                        <div className="middle_fly_type">{item.airline_CN.air_name}</div>
                                        <div className="middle_fly_modal">
                                            {`${item.flight_no}
                                                机型${item.model}`}
                                        </div>
                                        <div className="middle_fly_cabin">
                                            {
                                                item.cabin_level === "ECONOMY"?"经济舱":
                                                    item.cabin_level === "FIRST"?"头等舱":
                                                        item.cabin_level === "BUSINESS"?"公务舱":""
                                            }
                                         </div>
                                        <div class                                                                                                                                                                                                                                                                                                                                                        Name="middle_fly_meal"></div>
                                    </div>
                                    <div style={{ flex: 1 }}></div>
                                    <div className="open_right">
                                        <div className="right_icon"></div>
                                        <div className="right_consume">2h30m</div>
                                    </div>
                                </div>

                            </div>

                            <div className="open" onClick={() => (this.openFoldBar(index))}>{item.isShow ? '收起' : '展开'}</div>
                        </div>
                    ))}
                    {/* 乘机人信息 */}
                    <div className="content_item">
                        <div className="item_title">乘机人信息</div>

                        {this.state.detailPassenger.map((item, index) => (
                            <div className="passenger_message" key={item.id}>
                                <div className="message_nav">
                                    <div className="passenger_number">乘机人{index + 1}</div>
                                    <Button type="link" onClick={() => this.openModal()}>给该乘机人发送行程通知（短信，邮件）</Button>
                                </div>
                                <div className="message_div">
                                    <div className="item_space">
                                        <div className="message_item">
                                            <div className="message_head"></div>
                                            <div className="passenger_name">{item.PassengerName}</div>
                                            <div className="passenger_identity">信息中心</div>
                                        </div>
                                        <div className="div_item">
                                            <div className="div_title">证件:</div>
                                            <div className="div_input">
                                                {item.Credential === "0" ? "身份证"
                                                    : item.Credential === "1" ? "护照"
                                                        : item.Credential === "2" ? "港澳通行证"
                                                            : item.Credential === "3" ? "台胞证"
                                                                : item.Credential === "4" ? "回乡证"
                                                                    : item.Credential === "5" ? "台湾通行证"
                                                                        : item.Credential === "6" ? "入台证"
                                                                            : item.Credential === "7" ? "国际海员证"
                                                                                : item.Credential === "8" ? "其它证件" : ""
                                                }
                                            </div>
                                        </div>
                                        <div className="div_item">
                                            <div className="div_title">证件号:</div>
                                            <div className="div_input">{item.CredentialNo}</div>
                                        </div>
                                        <div className="div_item">
                                            <div className="div_title">成本中心:</div>
                                            <div className="div_input">{item.ticket_department}</div>
                                        </div>
                                    </div>
                                    <div className="item_space" style={{ marginLeft: 44 }}>
                                        <div className="div_item">
                                            <div className="div_title">手机:</div>
                                            <div className="div_input">{item.phone}</div>
                                        </div>
                                        <div className="div_item">
                                            <div className="div_title">邮箱:</div>
                                            <div className="div_input">{item.email || '无'}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                    </div>
                    {/* 联系人 */}
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
                            <div className="item_space">
                                <Button type="link" style={{ padding: 0 }} onClick={() => this.openModal()}>给该乘机人发送行程通知（短信，邮件）</Button>
                            </div>
                        </div>
                    </div>
                    {/* 保险服务 */}
                    {/* <div className="insure_div">
                        <div className="insure_space">
                            <div className="space_title">{this.state.detailInsure.insure_desc}</div>
                            <div className="space_amount">&yen;{20}</div>
                        </div>
                        <div className="insure_space">
                            <div className="insure_item">
                                <div className="insure_icon"></div>
                            </div>
                        </div>
                    </div> */}
                    <div className="content_item">
                        <div className="item_title">保险服务</div>

                        {this.state.insurancePassenger.length > 0 ?
                            (<div className="insure_table">
                                <Table
                                    pagination={false}
                                    dataSource={this.state.insurancePassenger}
                                >
                                    <Column title="乘客姓名" dataIndex="PassengerName" />
                                    <Column title="保险名称"
                                        render={() => {
                                            return this.state.detailInsure.insure_desc
                                        }}
                                    />
                                    <Column title="保险单价"
                                        render={() => {
                                            return this.state.detailInsure.default_dis_price
                                        }}
                                    />

                                </Table>
                            </div>) :
                            (<div className="contact_div">
                                <div className="not_insure">订单未购买保险服务</div>
                            </div>)
                        }
                    </div>
                    {/* 报销凭证 */}
                    {/* <div className="content_item">
                        <div className="item_title">报销凭证</div>
                        <div className="voucher_div">
                            <div className="item_space">
                                <div className="div_item">
                                    <div className="div_title">配送方式</div>
                                    <div className="div_input">邮寄（20元）</div>
                                </div>
                                <div className="div_item">
                                    <div className="div_title">支付方式</div>
                                    <div className="div_input">线上支付</div>
                                </div>
                            </div>
                            <div className="item_space">
                                <div className="address_div"></div>
                            </div>
                        </div>
                    </div> */}
                    {/* 价格明细 */}
                    <div className="content_item">
                        <div className="item_title">价格明细</div>
                        <div className="price_div">
                            <Table
                                rowKey="key_id"
                                pagination={false}
                                dataSource={this.state.detailPassenger}
                            >
                                <Column title="姓名" dataIndex="PassengerName" key="PassengerName" />
                                <Column title="类型"
                                    dataIndex="PassengerType"
                                    key="PassengerType"
                                    render={(text) =>
                                        <>
                                            {
                                                text === "CNN" ? "儿童" :
                                                    text === "ADT" ? "成人" :
                                                        text === "INF" ? "婴儿" : ""

                                            }
                                        </>
                                    }
                                />
                                <Column title="票价" dataIndex="ticket_price" key="ticket_price"
                                    render={(text) => (
                                        <>&yen;{text}</>
                                    )

                                    }
                                />
                                <Column title="机建" dataIndex="build_total" key="build_total"
                                    render={(text) => (
                                        <>&yen;{text}</>
                                    )

                                    }
                                />
                                <Column title="燃油" dataIndex="fuel_total" key="fuel_total"
                                    render={(text) => (
                                        <>&yen;{text}</>
                                    )

                                    }
                                />
                                <Column title="保险" dataIndex="insurance_total" key="insurance_total"
                                    render={(text) => (
                                        <>&yen;{text}</>
                                    )

                                    }
                                />
                                <Column title="服务费" dataIndex="service_price" key="service_price"
                                    render={(text) => (
                                        <>&yen;{text}</>
                                    )

                                    }
                                />
                                <Column 
                                    title="共计"
                                  dataIndex="ticket_price"
                                    render={(text, col, index) => {
                                        if (index === 0) {
                                            return {
                                                children: <div className="ticket_price">&yen;{text}</div>,
                                                props: {
                                                    rowSpan: this.state.detailPassenger.length,
                                                }
                                            }
                                        } else {
                                            return {
                                                props: {
                                                    rowSpan: 0,
                                                }
                                            }
                                        }

                                    }}
                                />

                            </Table>

                            {this.state.detailData.status === 1 ?
                                (
                                    <div className="price_button">
                                        <div className="back_btn" onClick={() => (this.backList())}><Button>返回</Button></div>
                                        <div className="btn_item"><Button>退票</Button></div>
                                        <div className="btn_item"><Button>改签</Button></div>
                                    </div>
                                ) :
                                this.state.detailData.status === 5 ?
                                    (
                                        <div className="price_button">
                                            <Button>返回</Button>
                                        </div>
                                    ) : ""
                            }

                        </div>
                    </div>
                    {/* 支付方式 */}
                    {this.state.detailData.status === 1 && this.state.detailData.left_min > 0 ?
                        (
                            <div className="content_item">
                                <div className="item_title">支付方式</div>
                                <div className="payment_div">
                                    <div className="cancel_btn">
                                        <Button>取消订单</Button>
                                    </div>
                                    <div className="pay_btn">
                                        <Button>立即支付<span className="pay_money">&yen;{this.state.detailData.total_price}</span></Button>
                                    </div>
                                </div>
                            </div>
                        ) : ''
                    }
                    {/* 发送短信弹出 */}
                    <Modal
                        width={800}
                        title="发送短信"
                        visible={this.state.showModal}
                        onCancel={() => this.setState({
                            showModal: false
                        })}
                    >
                        <div className="modal_box">
                            <div className="modal_item">
                                <div className="modal_title">发送对象</div>
                                <div className="modal_content">
                                    <Radio.Group>
                                        <Radio value={1}>联系人</Radio>
                                        <Radio value={2}>乘机人</Radio>
                                    </Radio.Group>
                                </div>
                            </div>
                            <div className="modal_item">
                                <div className="modal_title">手机号</div>
                                <div className="modal_content">
                                    <Input placeholder="请输入手机号" />
                                </div>
                            </div>
                            <div className="modal_item">
                                <div className="modal_title">选择模板</div>
                                <div className="modal_content">

                                </div>
                            </div>
                            <div className="modal_item">
                                <div className="modal_title">发送内容</div>
                                <div className="modal_content">
                                    <TextArea
                                        placeholder="请填写发送内容"
                                        autoSize={{ minRows: 3, maxRows: 5 }}
                                    />
                                </div>
                            </div>
                        </div>
                    </Modal>
                </div>
            </div>
        )
    }
}
