/*
 * @Description: 国内订单-机票订单
 * @Author: mzr
 * @Date: 2021-02-04 15:19:03
 * @LastEditTime: 2021-02-20 16:32:19
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import { Input, DatePicker, Select, Button, Table, Tag, Pagination, Menu } from 'antd';

// 菜单栏图标
import InlandIcon from '../../../static/inland_icon.png';
import InterIcon from '../../../static/inter_icon.png';

import './inlandList.scss'
import Column from 'antd/lib/table/Column';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { SubMenu } = Menu;

export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            dataList: [],
            searchFrom: {
                status: "", //状态
                passengerName: "", //乘机人
                "created_at": this.$moment().subtract(3, 'days').format('YYYY-MM-DD'),
            },
            paginationData: {
                current_page: 1, //当前页数
                per_page: 5, //每页条数	
                total: 0
            },
        }
    }

    async componentDidMount() {
        await this.getDataList();
    }

    // 获取航班列表
    getDataList() {

        let data = this.state.searchFrom
        data['page'] = this.state.paginationData.page
        data['limit'] = this.state.paginationData.per_page

        this.$axios.post("/api/orders/list", data).then(res => {
            if (res.result === 10000) {

                let newPage = this.state.paginationData
                newPage.total = res.data.total
                newPage.current_page = res.data.current_page
                this.setState({
                    dataList: res.data.data,
                    paginationData: newPage,
                })
                console.log(this.state.paginationData)
                console.log(this.state.dataList)
            }
        })
    }

    // 跳转到详情页面
    jumpDetail(val) {
        console.log(val)
        this.props.history.push(`/inlandDetail?detail=${val}`)
    }

    // 分页
    changePagination = async (page, pageSize) => {

        console.log(page, pageSize)
        
        let data = this.state.paginationData
        data['page'] = page;
        data['limit'] = pageSize;

        console.log(data)

        await this.setState({
            paginationData: data,
        })
        await this.getDataList();
    }


    // 选择器搜索
    SelectItem(label, val) {
        let data = this.state.searchFrom
        data[label] = val ? val.value : 0;
        this.setState({
            searchFrom: data,
        })
    }

    // 输入框搜索  
    InputItem(label, val) {
        let data = this.state.searchFrom;
        data[label] = val.target.value;
        console.log(data[label])
        this.setState({
            searchFrom: data,
        })
    }

    // 日期搜索
    PickerItem(start, end, val, stringVal) {
        console.log(start, end, stringVal)
        let newData = this.state.searchFrom
        newData[start] = stringVal[0] ? stringVal[0] : this.$moment().subtract(3, 'days').format('YYYY-MM-DD')
        newData[end] = stringVal[1] ? stringVal[1] : this.$moment().format('YYYY-MM-DD')
        this.setState({
            searchFrom: newData
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
                <div className="content_div">
                    <div className="filter_div">
                        <div className="nav_top">我的订单</div>
                        <div className="nav_bottom">
                            {/* <div className="nav_div" onClick={() => (this.openFoldBar())}>
                                <div className="div_icon"></div>
                                <div className="div_title">国内机票</div>
                                <div className="icon_drop"></div>
                            </div>
                            <div className="" style={{ display: this.state.isShow ? 'block' : 'none' }}>
                                <div className="">机票订单</div>
                                <div>改签订单</div>
                                <div>退票订单</div>
                            </div> */}
                            <Menu
                                onClick={this.handleClick}
                                style={{ width: 184 }}
                                mode="inline"
                            >
                                <SubMenu key="inland" title="国内机票"
                                    icon={<div className="menu_icon"><img src={InlandIcon} alt="" /></div>}>
                                    <Menu.Item key="inland_ticket">机票订单</Menu.Item>
                                    <Menu.Item key="inland_change">改签订单</Menu.Item>
                                    <Menu.Item key="inland_refund">退票订单</Menu.Item>
                                </SubMenu>
                                <SubMenu key="inter" title="国际机票"
                                    icon={<div className="menu_icon"><img src={InterIcon} alt="" /></div>}>

                                    <Menu.Item key="inter_ticket">机票订单</Menu.Item>
                                    <Menu.Item key="inter_change">改签订单</Menu.Item>
                                    <Menu.Item key="inter_refund">退票订单</Menu.Item>
                                </SubMenu>
                            </Menu>
                        </div>
                    </div>
                    <div className="list_div">
                        <div className="list_title">机票订单</div>
                        <div className="list_nav">
                            <div className="nav_item">
                                <div className="item_title">乘机人</div>
                                <div className="item_import">
                                    <Input placeholder="请填写" allowClear onChange={this.InputItem.bind(this, "passengerName")} />
                                </div>
                            </div>
                            <div className="nav_item">
                                <div className="item_title">行程日期</div>
                                <RangePicker onChange={this.PickerItem.bind(this, "created_at", "created_at_end")} />
                            </div>
                            <div className="nav_item">
                                <div className="item_title">订单号/票号</div>
                                <div className="item_import">
                                    <Input placeholder="请输入订单号/票号" allowClear onChange={this.InputItem.bind(this, "order_no")} />
                                </div>
                            </div>
                            <div className="nav_item">
                                <div className="item_title">订单状态</div>
                                <div className="item_import">
                                    <Select
                                        allowClear
                                        labelInValue
                                        placeholder="请选择"
                                        onChange={this.SelectItem.bind(this, "status")}
                                    >
                                        <Option value={1}>已预订</Option>
                                        <Option value={2}>待出票</Option>
                                        <Option value={3}>已出票</Option>
                                        <Option value={4}>出票失败</Option>
                                        <Option value={5}>已取消</Option>
                                    </Select>
                                </div>
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
                                    key="segment_type"
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
                                    key="passengerName"
                                    render={(text, render, index) =>
                                        <div className="table_passenger">
                                            {render.ticket_passenger.map(item => (
                                                <span key={item.id} className="table_passenger_list">{item.PassengerName}</span>
                                            ))}
                                        </div>
                                    }
                                ></Column>
                                <Column
                                    title="行程"
                                    key="route"
                                    render={(text, render) =>
                                        <>
                                            {
                                                <div className="route">
                                                    <p>{render.ticket_segments[0].departure_CN.city_name}</p>
                                                    {
                                                        render.segment_type === 1 ? <div className="single_direction"></div>
                                                            : render.segment_type === 2 ? <div className="mul_direction"></div> : ""
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
                                    key="route_time"
                                    render={(text, render) =>
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
                                    key="total_price"
                                ></Column>
                                <Column
                                    title="状态"
                                    dataIndex="status"
                                    key="status"
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
                                    key="action"
                                    render={(text, render) => (

                                        <div className="action_div">
                                            {
                                                render.status === 1 ? <Tag color="#F87C2E">支付</Tag>
                                                    : render.status === 3 ?
                                                        <div className="ticket_issue">
                                                            <Tag>退票</Tag>
                                                            <Tag>改签</Tag>
                                                        </div>
                                                        : ""
                                            }
                                            <div className="action_detail" onClick={() => this.jumpDetail(render.order_no)}></div>
                                        </div>
                                    )

                                    }
                                ></Column>
                            </Table>
                            {/* 分页 */}
                            <div className="table_pagination">

                                <Pagination
                                    showSizeChanger
                                    showTitle={false}
                                    total={Number(this.state.paginationData.total)}
                                    current={Number(this.state.paginationData.current_page)}
                                    pageSize={Number(this.state.paginationData.per_page)}
                                    onChange={this.changePagination}
                                />
                            </div>
                        </div>
                    </div>


                </div>

            </div>
        )
    }
}
