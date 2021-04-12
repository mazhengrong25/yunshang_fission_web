/*
 * @Description: 订单列表菜单栏
 * @Author: mzr
 * @Date: 2021-02-25 17:20:46
 * @LastEditTime: 2021-04-12 10:35:12
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import { Menu } from 'antd';

import './orderList.scss'

import InlandList from '../inlandList' // 国内列表
import InlandRefund from '../inlandRefund' // 国内退票

const { SubMenu } = Menu;

export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isShow: false,
            menuOpenKeys: [], // 展开的菜单数组
            menuItem: "", // 子级菜单key
        }
    }
    componentDidMount() {
        let newUrl = React.$filterUrlParams(this.props.location.search).type

        this.setState({
            menuOpenKeys: newUrl.indexOf('inland') !== -1 ? ['inland'] : ['inter'],
            menuItem: newUrl
        })

    }

    // 折叠栏切换状态
    onOpenChange = (key) => {

        // key 会是菜单的选中数组

        console.log(key)

        // 如果key 的长度小于等于1 等于只选择一个，直接赋值
        if (key.length <= 1) {
            this.setState({
                menuOpenKeys: key
            })
            return;
        }


        // 取key数组最后一位
        let newMenu = key[key.length - 1]
        // 如果key数组的最后一位等于key数组的第一位
        if (newMenu.includes(key[0])) {
            this.setState({
                menuOpenKeys: key
            })
        } else {
            // 如果不等于 直接赋值key数组的最后一位
            this.setState({
                menuOpenKeys: [newMenu]
            })
        }
    }

    // 折叠栏子级key值
    openMenuItem = (item) => {

        console.log(this.props.location)
        this.props.history.push(`/orderList?type=${item.key}`)
        this.setState({
            menuItem: item.key
        })
    }


    render() {
        return (
            <div className="orderList">
                <div className="content_div">
                    <div className="filter_div">
                        <div className="nav_top">我的订单</div>
                        <div className="nav_bottom">
                            <Menu
                                style={{ width: 184 }}
                                mode="inline"
                                onOpenChange={this.onOpenChange.bind(this)}
                                openKeys={this.state.menuOpenKeys}
                                selectedKeys={[this.state.menuItem]}

                            >
                                <SubMenu key="inland" title="国内机票"
                                    icon={<div className="menu_icon"></div>}>
                                    <Menu.Item key="inland_ticket" onClick={this.openMenuItem.bind(this)}>机票订单</Menu.Item>
                                    <Menu.Item key="inland_change" onClick={this.openMenuItem.bind(this)}>改签订单</Menu.Item>
                                    <Menu.Item key="inland_refund" onClick={this.openMenuItem.bind(this)}>退票订单</Menu.Item>
                                </SubMenu>
                                <SubMenu key="inter" title="国际机票"
                                    icon={<div className="menu_icon"></div>}>
                                    <Menu.Item key="inter_ticket" onClick={this.openMenuItem.bind(this)}>机票订单</Menu.Item>
                                    <Menu.Item key="inter_change" onClick={this.openMenuItem.bind(this)}>改签订单</Menu.Item>
                                    <Menu.Item key="inter_refund" onClick={this.openMenuItem.bind(this)}>退票订单</Menu.Item>
                                </SubMenu>
                            </Menu>
                        </div>
                    </div>

                    <div className="list_div">
                        {this.state.menuItem === "inland_ticket" ? (<InlandList history={this.props.history}></InlandList>) :
                            this.state.menuItem === "inland_refund" ? (<InlandRefund history={this.props.history}></InlandRefund>) : ""
                        }
                      
                    </div>



                </div>

            </div>
        )
    }
}
