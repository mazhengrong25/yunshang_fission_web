/*
 * @Description: 个人中心
 * @Author: mzr
 * @Date: 2021-03-02 15:27:47
 * @LastEditTime: 2021-03-02 17:44:50
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import { Menu } from 'antd';

import './accountCenter.scss'

// 个人信息
import PersonInfo from '../personInfo'

export default class index extends Component {
    constructor(props) {
        super(props);
        this.state = {
            itemKey:"", //menu.item key值
        }
    }

    // 侧边导航菜单 menu.item 获取key
    openMenuItem = (val) => {
        console.log(val)
        this.props.history.push(`/accountCenter?type=${val.key}`)
        this.setState({
            itemKey:val.key,
        })
    }

    render() {
        return (
            <div className="accountCenter">
                <div className="account_content_div">
                    <div className="account_filter_div">
                        <div className="account_nav_top">个人中心</div>
                        <div className="account_nav_bottom">
                            <Menu
                                className="account_menu"
                                mode="inline"
                                style={{width:184}}
                            >
                                <Menu.Item 
                                    key="perInfo" 
                                    icon={<div className="account_icon"></div>}
                                    onClick={this.openMenuItem.bind(this)}>个人信息</Menu.Item>
                                <Menu.Item 
                                    key="cerInfo" 
                                    icon={<div className="account_icon"></div>}
                                    onClick={this.openMenuItem.bind(this)}>证件信息</Menu.Item>
                                <Menu.Item 
                                    key="usedPer" 
                                    icon={<div className="account_icon"></div>}
                                    onClick={this.openMenuItem.bind(this)}>常用人员</Menu.Item>
                                <Menu.Item 
                                    key="usedAdd" 
                                    icon={<div className="account_icon"></div>}
                                    onClick={this.openMenuItem.bind(this)}>常用地址</Menu.Item>
                                <Menu.Item 
                                    key="wallAcc" 
                                    icon={<div className="account_icon"></div>}
                                    onClick={this.openMenuItem.bind(this)}>钱包流水</Menu.Item>
                            </Menu>
                        </div>
                    </div>

                    <div className="account_list_div">
                        {this.state.itemKey === 'perInfo' ? 
                            (<PersonInfo history={this.props.history}></PersonInfo>):""}
                    </div>

                </div>




            </div>

            
        )
    }
}
