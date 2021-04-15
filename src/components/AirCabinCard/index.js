/*
 * @Description: 航班舱位卡片
 * @Author: wish.WuJunLong
 * @Date: 2021-04-14 16:20:30
 * @LastEditTime: 2021-04-14 16:33:11
 * @LastEditors: wish.WuJunLong
 */

import React, { Component } from "react";

import {Button} from "antd"

import RefundsAndChangesPopover from "../RefundsAndChangesPopover"; // 退改签说明弹窗
import PriceBreakdownPopover from "../PriceBreakdownPopover"; // 价格明细弹窗

// 展开更多舱位按钮
import MoreCabinBtn from "../../static/icon_drop.png";

import "./AirCabinCard.scss"

export default class index extends Component {
  // 打开舱位
  openMoreCabin(val){
    this.props.openMoreCabin(val);
  }
  // 预定机票 - 验价
  jumpTicketDetail(val){
    this.props.jumpTicketDetail(val)
  }
  // 打开更多舱位
  openCabinIndexStatus(val){
    this.props.openCabinIndexStatus(val)
  }

  render() {
    return (
      <div className="cabin_content">
        {this.props.cabinList.map((oitem) =>
          oitem.data.map((pitem, pindex) =>
            (pindex < this.props.openCabinIndex &&
              this.props.segments_key + oitem.name === this.props.openCabinName) ||
            pindex === 0 ? (
              <div key={oitem.name + "__" + pindex}>
                <div className="cabin_list">
                  <div className="list_info">
                    <div
                      className="list_name"
                      style={{
                        cursor: pindex === 0 && oitem.data.length > 1 ? "pointer" : "",
                        fontWeight: pindex === 0 && oitem.data.length > 1 ? "bold" : "",
                      }}
                      onClick={() => this.openMoreCabin(this.props.segments_key + oitem.name)}
                    >
                      {oitem.name} {pitem.cabinInfo.cabinCode} {pitem.discount}
                      {pindex === 0 && oitem.data.length > 1 ? (
                        <div className="more_cabin_btn">
                          <img
                            style={{
                              transform: `rotate(${
                                this.props.segments_key + oitem.name ===
                                this.props.openCabinName
                                  ? 180
                                  : 0
                              }deg)`,
                            }}
                            src={MoreCabinBtn}
                            alt="展开更多舱位"
                          ></img>
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="list_message">
                      <RefundsAndChangesPopover
                        refundsAndChangesData={pitem.ruleInfos}
                      ></RefundsAndChangesPopover>
                      <span></span>
                      <p className="not_rule">{pitem.cabinInfo.baggage}</p>
                    </div>
                  </div>

                  <div className="list_option">
                    <div className="list_account">
                      <PriceBreakdownPopover
                        priceBreakdownPopoverData={pitem.cabinPrices}
                      ></PriceBreakdownPopover>

                      {pitem.cabinPrices.ADT.rulePrice.reward ? (
                        <div className="incentive_money">
                          奖励 &yen;
                          {pitem.cabinPrices.ADT.rulePrice.reward}
                        </div>
                      ) : (
                        ""
                      )}
                    </div>
                    <div className="option_box">
                      <Button
                        className="list_btn"
                        type="primary"
                        loading={this.props.scheduledStatus === pitem.data}
                        disabled={
                          this.props.scheduledStatus === pitem.data ||
                          this.props.scheduledAllBtn
                        }
                        onClick={() => this.jumpTicketDetail(pitem)}
                      >
                        {this.props.scheduledStatus === pitem.data ? "验价中" : "预定"}
                      </Button>
                      {pitem.cabinInfo.cabinNum < 9 ? (
                        <p>余 {pitem.cabinInfo.cabinNum} 张</p>
                      ) : (
                        ""
                      )}
                    </div>
                  </div>
                </div>

                {this.props.openCabinIndex < oitem.data.length &&
                this.props.openCabinIndex - 1 === pindex &&
                pindex !== 0 ? (
                  <div key={oitem.name + "_" + pindex} className="open_more_cabin_btn">
                    <span onClick={() => this.openCabinIndexStatus(oitem.data.length)}>
                      展开更多
                    </span>
                  </div>
                ) : (
                  ""
                )}
              </div>
            ) : (
              ""
            )
          )
        )}
      </div>
    );
  }
}
