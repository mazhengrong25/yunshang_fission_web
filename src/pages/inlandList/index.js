/*
 * @Description: 国内列表呈现
 * @Author: mzr
 * @Date: 2021-02-02 09:30:20
 * @LastEditTime: 2021-02-05 11:58:56
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import { Divider , Image} from 'antd';

import HeaderTemplate from "../../components/Header"; // 导航栏

// 日期处理
import moment from 'moment'
import 'moment/locale/zh-cn';

import "./inland.scss"

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            dataList: [],
        }
    }

    // 打开折叠栏
    openFoldBar(index) {
        let data = this.state.dataList
        data[index]['isShow'] = !data[index].isShow
        this.setState({
            dataList: data,
        })
    }

    async componentDidMount() {
        await this.getDataList();
    }





    // 获取航班列表
    getDataList() {
        let data = {
            // "status":"-1",                //类型：String  可有字段  备注：订单状态 -1：全部 0：过期 1：正常 3：已出票 默认：-1
            "created_at": "2020-02-18",                //类型：String  可有字段  备注：起飞时间 默认：今天00:00
            // "created_at_end":"",                //类型：String  可有字段  备注：到达时间 默认：今天23:59
            // "pnr_code":"",                //类型：String  可有字段  备注：PNR编码
            // "order_no":"",                //类型：String  可有字段  备注：订单号
            // "departure":"",                //类型：String  可有字段  备注：出发机场三字码
            // "arrive":"",                //类型：String  可有字段  备注：到达机场三字码
            // "flight_no":"",                //类型：String  可有字段  备注：航班号
            // "book_user":""                //类型：String  可有字段  备注：订票员
        }
        this.$axios.post("/api/orders/list", data).then(res => {
            if (res.result === 10000) {
                this.setState({
                    dataList: res.data.data
                })
                console.log(this.state.dataList)
            }
        })
    }
    render() {
        return (
            <div className="inlandList">
                <HeaderTemplate />
                <div className="flight_item">
                    {/* 列表 */}
                    {this.state.dataList.map((item, index) => (
                        <div className="flight_div" key={item.id}>
                            <div className="flight_title">航班信息</div>
                            <div className="flight_detail">

                                <div className="flight_type">
                                    {item.segment_type === 1 ? '单程' : ""}
                                </div>

                                <div className="flight_route">
                                    <div className="flight_address">
                                        {`${item.ticket_segments[0].departure_CN.city_name} - 
                                            ${item.ticket_segments[0].arrive_CN.city_name}`}
                                    </div>
                                    <div className="flight_date">
                                        {item.ticket_segments[0].departure_time.substring(0,10)}
                                        {moment(item.ticket_segments[0].departure_time).format('ddd')}
                                    </div>
                                </div>

                                <div style={{ flex: 1 }}></div>
                                <div className="route_div">
                                    <div className="center_route">
                                        <div className="flight_time">
                                            {item.ticket_segments[0].departure_time.substring(11,16)}
                                        </div>
                                        <div className="flight_airport">
                                            {`${item.ticket_segments[0].departure_CN.city_name}${item.ticket_segments[0].departure_CN.air_port_name}机场${item.ticket_segments[0].departure_terminal}`}
                                        </div>
                                    </div>
                                    <div className="flight_icon"></div>
                                    <div className="center_route">
                                        <div className="flight_time">
                                            {item.ticket_segments[0].arrive_time.substring(11,16)}
                                        </div>
                                        <div className="flight_airport">
                                            {`${item.ticket_segments[0].arrive_CN.city_name}${item.ticket_segments[0].arrive_CN.air_port_name}机场${item.ticket_segments[0].arrive_terminal}`}
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
                                <div className="content_div">
                                    <div className="open_left">
                                        <div className="left_div">
                                            <div className="open_left_date">
                                                {item.ticket_segments[0].departure_time.substring(5,10)}
                                            </div>
                                            <div className="open_left_date">
                                                {item.ticket_segments[0].arrive_time.substring(5,10)}
                                            </div>
                                        </div>
                                        <div className="left_div">
                                            <div className="open_left_time">
                                                {item.ticket_segments[0].departure_time.substring(11,16)}
                                            </div>
                                            <div className="open_left_time">
                                                {item.ticket_segments[0].arrive_time.substring(11,16)}
                                            </div>
                                        </div>
                                        <div className="left_icon"></div>
                                        <div className="left_div">
                                            <div className="open_left_address">
                                                {`${item.ticket_segments[0].departure}${item.ticket_segments[0].departure_CN.city_name}
                                                        ${item.ticket_segments[0].departure_CN.air_port_name}机场${item.ticket_segments[0].departure_terminal}`}
                                            </div>
                                            <div className="open_left_address">
                                                {`${item.ticket_segments[0].arrive}${item.ticket_segments[0].arrive_CN.city_name}
                                                        ${item.ticket_segments[0].arrive_CN.air_port_name}机场${item.ticket_segments[0].arrive_terminal}`}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ flex: 1 }}></div>
                                    <div className="open_middle">
                                        <Image width={ 24 } src={this.$url + item.ticket_segments[0].image}/>
                                        <div className="middle_fly_type">{item.ticket_segments[0].airline_CN}</div>
                                        <div className="middle_fly_modal">
                                            {`${item.ticket_segments[0].flight_no}
                                                机型${item.ticket_segments[0].model}`}
                                        </div>
                                        <div className="middle_fly_cabin">经济舱</div>
                                        <div className="middle_fly_share">共享</div>
                                        <div className="middle_fly_meal"></div>
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
                </div>
                
            </div>
        )
    }
}
