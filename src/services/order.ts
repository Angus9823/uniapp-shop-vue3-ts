import type { OrderListResult } from '@/types/order'
import type {
  OrderCreateParams,
  OrderListParams,
  OrderLogisticResult,
  OrderPreResult,
  OrderResult,
  MyOrderCreateParams,
  MyOrderResult,
} from '@/types/order'
import { http } from '@/utils/http'
/**
 * 填写订单-获取预付订单
 */
export const getMemberOrderPreAPI = () => {
  return http<OrderPreResult>({
    method: 'GET',
    url: '/member/order/pre',
  })
}

/**
 * 填写订单-获取立即购买订单
 */
export const getMemberOrderPreNowAPI = (data: {
  skuId: string
  count: string
  addressId?: string
}) => {
  return http<OrderPreResult>({
    method: 'GET',
    url: '/member/order/pre/now',
    data,
  })
}

/**
 * 填写订单-再次购买
 * @param id 订单id
 */
export const getMemberOrderRepurchaseByIdAPI = (id: string) => {
  return http<OrderPreResult>({
    method: 'GET',
    url: `/member/order/repurchase/${id}`,
  })
}

/**
 * 提交订单
 * @param data 请求参数
 */
export const postMemberOrderAPI = (data: OrderCreateParams) => {
  return http<{ id: string }>({
    method: 'POST',
    url: '/member/order',
    data,
  })
}

export const postMyMemberOrderAPI = (data: MyOrderCreateParams) => {
  return http<{ id: string }>({
    method: 'POST',
    url: '/applet/order/generate',
    data,
  })
}

/**
 * 获取订单详情
 * @param id 订单id
 */
export const getMemberOrderByIdAPI = (id: string) => {
  return http<OrderResult>({
    method: 'GET',
    url: `/member/order/${id}`,
  })
}

export const MyGetMemberOrderByIdAPI = (id: string) => {
  return http<MyOrderResult>({
    method: 'GET',
    url: `/applet/order/getOrderInfoById/${id}`,
  })
}

/**
 * 模拟发货-内测版
 * @description 在DEV环境下使用，仅在订单状态为待发货时，可模拟发货，调用后订单状态修改为待收货，包含模拟物流。
 * @param id 订单id
 */
export const getMemberOrderConsignmentByIdAPI = (id: string) => {
  return http({
    method: 'GET',
    url: `/member/order/consignment/${id}`,
  })
}

/**
 * 确认收货
 * @description 仅在订单状态为待收货时，可确认收货。
 * @param id 订单id
 */
export const putMemberOrderReceiptByIdAPI = (id: string) => {
  return http<OrderResult>({
    method: 'PUT',
    url: `/member/order/${id}/receipt`,
  })
}

/**
 * 获取订单物流
 * @description 仅在订单状态为待收货，待评价，已完成时，可获取物流信息。
 * @param id 订单id
 */
export const getMemberOrderLogisticsByIdAPI = (id: string) => {
  return http<OrderLogisticResult>({
    method: 'GET',
    url: `/member/order/${id}/logistics`,
  })
}

/**
 * 删除订单
 * @description 仅在订单状态为待评价，已完成，已取消时，可删除订单。
 * @param data ids 订单集合
 */
export const deleteMemberOrderAPI = (data: { ids: number[] }) => {
  return http({
    method: 'DELETE',
    url: `/member/order`,
    data,
  })
}

export const myDeleteMemberOrderAPI = (id: number) => {
  return http({
    method: 'POST',
    url: `/applet/order/member/order/delete`,
    data: { id: id },
  })
}
/**
 *
 * @param id 修改持票人
 * @returns
 */
// 修改 myOrderEditAPI 函数，使其接收用户信息作为参数
export const myOrderEditAPI = (params: {
  orderId: number,
  orderWhiteListDetailsId: number,
  username: string,
  documentType: number,
  identificationNumber: string,
  phoneNumber: string
}) => {
  return http({
    method: 'POST',
    url: `/applet/order/member/order/ticketHolderChange`,
    data: params, // 传递完整的参数对象
  })
}


/**
 * 取消订单
 * @description 仅在订单状态为待付款时，可取消订单。
 * @param id 订单id
 * @param data cancelReason 取消理由
 */
export const getMemberOrderCancelByIdAPI = (id: string, data: { cancelReason: string }) => {
  return http<MyOrderResult>({
    method: 'PUT',
    url: `/member/order/${id}/cancel`,
    data,
  })
}
export const myGetMemberOrderCancelByIdAPI = (id: string) => {
  return http<MyOrderResult>({
    method: 'POST',
    url: `/applet/order/member/order/cancel`,
    data: {
      id: id,
    },
  })
}
/**
 * 获取订单列表
 * @param data orderState 订单状态
 */
export const getMemberOrderAPI = (data: OrderListParams) => {
  return http<OrderListResult>({
    method: 'GET',
    // url: `/member/order`,
    url: `/applet/order/member/order`,
    data,
  })
}
