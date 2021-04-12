/*
 * @Description: 国内机票-退票列表
 * @Author: mzr
 * @Date: 2021-04-08 13:47:33
 * @LastEditTime: 2021-04-12 14:47:06
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import './inlandRefund.scss'
import Column from "antd/lib/table/Column";

import {
    Input,
    DatePicker,
    Select,
    Button,
    Table,
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
            dataList:[], // 退票列表
            paginationData: {
                current_page: 1, // 当前页数
                per_page: 10, // 每页条数
                total: 0,
            },
            searchFrom: {
            
                passengerName: "", // 乘机人
                ticket_no:"", // 票号
                pnr_code:"", // pnr
                order_status:0, // 退票状态
                created_at:this.$moment().subtract(4, "days").format("YYYY-MM-DD"), // 日期
            },
        };
    }

    async componentDidMount() {
        
        await this.getRefundList();
    }

    // 获取退票列表
    getRefundList() {
        let data = {
            start_date:this.state.searchFrom.created_at,                //类型：String  可有字段  备注：申请日期开始，默认为今日00:00  2021-01-11
            end_date:"2021-04-08",                //类型：String  可有字段  备注：申请日期结束，默认为今日23:00  2021-04-08
            ticket_no:this.state.searchFrom.ticket_no,                //类型：String  可有字段  备注：票号
            pnr_code:this.state.searchFrom.pnr_code,                //类型：String  可有字段  备注：编码
            PassengerName:this.state.searchFrom.passengerName,                //类型：String  可有字段  备注：乘客名称
            order_status:this.state.searchFrom.order_status,                //类型：String  可有字段  备注：退款状态 1申请中 2 已处理3已取消
            is_abandon:1,                //类型：String  可有字段  备注：是否废票 1 否 2是
            admin_id:"",                //类型：String  可有字段  备注：申请退票员login_name
            passenger_type:"",                //类型：String  可有字段  备注：旅客类型：CNN ADT INF
            order_type:0,                //类型：String  可有字段  备注：0：客户单 1：手工单
            order_by:"desc",                //类型：String  可有字段  备注：desc倒叙，asc升序，默认ID倒序
            // order_by_field:"mock",                //类型：String  可有字段  备注：排序字段，默认id
            page:1               //类型：String  可有字段  备注：页数，默认为1
        }

        data["page"] = this.state.paginationData.page;
        data["limit"] = this.state.paginationData.per_page;
                
         this.$axios.post("/api/refund/list",data).then((res) => {
            if(res.errorcode === 10000) {
                
                // 表格分页
                let newPage = this.state.paginationData
                newPage.current_page = res.data.current_page
                newPage.total = res.data.total

                this.setState({
                    dataList: res.data.data,
                    paginationData: newPage
                })
                console.log('退票列表',this.state.dataList)
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

        console.log(data);

        await this.setState({
            paginationData: data,
        });
        await this.getRefundList();
    };

    // 查询 筛选
    serachBtn() {
        this.getRefundList();
    }

    // 跳转到详情页面
    jumpDetail (e) {
        console.log(this.props.history)
        this.props.history.push(`/refundDetail?detail=${e}`);
    }

    // 输入框搜索
    InputItem(label,val) {
        let data = this.state.searchFrom;
        data[label] = val.target.value;
        this.setState({
          searchFrom: data,
        });
    }

    // 选择器搜索
    SelectItem(label, val) {
        let data = this.state.searchFrom;
        data[label] = val ? val.value : 0;
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

    render() {
        return (
            <div className="refundList">
                <div className="list_div">
                    <div className="list_title">退票订单</div>
                    <div className="list_nav">
                        <div className="nav_item">
                            <div className="item_title">乘机人</div>
                            <div className="item_import">
                                <Input
                                    placeholder="请填写"
                                    allowClear
                                    value={this.state.searchFrom.passengerName}
                                    onChange={this.InputItem.bind(this, "passengerName")}
                                />
                            </div>
                        </div>
                        <div className="nav_item">
                            <div className="item_title">票号</div>
                            <div className="item_import">
                                <Input
                                    placeholder="请输入票号"
                                    allowClear
                                    value={this.state.searchFrom.ticket_no}
                                    onChange={this.InputItem.bind(this, "ticket_no")}
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
                                    onChange={this.InputItem.bind(this,"pnr_code")}
                                />
                            </div>
                        </div>
                        <div className="nav_item">
                            <div className="item_title">退票状态</div>
                            <div className="item_import">
                                <Select
                                    labelInValue
                                    placeholder="请选择"
                                    value={{ value: this.state.searchFrom.order_status }}
                                    onChange={this.SelectItem.bind(this, "order_status")}
                                > 
                                    <Option value={0}>全部</Option>
                                    <Option value={1}>申请中</Option>
                                    <Option value={2}>成功</Option>
                                    <Option value={3}>失败</Option>
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
                            dataSource={this.state.dataList}
                        >
                            <Column
                                width={"12%"}
                                title="类型"
                                dataIndex="segment_type"
                                render={(text,render) => (
                                    <>
                                    {render.ticket_segments[0].segment_type === 0
                                        ? "单程"
                                        : render.ticket_segments[0].segment_type === 1
                                        ? "往返"
                                        : render.ticket_segments[0].segment_type === 2
                                        ? "多程"
                                        : ""}
                                    </>
                                )}
                            ></Column>
                            <Column
                                width={"17%"}
                                title="乘机人"
                                render={(text, render) => (
                                    <div className="table_passenger">
                                        {render.ticket_refund_passenger.map((item, index) => (
                                            <span key={item.id} className="table_passenger_list">
                                                {item.ticket_passenger.PassengerName}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            ></Column>
                            <Column
                                width={"17%"}
                                title="行程"
                                render={(text, render) => (
                                    <>
                                    {
                                        <div className="route">
                                        <p>{render.ticket_segments[0].departure_CN.city_name}</p>
                                        <div className="direction">
                                            <img
                                            src={
                                                render.ticket_segments[0].segment_type === 0
                                                ? singleDirectionIcon
                                                : mulDirectionIcon
                                            }
                                            alt="单向图标"
                                            ></img>
                                        </div>

                                        <p>
                                            {
                                            render.ticket_segments[render.ticket_segments.length - 1]
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
                                                {render.ticket_segments[0].departure_time}
                                            </div>
                                            <div className="arrive_time">
                                                {
                                                render.ticket_segments[render.ticket_segments.length - 1]
                                                    .departure_time
                                                }
                                            </div>
                                            </div>
                                        }
                                    </>
                                )}
                            ></Column>
                            <Column 
                                width={"10%"} 
                                title="金额" 
                                render={(text,render) => (
                                    <>
                                        {render.ticket_refund_passenger[0].ticket_price}
                                    </>
                                )}
                            ></Column>
                            <Column
                                title="状态"
                                width={"10%"}
                                dataIndex="order_status"
                                render={(text, render) => (
                                    <>
                                        {
                                            text === 1 ? "申请中":
                                                text === 2 ? "成功":
                                                    text === 3 ? "失败": ""
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
