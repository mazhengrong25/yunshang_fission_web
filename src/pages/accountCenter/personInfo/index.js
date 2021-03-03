/*
 * @Description: 个人中心---个人信息
 * @Author: mzr
 * @Date: 2021-03-02 17:40:39
 * @LastEditTime: 2021-03-02 18:26:36
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import { Button } from 'antd';

import './personInfo.scss'

export default class index extends Component {
    render() {
        return (
            <div className="personInfo">
                <div className="content_div">
                    <div className="div_title">个人信息</div>
                    <div className="item_content">
                        <div className="item_avatar"></div>
                        <div className="action_div">
                            <div className="action_title">分销国际测试</div>
                            <div className="action_time">登录时间：2020-11-05 15:00:23</div>
                            <div className="action_button">
                                <Button>修改密码</Button> 
                                <Button>修改钱包密码</Button>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="content_recharge">

                </div>
                <div className="content_account">
                    <div className="account_title">账号信息</div>
                </div>
            </div>
        )
    }
}
