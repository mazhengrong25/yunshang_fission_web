/*
 * @Description: 公告通知详情
 * @Author: mzr
 * @Date: 2021-03-18 14:29:07
 * @LastEditTime: 2021-03-22 16:28:39
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import { Breadcrumb, Divider  } from 'antd';

import './noticeDetail.scss'

export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {

            urlData:"",
            detailData:{}, //详情
        }
    }

    async componentDidMount() {

        await this.setState({
            urlData: React.$filterUrlParams(this.props.location.search),
        });
        await console.log(this.state.urlData)
        await this.getDetail();
    }

    // 获取详情
    getDetail() {
        this.$axios.get('/api/notice/'+this.state.urlData.id).then((res) => {

            console.log(res)
            if(res.errorcode === 10000) {
                this.setState({
                    detailData : res.data
                })
            }
        })
    }
    
    render() {
        return (
            <div className="noticeDetail">
                <Breadcrumb separator="<">
                    <Breadcrumb.Item ><a href="/announceNotice" >公告通知</a></Breadcrumb.Item>
                    <Breadcrumb.Item>{this.state.detailData.title}</Breadcrumb.Item>
                </Breadcrumb>
                <div className="detail_content">
                    <div className="detail_title">{this.state.detailData.title}</div>
                    <div className="title_under">
                        <div className="under_autor">{this.state.detailData.author}</div>
                        <Divider type="vertical" />
                        <p>发布时间：{this.state.detailData.created_at}</p>
                    </div>
                    <div className="content_div" dangerouslySetInnerHTML={{__html: this.state.detailData.content}}></div>
                </div>
            </div>
        )
    }
}
