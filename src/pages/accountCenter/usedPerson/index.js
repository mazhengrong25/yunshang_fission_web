/*
 * @Description: 个人中心---常用人员
 * @Author: mzr
 * @Date: 2021-03-11 11:45:49
 * @LastEditTime: 2021-03-12 10:38:17
 * @LastEditors: mzr
 */
import React, { Component } from 'react'

import { Input, Button, Table, Pagination, Tag, Modal, Select  } from 'antd';

import './usedPerson.scss'
import Column from 'antd/lib/table/Column';

const { Option } = Select;

export default class index extends Component {

    constructor(props) {
        super(props);
        this.state = {
            
            selectedRowKeys: [], 
            dataList: [], // 常用人员列表
            paginationData: {
                current_page: 1, //当前页数
                per_page: 10, //每页条数	
                total: 0
            },
            showModal: false, //新增弹出
            searchFrom: {
                passengerName:""
            }
        }
    }

    async componentDidMount() {
        
        await this.getDataList();

    }

    // 获取常用人员列表
    async getDataList() {
        
        let data = this.state.searchFrom
        data['page'] = this.state.paginationData.page
        data['limit'] = this.state.paginationData.per_page

        this.$axios.post("/api/passenger/index", data).then(res => {
            if(res.errorcode === 10000) {

                let newPage = this.state.paginationData
                newPage.total = res.data.to
                newPage.current_page = res.data.current_page

                this.setState({
                    dataList: res.data.data,
                    paginationData:newPage
                })
            }
        })
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

    // 每页显示条数
    changePageSize = async (current, size) => {
        console.log("current, size", current, size)
        let data = this.state.paginationData
        data['current_page'] = current;
        data['per_page'] = size;

        await this.setState({
            paginationData: data,
        })
    }

    // 表格选中项
    onSelectChange = selectedRowKeys => {
        
        this.setState({ selectedRowKeys });
    };

    //  新增弹窗
    addPerson = () => {
        this.setState({
            showModal : true
        })
    }

    // 搜索输入框
    InputItem(label, val) {
        let data = this.state.searchFrom;
        data[label] = val.target.value;
        this.setState({
            searchFrom: data,
        })
    }

    serachBtn() {
        this.getDataList();
    }

    render() {
        const { selectedRowKeys } = this.state;
        const rowSelection = {
            selectedRowKeys,
            onChange: this.onSelectChange,
        };
        return (
            <div className="usedPerson">
                <div className="usedPerson_content_div">
                    <div className="usedPerson_div_title">常用人员</div>
                    <div className="usedPerson_content">
                        <div className="content_nav">
                            <div className="content_item">
                                <div className="usedPerson_title">员工</div>
                                <div className="usedPerson_input">
                                    <Input 
                                        placeholder="姓名/手机号"
                                        allowClear
                                        value={this.state.searchFrom.passengerName}
                                        onChange={this.InputItem.bind(this, "passengerName")}
                                    />
                                </div>
                            </div>
                            <Button type="primary" onClick={() => this.serachBtn()}>搜索</Button>
                        </div>
                        <div className="content_list">
                            <Table
                                    rowKey="id"
                                    pagination={false}
                                    rowSelection={rowSelection}
                                    dataSource={this.state.dataList}
                            >
                                <Column title="姓名" dataIndex="name"></Column>
                                <Column title="手机号" dataIndex="phone"></Column>
                                <Column title="分组" dataIndex=""></Column>
                                <Column title="证件" dataIndex="cert_type"></Column>
                                <Column
                                    title="操作"
                                    render={() => (
                                        
                                        <div className="table_action">
                                            <Tag color="#5B7CF0">删除</Tag>
                                            <Tag color="#5B7CF0" onClick={() => this.addPerson()}>新增</Tag>
                                        </div>
                                    )  
                                    }
                                ></Column>
                            </Table>
                            {/* 分页 */}
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
                {/* 新增弹窗 */}
                <Modal 
                    title="新增人员"
                    width={800}
                    visible={this.state.showModal}
                    onCancel={() => this.setState({
                        showModal: false
                    })}
                    footer={[
                        <Button key="back" onClick={this.handleCancel}>取消</Button>,
                        <Button key="submit" type="primary" onClick={this.handleOk}>确定</Button>,
                    ]}
                >
                    <div className="add_modal">
                        <div className="modal_title">基本信息</div>
                        <div className="modal_div">
                            <div className="div_item">
                                <div className="item_title">姓名</div>
                                <div className="item_input">
                                    <Input style={{ width: 200 }} placeholder="姓名" allowClear/>
                                </div>
                            </div>
                            <div className="div_item">
                                <div className="item_title">分组</div>
                                <div className="item_input">
                                    <Select style={{ width: 200 }}
                                        placeholder="请选择"
                                    >
                                        <Option value="jack">Jack</Option>
                                        <Option value="lucy">Lucy</Option>
                                        <Option value="Yiminghe">yiminghe</Option>
                                    </Select>
                                </div>
                            </div>
                            <div className="div_item">
                                <div className="item_title">成本中心</div>
                                <div className="item_input">
                                    <Select style={{ width: 468 }}
                                        placeholder="请选择"
                                    >
                                        <Option value="jack">Jack</Option>
                                        <Option value="lucy">Lucy</Option>
                                        <Option value="Yiminghe">yiminghe</Option>
                                    </Select>
                                </div>
                            </div>
                            <div className="div_item">
                                <div className="item_title">手机号</div>
                                <div className="item_input">
                                    <Input style={{ width: 200 }} placeholder="姓名" allowClear/>
                                </div>
                            </div>
                            <div className="div_item">
                                <div className="item_title">邮箱</div>
                                <div className="item_input">
                                    <Select style={{ width: 200 }}
                                        placeholder="请选择"
                                    >
                                        <Option value="jack">Jack</Option>
                                        <Option value="lucy">Lucy</Option>
                                        <Option value="Yiminghe">yiminghe</Option>
                                    </Select>
                                </div>
                            </div>
                        </div>
                        <div className="modal_title">证件信息</div>
                        <div className="modal_div">
                            <div className="div_item">
                                <div className="item_title">证件</div>
                                <div className="item_input">
                                    <Select style={{ width: 200 }}
                                        placeholder="请选择"
                                    >
                                        <Option value={1}>身份证</Option>
                                        <Option value={2}>护照</Option>
                                        <Option value={3}>港澳通行证</Option>
                                        <Option value={4}>台胞证</Option>
                                        <Option value={5}>回乡证</Option>
                                        <Option value={6}>台湾通行证</Option>
                                        <Option value={7}>入台证</Option>
                                        <Option value={8}>国际海员证</Option>
                                        <Option value={9}>其它证件</Option>
                                    </Select>
                                </div>
                            </div>
                            <div className="div_item">
                                <div className="item_title">证件号</div>
                                <div className="item_input">
                                    <Input style={{ width: 200 }} placeholder="请输入" allowClear/>
                                </div>
                            </div>
                        </div>
                    </div>
                </Modal>
            </div>
        )
    }
}

