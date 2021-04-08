/*
 * @Description: 退改签说明 popover弹窗
 * @Author: wish.WuJunLong
 * @Date: 2021-04-06 16:15:05
 * @LastEditTime: 2021-04-06 16:19:54
 * @LastEditors: wish.WuJunLong
 */

import React, { Component } from "react";

import { Popover } from "antd";

import "./RefundsAndChangesPopover.scss";

export default class index extends Component {
  render() {
    return (
      <>
        {this.props.refundsAndChangesData.refund ? (
          <Popover
            placement="bottomRight"
            color="#fff"
            overlayClassName="refund_popover"
            content={() => (
              <div className="refund_box">
                <div className="refund_title">退改签说明</div>
                <div className="refund_main">
                  <div className="refund_main_title">退票</div>
                  {this.props.refundsAndChangesData.refund.map((ritem, rindex) => (
                    <div className="refund_main_box" key={ritem.title + "_" + rindex}>
                      <p>{ritem.title}</p>
                      <p>
                        {ritem.value
                          ? Number(ritem.value)
                            ? Number(ritem.value) + "%"
                            : ritem.value
                          : ""}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="refund_main">
                  <div className="refund_main_title">改签</div>
                  {this.props.refundsAndChangesData.change &&
                    this.props.refundsAndChangesData.change.map((ritem, rindex) => (
                      <div className="refund_main_box" key={ritem.title + "_" + rindex}>
                        <p>{ritem.title}</p>
                        <p>
                          {ritem.value
                            ? Number(ritem.value)
                              ? Number(ritem.value) + "%"
                              : ritem.value
                            : ""}
                        </p>
                      </div>
                    ))}
                </div>
              </div>
            )}
          >
            <p>
              {Number(this.props.refundsAndChangesData.refund[0].value) &&
              Number(
                this.props.refundsAndChangesData.refund[
                  this.props.refundsAndChangesData.refund.length - 1
                ].value
              )
                ? `退票${this.props.refundsAndChangesData.refund[0].value}%-${
                    this.props.refundsAndChangesData.refund[
                      this.props.refundsAndChangesData.refund.length - 1
                    ].value
                  }%`
                : "根据航司规定"}
            </p>
          </Popover>
        ) : (
          <p className="not_rule">根据航司规定</p>
        )}
      </>
    );
  }
}
