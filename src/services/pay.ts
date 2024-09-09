import { http } from '@/utils/http'

/**
 * 获取微信支付参数
 * @param data orderId 订单id
 */
export const getPayWxPayMiniPayAPI = (data: { orderId: string }) => {
  return http<WechatMiniprogram.RequestPaymentOption>({
    method: 'GET',
    url: '/pay/wxPay/miniPay',
    data,
  })
}

/**
 * 模拟支付-内测版
 * @param data orderId 订单id
 */
export const getPayMockAPI = (data: { orderId: number }) => {
  return http({
    method: 'GET',
    url: '/pay/mock',
    data,
  })
}

/**
 * 获取微信支付参数  本项目使用的
 * @param data orderId 订单id
 */
// export const myGetPayWxPayMiniPayAPI = (data: { orderId: string }) => {
//   return http<WechatMiniprogram.MyRequestPaymentOption>({
//     method: 'POST',
//     url: '/applet/wxpay/pay',
//     data,
//   })
// }
export const myGetPayWxPayMiniPayAPI = (data: { orderId: any }) => {
  return http<WechatMiniprogram.MyRequestPaymentTwoOption>({
    method: 'POST',
    url: '/applet/wxpay/createOrder',
    data,
  })
}

/**
 * 查询订单状态  本项目使用的
 * @param data orderId 订单id
 */
// export const myGetPayWxCheckOrderAPI = (data: { orderId: string }) => {
//   return http<WechatMiniprogram.CheckOrderOption>({
//     method: 'GET',
//     // 使用模板字符串正确拼接 URL
//     url: `/applet/wxpay/query/${data.orderId}`,
//     data,
//   })
// }

export const myGetPayWxCheckOrderAPI = (data: { orderId: any }) => {
  return http<WechatMiniprogram.CheckOrderTwoOption>({
    method: 'GET',
    // 使用模板字符串正确拼接 URL
    url: `/applet/wxpay/queryByOutTradeNo/${data.orderId}`,
    data,
  })
}
