/*
 * @Description: 国内机票-退票列表
 * @Author: mzr
 * @Date: 2021-04-08 13:47:33
 * @LastEditTime: 2021-04-08 14:13:16
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import './inlandRefund.scss'


export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
          isShow: false,
          dataList: [],
          searchFrom: {
            status: "-1", //状态
            passengerName: "", //乘机人
            order_no: "", //订单号
            created_at: this.$moment().subtract(3, "days").format("YYYY-MM-DD"),
          },
          paginationData: {
            current_page: 1, //当前页数
            per_page: 10, //每页条数
            total: 0,
          },
        };
    }

    async componentDidMount() {
        
        await this.getRefundList();
    }

    getRefundList() {
        this.$axios.post("/api/refund/list").then((res) => {
            console.log(res)
        })
    }

    render() {
        return (
            <div className="refundList">
                
            </div>
        )
    }
}
