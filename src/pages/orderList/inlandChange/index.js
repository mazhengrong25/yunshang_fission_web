/*
 * @Description: 国内订单 --- 改签列表
 * @Author: mzr
 * @Date: 2021-04-14 09:11:08
 * @LastEditTime: 2021-04-15 11:46:32
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import './inlandChange.scss'
import Column from "antd/lib/table/Column";

import {
    Input,
    Select,
    Button,
    Table,
    DatePicker,
    Pagination,
} from 'antd'

import singleDirectionIcon from "../../../static/single_direction.png"; // 单程图标
import mulDirectionIcon from "../../../static/mul_direction.png"; // 往返图标

const { RangePicker } = DatePicker;
const { Option } = Select;


export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            changeData: [], // 改签列表

            paginationData: {
                current_page: 1, // 当前页数
                per_page: 10, // 每页条数
                total: 0,
            },

            searchFrom: {
                PassengerName: "", // 乘机人
                pnr_code: "", // pnr
                change_status: 0, // 订单状态
                created_at: this.$moment().subtract(3, "days").format("YYYY-MM-DD"), // 日期
                order_no: "", // 订单号
                ticket_no: "", // 票号  不可以
                order_input: '', // 订单号，票号的输入值
                order_status: 0 // 订单号，票号取值
            }
        };
    }

    async componentDidMount() {

        if (sessionStorage.getItem("changeList")) {
            await this.setState({
                searchFrom: JSON.parse(sessionStorage.getItem("changeList")),
            });
        }
        await this.getChangeList();
    }

    // 获取改签列表
    getChangeList() {
        let data = {
            change_status: this.state.searchFrom.change_status,                //类型：String  必有字段  备注：改签状态 1 申请中 2 待支付 3 待出票 4完成
            created_at: this.state.searchFrom.created_at,                //类型：String  必有字段  备注：申请开始时间
            created_at_end: "2021-04-14",                //类型：String  必有字段  备注：申请结束结束时间
            order_no: this.state.searchFrom.order_no,                //类型：String  可有字段  备注：订单号
            pnr_code: this.state.searchFrom.pnr_code,                //类型：String  可有字段  备注：pnr
            ticket_no: this.state.searchFrom.ticket_no,                //类型：String  可有字段  备注：票号
            passenger_name: this.state.searchFrom.PassengerName,                //类型：String  可有字段  备注：乘客名称
            passenger_type: "",                //类型：String  可有字段  备注：乘客类型ADT,CHD,INF
            page: "1",                //类型：String  可有字段  备注：页数，默认1
            limit: "20",                //类型：String  可有字段  备注：每页多少条，默认20
            order_by: "desc",                //类型：String  可有字段  备注：desc倒叙，asc升序，默认id倒序
            order_by_field: "id"                //类型：String  可有字段  备注：排序字段，默认id
        }
        this.$axios.post("/api/change/list", data).then((res) => {
            if (res.errorcode === 10000) {

                // 表格分页
                let newPage = this.state.paginationData
                newPage.current_page = res.data.current_page
                newPage.total = res.data.total

                this.setState({
                    changeData: res.data.data,
                    paginationData: newPage

                })
                console.log("改签列表", this.state.changeData)
            }
        })
    }

    // 每页显示条数
    changePageSize = async (current, size) => {
        console.log("current, size", current, size);
        let data = this.state.paginationData;
        data["current_page"] = current;
        data["per_page"] = size;

        await this.setState({
            paginationData: data,
        });
    };

    // 分页
    changePagination = async (page, pageSize) => {
        console.log(page, pageSize);

        let data = this.state.paginationData;
        data["page"] = page;
        data["limit"] = pageSize;

        await this.setState({
            paginationData: data,
        });
        await this.getChangeList();
    };

    // 输入框搜索
    InputItem(label, val) {
        let data = this.state.searchFrom;
        data[label] = val.target.value;
        this.setState({
            searchFrom: data,
        });
    }

    // 选择器搜索
    SelectItem(label, val) {
        console.log(label, val)
        let data = this.state.searchFrom;
        data[label] = val;
        this.setState({
            searchFrom: data,
        });
    }

    // 日期选择器搜索
    PickerItem(start, end, val, stringVal) {
        console.log(start, end, stringVal);
        let newData = this.state.searchFrom;
        newData[start] = stringVal[0]
            ? stringVal[0]
            : this.$moment().subtract(3, "days").format("YYYY-MM-DD");
        newData[end] = stringVal[1] ? stringVal[1] : this.$moment().format("YYYY-MM-DD");
        this.setState({
            searchFrom: newData,
        });
    }

    // 查询 筛选
    async serachBtn() {
        // 订单号 票号处理
        let data = this.state.searchFrom
        data['ticket_no'] = data.order_status === 0 ? data.order_input : ""
        data['order_no'] = data.order_status === 1 ? data.order_input : ''

        await this.setState({
            searchFrom: data
        })
        sessionStorage.setItem("changeList", JSON.stringify(data));
        console.log(data)
        await this.getChangeList();
    }

    // 跳转到详情页面
    jumpDetail(e) {
        this.props.history.push(`/changeDetail?detail=${e}`);
    }

    render() {
        return (
            <div className="changeList">
                <div className="list_div">
                    <div className="list_title">改签订单</div>
                    <div className="list_nav">
                        <div className="nav_item">
                            <div className="item_title">乘机人</div>
                            <div className="item_import">
                                <Input
                                    placeholder="请填写"
                                    allowClear
                                    value={this.state.searchFrom.PassengerName}
                                    onChange={this.InputItem.bind(this, "PassengerName")}
                                />
                            </div>
                        </div>
                        <div className="nav_item">
                            <div className="item_title">
                                <Select
                                    style={{width: 90}}
                                    value={this.state.searchFrom.order_status}
                                    onChange={this.SelectItem.bind(this, "order_status")}
                                >
                                    <Option value={0}>票号</Option>
                                    <Option value={1}>订单号</Option>
                                </Select>
                            </div>
                            <div className="item_import">
                                <Input
                                    placeholder="请输入票号/订单号"
                                    allowClear
                                    value={this.state.searchFrom.order_input}
                                    onChange={this.InputItem.bind(this, "order_input")}
                                />
                            </div>
                        </div>
                        <div className="nav_item">
                            <div className="item_title">申请日期</div>
                            <div className="item_import">
                                <RangePicker
                                    value={[
                                        this.$moment(this.state.searchFrom.created_at),
                                        this.$moment(this.state.searchFrom.created_at_end),
                                    ]}
                                    onChange={this.PickerItem.bind(this, "created_at", "created_at_end")}
                                />
                            </div>
                        </div>
                        <div className="nav_item">
                            <div className="item_title">PNR</div>
                            <div className="item_import">
                                <Input
                                    placeholder="请填写"
                                    allowClear
                                    value={this.state.searchFrom.pnr_code}
                                    onChange={this.InputItem.bind(this, "pnr_code")}
                                />
                            </div>
                        </div>
                        <div className="nav_item">
                            <div className="item_title">订单状态</div>
                            <div className="item_import">
                                <Select
                                    placeholder="请选择"
                                    value={this.state.searchFrom.change_status}
                                    onChange={this.SelectItem.bind(this, "change_status")}
                                >
                                    <Option value={0}>全部</Option>
                                    <Option value={1}>申请中</Option>
                                    <Option value={2}>待支付</Option>
                                    <Option value={3}>待出票</Option>
                                    <Option value={4}>完成</Option>
                                </Select>
                            </div>
                        </div>
                        <div className="nav_item" style={{ marginLeft: 20 }}>
                            <Button type="primary" onClick={() => this.serachBtn()}>
                                查询
                            </Button>
                        </div>
                    </div>
                    <div className="order_table">
                        <Table
                            rowKey="id"
                            pagination={false}
                            dataSource={this.state.changeData}
                        >
                            <Column
                                width={"13%"}
                                title="乘机人"
                                render={(text, render) => (
                                    <div className="table_passenger">
                                        {render.change_passengers.map((item, index) => (
                                            <span key={item.id} className="table_passenger_list">
                                                {item.ticket_passenger.PassengerName}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            ></Column>
                            <Column
                                width={"10%"}
                                title="行程"
                                render={(text, render) => (
                                    <>
                                        {
                                            <div className="route">
                                                <p>{render.change_segments[0].departure_CN.city_name}</p>
                                                <div className="direction">
                                                    <img
                                                        src={
                                                            render.change_segments[0].segment_num === 1
                                                                ? singleDirectionIcon
                                                                : mulDirectionIcon
                                                        }
                                                        alt="单向图标"
                                                    ></img>
                                                </div>
                                                <p>
                                                    {
                                                        render.change_segments[render.change_segments.length - 1]
                                                            .arrive_CN.city_name
                                                    }
                                                </p>
                                            </div>
                                        }
                                    </>
                                )}
                            ></Column>
                            <Column
                                width={"17%"}
                                title="行程时间"
                                render={(text, render) => (
                                    <>
                                        {
                                            <div className="route_time">
                                                <div className="depart_time">
                                                    {render.change_segments[0].departure_time}
                                                </div>
                                                <div className="arrive_time">
                                                    {
                                                        render.change_segments[render.change_segments.length - 1]
                                                            .arrive_time
                                                    }
                                                </div>
                                            </div>
                                        }
                                    </>
                                )}
                            ></Column>
                            <Column
                                width={"10%"}
                                title="改签费"
                                dataIndex="change_fee"
                                render={(text) => (<>{text}</>)}
                            ></Column>
                            <Column
                                width={"10%"}
                                title="需支付"
                                dataIndex="need_pay_amount"
                                render={(text) => (<>{text}</>)}
                            ></Column>
                            <Column
                                width={"17%"}
                                title="支付时间"
                                dataIndex="pay_time"
                                render={(text) => (
                                    <>{
                                        <div className="route_time">{text}</div>
                                    }</>)}
                            ></Column>
                            <Column
                                title="状态"
                                width={"10%"}
                                dataIndex="change_status"
                                render={(text, render) => (
                                    <>
                                        {
                                            text === 1 ? "申请中" :
                                                text === 2 ? "待支付" :
                                                    text === 3 ? "待出票" :
                                                        text === 4 ? "完成" : ""
                                        }
                                    </>
                                )}
                            ></Column>
                            <Column
                                title="操作"
                                width={"5%"}
                                render={(text, render) => (
                                    <div className="action_div">
                                        <div
                                            className="action_detail"
                                            onClick={() => this.jumpDetail(render.order_no)}
                                        >
                                            <span></span>
                                        </div>
                                    </div>
                                )}
                            ></Column>
                        </Table>
                        {/*表格分页 */}
                        <div className="table_pagination">
                            <Pagination
                                showSizeChanger
                                pageSizeOptions={[10, 15, 20]}
                                showTitle={false}
                                total={Number(this.state.paginationData.total)}
                                current={Number(this.state.paginationData.current_page)}
                                pageSize={Number(this.state.paginationData.per_page)}
                                onChange={this.changePagination}
                                onShowSizeChange={this.changePageSize.bind(this)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
