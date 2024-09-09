import type { AddressItem, AddressParams, AddWriteListParams, AddWriteListItem, DelWriteListParams } from '@/types/address'
import { http } from '@/utils/http'

/**
 * 添加收货地址
 * @param data 请求参数
 */
export const postMemberAddressAPI = (data: AddWriteListParams) => {
  return http({
    method: 'POST',
    url: '/member/address',
    data,
  })
}

/**
 * 添加白名单
 * @param data 请求参数
 */
export const postMemberWriteListAPI = (data: AddWriteListParams) => {
  return http({
    method: 'POST',
    url: '/applet/realInfo/add',
    data,
  })
}
/**
 * 获取白名单
 */
export const getMemberWriteListAPI = () => {
  return http<AddWriteListItem[]>({
    method: 'GET',
    url: '/applet/realInfo/getWhiteListUserRealInfoList',
  })
}

/**
 * 获取收货地址列表
 */
export const getMemberAddressAPI = () => {
  return http<AddressItem[]>({
    method: 'GET',
    url: '/member/address',
  })
}

/**
 * 获取收货地址详情
 * @param id 地址id(路径参数)
 */
export const getMemberAddressByIdAPI = (id: string) => {
  return http<AddressItem>({
    method: 'GET',
    url: `/member/address/${id}`,
  })
}

/**
 * 修改收货地址
 * @param id 地址id(路径参数)
 * @param data 表单数据(请求体参数)
 */
export const putMemberAddressByIdAPI = (id: string, data: AddWriteListParams) => {
  return http({
    method: 'PUT',
    url: `/member/address/${id}`,
    data,
  })
}

/**
 * 删除白名单 , data: DelWriteListParams
 * @param id 地址id(路径参数)
 */
export const deleteMemberAddressByIdAPI = (id: number) => {
  return http({
    method: 'POST',
    url: `/applet/realInfo/deleteWhiteListUserRealInfo`,
    data: { id: id },
  })
}
