/*
 * @Description: 退票详情
 * @Author: mzr
 * @Date: 2021-04-06 13:47:26
 * @LastEditTime: 2021-04-06 14:36:31
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import { Spin } from 'antd';

export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
        
            urlData : {}, 
            loadStatus : true, // 进入页面加载状态
        };
    }

    async componentDidMount() {
        await this.setState({
          urlData: React.$filterUrlParams(this.props.location.search),
        });
        await this.getRefundDetail();
    }

    getRefundDetail() {
        let data = {
            order_no: this.state.urlData.detail || "" 
        }
        this.$axios.post("/api/order/details",data).then((res) => {
            if(res.errorcode === 10000) {
                this.setState({
                    loadStatus:false
                })
            }else {
                this.setState({
                    loadStatus:false
                })
            }
        })
    }

    render() {
        return (
            <div className="refundDetail">
                 <Spin spinning={this.state.loadStatus}>

                 </Spin>
            </div>
        )
    }
}
