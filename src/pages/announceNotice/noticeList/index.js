/*
 * @Description: 平台公告列表
 * @Author: mzr
 * @Date: 2021-03-18 14:28:37
 * @LastEditTime: 2021-04-08 15:08:35
 * @LastEditors: wish.WuJunLong
 */
import React, { Component } from "react";

import { Input, Button, Pagination } from "antd";

import "./noticeList.scss";

export default class index extends Component {
  constructor(props) {
    super(props);
    this.state = {
      noticeList: [], //公告列表

      paginationData: {
        current_page: 1, //当前页数
        per_page: 10, //每页条数
        total: 0,
      },

      searchTitle: "", //标题关键字搜索
    };
  }

  async componentDidMount() {
    await this.getDataList();
  }

  // 公告列表
  getDataList() {
    let data = {
      title: this.state.searchTitle,
      page: this.state.paginationData.page,
      limit: this.state.paginationData.per_page
    };
    this.$axios.get("/api/notice", { params: data }).then((res) => {
      if (res.errorcode === 10000) {
        let newPage = this.state.paginationData;
        newPage.total = res.data.total;
        newPage.current_page = res.data.current_page;

        res.data.data.forEach((item) => {
          item["widthNumber"] = Math.round(Math.random() * 50 + 50);
        });


        this.setState({
          noticeList: res.data.data,
          paginationData: newPage,
        });
      }
    });
  }

  // 筛选标题
  searchData() {
    this.getDataList();
  }

  // 输入框内容
  inputItem = (e) => {
    this.setState({
      searchTitle: e.target.value,
    });
  };

  // 分页
  changePagination = async (page, pageSize) => {
    let data = this.state.paginationData;
    data["page"] = page;
    data["limit"] = pageSize;
    this.setState({
      paginationData: data,
    });
    this.getDataList();
  };

  // 每页显示条数
  changePageSize = async (current, size) => {
    let data = this.state.paginationData;
    data["current_page"] = current;
    data["per_page"] = size;

    this.setState({
      paginationData: data,
    });
  };

  // 跳转到详情页面
  jumpDetail(val) {
    this.props.history.push(`/announceNoticeDetail?id=${val.id}`);
  }

  render() {
    return (
      <div className="noticeList">
        <div className="content_title">平台公告</div>
        <div className="content_action">
          <div className="action_item">
            <div className="action_title">标题</div>
            <Input
              placeholder="请输入公告标题"
              allowClear
              value={this.state.searchTitle}
              style={{ width: 200 }}
              onChange={this.inputItem}
            />
          </div>
          <Button type="primary" onClick={() => this.searchData()}>
            查询
          </Button>
        </div>
        {/* 列表 */}
        <div className="content_list">
          {this.state.noticeList.map((item, index) => {
            return (
              <div
                key={item.id}
                className="list_item"
                onClick={() => this.jumpDetail(item)}
              >
                <div className="item_top">
                  <div className="item_title">{item.title}</div>
                  <div className="item_time">{item.created_at}</div>
                </div>
                <div className="item_content" style={{ width: item.widthNumber * 10 }}>
                  {item.content.replace(/<[^>]+>/g, "").replace(/&nbsp;/gi, "")}
                </div>
              </div>
            );
          })}
        </div>
        {/* 分页 */}
        <div className="list_pagination">
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
    );
  }
}
