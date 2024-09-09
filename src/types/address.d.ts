/** 添加收货地址: 请求参数 */
export type AddressParams = {
  /** 收货人姓名 */
  receiver: string
  /** 联系方式 */
  contact: string
  /** 省份编码 */
  provinceCode: string
  /** 城市编码 */
  cityCode: string
  /** 区/县编码 */
  countyCode: string
  /** 详细地址 */
  address: string
  /** 默认地址，1为是，0为否 */
  isDefault: number
}

/** 收货地址项 */
export type AddressItem = AddressParams & {
  /** 收货地址 id */
  id: string
  /** 省市区 */
  fullLocation: string
}

/** 添加白名单: 请求参数 */
export type AddWriteListParams = {
  /** 姓名 */
  realName: string
  /** 证件号 */
  identificationNumber: string
  /** 证件类型 */
  documentType: number
  // 手机号码
  phoneNumber: string
}
//删除白名单
export type DelWriteListParams = {
  id: number
}


export type AddWriteListItem = AddWriteListParams & {
  /**  关联表id */
  id: number
  /** 当前token用户在白名单的ID */
  currentWhiteListId: number
  /**  当前用户在实名表的id */
  realInfoId: number
  /** 当前用户的白名单ID */
  availableWhiteListId: number
  /** 是否是token本人 */
  isSelf: boolean
}
