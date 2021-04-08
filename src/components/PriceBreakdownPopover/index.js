/*
 * @Description: 价格明细弹窗
 * @Author: wish.WuJunLong
 * @Date: 2021-04-06 16:20:49
 * @LastEditTime: 2021-04-06 16:34:04
 * @LastEditors: wish.WuJunLong
 */

import React, { Component } from "react";
import { Popover } from "antd";

import "./PriceBreakdownPopover.scss";

export default class index extends Component {
  render() {
    return (
      <Popover
        placement="bottomRight"
        overlayClassName="price_popover"
        content={() => (
          <div className="price_box">
            <div className="box_title">价格明细</div>
            <div className="price_content">
              <div className="price_item">
                <div className="detail_title">票面价</div>
                <div className="detail_amount">
                  &yen;{this.props.priceBreakdownPopoverData.ADT.price}
                </div>
              </div>
              <div className="price_item">
                <div className="detail_title">奖励金</div>
                <div className="detail_amount">
                  &yen;
                  {this.props.priceBreakdownPopoverData.ADT.rulePrice.reward}
                </div>
              </div>
              <div className="price_item">
                <div className="detail_title">服务费</div>
                <div className="detail_amount">
                  &yen;{this.props.priceBreakdownPopoverData.ADT.service}
                </div>
              </div>
              <div className="price_item">
                <div className="detail_title">结算价</div>
                <div className="detail_amount total_detail_amount">
                  &yen;
                  {Number(this.props.priceBreakdownPopoverData.ADT.price) -
                    Number(this.props.priceBreakdownPopoverData.ADT.rulePrice.reward)}
                </div>
              </div>
              <div className="price_item">
                <div className="detail_amount tax_detail_amount">
                  含税&yen;
                  {Number(this.props.priceBreakdownPopoverData.ADT.price) +
                    Number(this.props.priceBreakdownPopoverData.ADT.service) +
                    Number(this.props.priceBreakdownPopoverData.ADT.build) -
                    Number(this.props.priceBreakdownPopoverData.ADT.rulePrice.reward)}
                </div>
              </div>
            </div>
            <span>实际价格以下单支付价格为准</span>
          </div>
        )}
      >
        <div>
          &yen;
          <span>{this.props.priceBreakdownPopoverData.ADT.price}</span>
        </div>
      </Popover>
    );
  }
}
