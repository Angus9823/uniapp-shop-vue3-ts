import type { OrderState, MyOrderState } from '@/services/constants'
import type { AddressItem } from './address'
import type { PageParams } from '@/types/global'

/** 获取预付订单 返回信息 */
export type OrderPreResult = {
  /** 商品集合 [ 商品信息 ] */
  goods: OrderPreGoods[]
  /** 结算信息 */
  summary: {
    /** 商品总价 */
    totalPrice: number
    /** 邮费 */
    postFee: number
    /** 应付金额 */
    totalPayPrice: number
  }
  /** 用户地址列表 [ 地址信息 ] */
  userAddresses: AddressItem[]
}

/** 商品信息 */
export type OrderPreGoods = {
  /** 属性文字，例如“颜色:瓷白色 尺寸：8寸” */
  attrsText: string
  /** 数量 */
  count: number
  /** id */
  id: string
  /** 商品名称 */
  name: string
  /** 实付单价 */
  payPrice: string
  /** 图片 */
  picture: string
  /** 原单价 */
  price: string
  /** SKUID */
  skuId: string
  /** 实付价格小计 */
  totalPayPrice: string
  /** 小计总价 */
  totalPrice: string
}

/** 提交订单 请求参数 */
export type OrderCreateParams = {
  /** 所选地址Id */
  addressId: string
  /** 配送时间类型，1为不限，2为工作日，3为双休或假日 */
  deliveryTimeType: number
  /** 订单备注 */
  buyerMessage: string
  /** 商品集合[ 商品信息 ] */
  goods: {
    /** 数量 */
    count: number
    /** skuId */
    skuId: string
  }[]
  /** 支付渠道：支付渠道，1支付宝、2微信--支付方式为在线支付时，传值，为货到付款时，不传值 */
  payChannel: 1 | 2
  /** 支付方式，1为在线支付，2为货到付款 */
  payType: 1 | 2
}

/** 提交订单 请求参数 */
export type MyOrderCreateParams = {
  projectId: string
  priceInfos: {
    projectSessionPriceId: number
    whiteListId: number
  }[]
}

/** 提交订单 返回信息 */
export type OrderCreateResult = {
  /** 订单Id */
  id: string
}

/** 订单详情 返回信息 */
export type OrderResult = {
  /** 订单编号 */
  id: string
  /** 订单状态，1为待付款、2为待发货、3为待收货、4为待评价、5为已完成、6为已取消 */
  orderStatus: MyOrderState
  /** 倒计时--剩余的秒数 -1 表示已经超时，正数表示倒计时未结束 */
  countdown: number
  /** 商品集合 [ 商品信息 ] */
  items: OrderSkuItem[]
  /** 收货人 */
  receiverContact: string
  /** 收货人手机 */
  receiverMobile: string
  /** 收货人地址 */
  receiverAddress: string
  /** 下单时间 */
  createTime: string
  /** 商品总价 */
  totalMoney: number
  /** 运费 */
  postFee: number
  /** 应付金额 */
  payMoney: number
  orderPrice: number
}

/** 订单详情 返回信息 */
export type MyOrderResult = {
  /** 订单编号 */
  id: string
  /** 订单状态，1为待付款、2为已完成、3为已取消 */
  orderStatus: MyOrderState
  /** 项目ID */
  projectId: number
  /** 持票人 */
  ticketHolders: OrderTicketHoldersItem[]
  /** 购买人 */
  orderUserName: string
  /** 购买人手机号 */
  orderUserPhoneNumber: string
  /** 订单总价 */
  orderPrice: number
  /** 订单含有张数 */
  orderTicketNum: number
  /** 订单生成时间 */
  createTime: number
  /** 订单支付时间 */
  payTime: string
  /** 订单有效时间 */
  payLatestTime: string
  /** 订单倒计时 */
  countdown: number
  /** 购买凭证 */
  imgUrl: string
}

export type OrderTicketHoldersItem = {
  id: number
  /**  id */
  whiteListId: number
  /** 白名单名 */
  userName: string
  /** 证件类型 */
  documentType: number
  /** 证件号 */
  identificationNumber: string
  /** 场次 */
  projectSession: string
  /** 购买时单价 */
  projectSessionPrice: number
  /** 购买时票数 */
  imgUrl: string
}

/** 商品信息 */
export type OrderSkuItem = {
  /** sku id */
  id: string
  /** 商品 id */
  spuId: string
  /** 商品名称 */
  name: string
  /** 商品属性文字 */
  attrsText: string
  /** 数量 */
  quantity: number
  /** 购买时单价 */
  curPrice: number
  /** 图片地址 */
  image: string
}

/** order信息 */
export type OrderAboutWhiteListItem = {
  /**  id */
  id: number
  /** 创建时间 id */
  createTime: string
  /** 订单价格 */
  orderPrice: number
  /** 订单状态 */
  orderStatus: number
  /** 订单包含票数 */
  orderTicketNum: number
  /** 购买人 */
  orderUserName: string
  /** 购买人手机号 */
  orderUserPhoneNumber: string
  /** 订单支付有效时间 */
  payLatestTime: string
  /** 订单支付时间 */
  payTime: string
  /** 项目ID */
  projectId: number
  /** 项目名称 */
  projectName: string
  /** 持票人 */
  ticketHolders: OrderTicketHoldersItem[]
}

/** 物流信息 返回值类型 */
export type OrderLogisticResult = {
  /** 快递公司 */
  company: {
    /** 公司名称 */
    name: string
    /** 快递编号 */
    number: string
    /** 联系电话 */
    tel: string
  }
  /** 商品件数 */
  count: number
  /** 物流日志 */
  list: LogisticItem[]
}

/** 物流日志 */
export type LogisticItem = {
  /** 信息ID */
  id: string
  /** 信息文字 */
  text: string
  /** 时间 */
  time: string
}

/** 订单列表参数 */
export type OrderListParams = PageParams & { orderState: number }

/** 订单列表 */
export type OrderListResult = {
  /** 总记录数 */
  counts: number
  /** 数据集合    [ 订单信息 ] */
  items: OrderAboutWhiteListItem[]
  /** 当前页码 */
  page: number
  /** 总页数 */
  pages: number
  /** 页尺寸 */
  pageSize: number
}

/** 订单列表项 */
export type OrderItem = OrderResult & {
  /** 总件数 */
  totalNum: number
}
