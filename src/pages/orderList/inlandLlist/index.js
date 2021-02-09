/*
 * @Description: 国内订单-机票订单
 * @Author: mzr
 * @Date: 2021-02-04 15:19:03
 * @LastEditTime: 2021-02-09 09:47:36
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import { Input, DatePicker, Select, Button, Table, Tag , Pagination } from 'antd';

import HeaderTemplate from "../../../components/Header"; // 导航栏

import './inlandList.scss'
import Column from 'antd/lib/table/Column';

const { RangePicker } = DatePicker;
const { Option } = Select;
export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            dataList: [],
            searchFrom: {
                status:"", //状态
                passengerName:"", //乘机人
                "created_at": "2020-02-18",
            }
        }
    }

    async componentDidMount() {
        await this.getDataList();
    }

    // 获取航班列表
    getDataList() {
        
        // let data = {
        //     // "status":"-1",                //类型：String  可有字段  备注：订单状态 -1：全部 0：过期 1：正常 3：已出票 默认：-1
        //     // "created_at": "2020-02-18",                //类型：String  可有字段  备注：起飞时间 默认：今天00:00
        //     // "created_at_end":"",                //类型：String  可有字段  备注：到达时间 默认：今天23:59
        //     // "pnr_code":"",                //类型：String  可有字段  备注：PNR编码
        //     // "order_no":"",                //类型：String  可有字段  备注：订单号
        //     // "departure":"",                //类型：String  可有字段  备注：出发机场三字码
        //     // "arrive":"",                //类型：String  可有字段  备注：到达机场三字码
        //     // "flight_no":"",                //类型：String  可有字段  备注：航班号
        //     // "book_user":""                //类型：String  可有字段  备注：订票员
        // }
        this.$axios.post("/api/orders/list", this.state.searchFrom).then(res => {
            if (res.result === 10000) {
                this.setState({
                    dataList: res.data.data,
                })
                console.log(this.state.dataList)
            }
        })
    }

    // 跳转到详情页面
    jumpDetail(val) {
        console.log(val)
        this.props.history.push(`/inlandDetail?detail=${val}`)
    }

    
    // 选择器搜索
    SelectItem (label,val) {
        console.log(label,val)
        let data = JSON.parse(JSON.stringify(this.state.searchFrom));
        data[label] = val ? val.value : 0;
        console.log(data[label])
        this.setState({
            searchFrom:data,
        })
    }

    // 输入框搜索  
    InputItem (label,val) {
        
        let data = this.state.searchFrom;
        data[label] = val.target.value;
        console.log(data[label])
        this.setState({
            searchFrom:data,
        })
    }

    // 折叠栏展开
    openFoldBar() {
        this.setState({
            isShow: !this.state.isShow
        })
    }

    render() {
        return (
            <div className="inlandList">
                <HeaderTemplate />
                <div className="content_div">
                    <div className="filter_div">
                        <div className="nav_top">我的订单</div>
                        <div className="nav_bottom">
                            <div className="nav_div" onClick={() => (this.openFoldBar())}>
                                <div className="div_icon"></div>
                                <div className="div_title">国内机票</div>
                                <div className="icon_drop"></div>
                            </div>
                            <div className="" style={{ display: this.state.isShow ? 'block' : 'none' }}>
                                <div className="">机票订单</div>
                                <div>改签订单</div>
                                <div>退票订单</div>
                            </div>
                        </div>
                    </div>
                    <div className="list_div">
                        <div className="list_title">机票订单</div>
                        <div className="list_nav">
                            {/* <div className="nav_item">
                                <div className="item_title">出行类型</div>
                                <Radio.Group defaultValue={1}>
                                    <Radio value={1}>因公出行</Radio>
                                    <Radio value={2}>因私出行</Radio>
                                </Radio.Group>
                            </div> */}
                            <div className="nav_item">
                                <div className="item_title">乘机人</div>
                                <Input placeholder="请填写" onChange={this.InputItem.bind(this, "passengerName")}/>
                            </div>
                            <div className="nav_item">
                                <div className="item_title">行程日期</div>
                                <RangePicker />
                            </div>
                            <div className="nav_item">
                                <div className="item_title">订单号/票号</div>
                                <Input placeholder="请输入订单号/票号" onChange={this.InputItem.bind(this, "order_no")}/>
                            </div>
                            <div className="nav_item">
                                <div className="item_title">订单状态</div>
                                <Select
                                    
                                    onChange={this.SelectItem.bind(this, "status")}
                                >
                                    <Option value={1}>已预订</Option>
                                    <Option value={2}>待出票</Option>
                                    <Option value={3}>已出票</Option>
                                    <Option value={4}>出票失败</Option>
                                    <Option value={5}>已取消</Option>
                                </Select>
                            </div>
                            <div className="nav_item">
                                <Button type="primary" onClick={() => this.getDataList()}>查询</Button>
                            </div>

                        </div>
                        <div className="order_table">

                       
                            <Table
                                rowKey="key_id"
                                pagination={false}
                                dataSource={this.state.dataList}
                            >
                                <Column
                                    title="类型"
                                    dataIndex="segment_type"
                                    render={(text) =>
                                        <>
                                            {
                                                text === 1 ? "单程" :
                                                    text === 2 ? "往返" :
                                                        text === 3 ? "多程" : ""
                                            }
                                        </>
                                    }
                                ></Column>
                                <Column
                                    title="乘机人"
                                    dataIndex="passengerName"
                                    render={(text, render, index) =>
                                        <div className="table_passenger">
                                            {render.ticket_passenger.map(item => (
                                                <span className="table_passenger_list">{item.PassengerName}</span>
                                            ))}
                                        </div>
                                    }
                                ></Column>
                                <Column
                                    title="行程"
                                    render={(text, render) =>
                                        <>
                                            {
                                            <div className="route">
                                                <p>{render.ticket_segments[0].departure_CN.city_name}</p>
                                                {
                                                    render.segment_type === 1 ? <div className="single_direction"></div>
                                                        :render.segment_type === 2 ? <div className="mul_direction"></div> : ""
                                                }
                                                <p>{render.ticket_segments[render.ticket_segments.length - 1].arrive_CN.city_name}</p>
                                            </div>
                                            }
                                        </>

                                    }
                                ></Column>
                                <Column
                                    title="行程时间"
                                    dataIndex="route_time"
                                    render={(text,render) =>
                                        <>
                                            {
                                                <div className="route_time">
                                                    <div className="depart_time">{render.ticket_segments[0].departure_time}</div>
                                                    <div className="arrive_time">{render.ticket_segments[render.ticket_segments.length - 1].departure_time}</div>
                                                </div>

                                            }
                                        </>

                                    }
                                ></Column>
                                <Column
                                    title="金额"
                                    dataIndex="total_price"
                                ></Column>
                                <Column
                                    title="状态"
                                    dataIndex="status"
                                    render={(text) =>
                                        <>
                                            {
                                                text === 1 ? "已预订" :  // 取消订单
                                                    text === 2 ? "待出票" : // 取消订单
                                                        text === 3 ? "已出票" : // 退票 改签
                                                            text === 4 ? "出票失败" :  // 重新下单
                                                                text === 5 ? "已取消" : ""  // 重新下单
                                            }
                                        </>
                                    }
                                ></Column>
                                <Column
                                    title="操作"
                                    dataIndex="action"
                                    render={(text,render) => (

                                        <div className="action_div">
                                            {
                                            render.status === 1 ? <Tag color="#F87C2E">支付</Tag>
                                                :render.status === 3 ? 
                                                    <div className="ticket_issue">
                                                        <Tag>退票</Tag>
                                                        <Tag>改签</Tag>
                                                    </div>
                                                :""
                                            }
                                            <div className="action_detail" onClick={() => this.jumpDetail(render.order_no)}></div>
                                        </div>
                                    )

                                    }
                                ></Column>
                            </Table>
                            <Pagination defaultCurrent={1} total={50} showSizeChanger/>
                        </div>
                    </div>


                </div>

            </div>
        )
    }
}
