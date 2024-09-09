<script setup lang="ts">
import {
  getMemberAddressByIdAPI,
  postMemberAddressAPI,
  putMemberAddressByIdAPI,
  postMemberWriteListAPI,
} from '@/services/address'
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'

// // 表单数据
// const form = ref({
//   receiver: '', // 收货人
//   contact: '', // 联系方式
//   fullLocation: '', // 省市区(前端展示)
//   provinceCode: '', // 省份编码(后端参数)
//   cityCode: '', // 城市编码(后端参数)
//   countyCode: '', // 区/县编码(后端参数)
//   address: '', // 详细地址
//   isDefault: 0, // 默认地址，1为是，0为否
// })

// 表单数据
const form = ref({
  realName: '', // 收货人
  identificationNumber: '', // 证件号码
  documentType: 1, // 证件类型固定为“身份证”
  phoneNumber: '',
  // contact: '', // 联系方式
  // fullLocation: '', // 省市区(前端展示)
  // provinceCode: '', // 省份编码(后端参数)
  // cityCode: '', // 城市编码(后端参数)
  // countyCode: '', // 区/县编码(后端参数)
  // address: '', // 详细地址
  // isDefault: 0, // 默认地址，1为是，0为否
})

// 获取页面参数
const query = defineProps<{
  id?: string
}>()

// 获取收货地址详情数据
const getMemberAddressByIdData = async () => {
  if (query.id) {
    // 发送请求
    const res = await getMemberAddressByIdAPI(query.id)
    // 把数据合并到表单中
    Object.assign(form.value, res.result)
  }
}

// 页面加载
onLoad(() => {
  getMemberAddressByIdData()
})

// 动态设置标题
// uni.setNavigationBarTitle({ title: query.id ? '修改地址' : '新建地址' })
uni.setNavigationBarTitle({ title: query.id ? '修改信息' : '新增持票人' })

// 收集所在地区
// const onRegionChange: UniHelper.RegionPickerOnChange = (ev) => {
//   // 省市区(前端展示)
//   form.value.fullLocation = ev.detail.value.join(' ')
//   // 省市区(后端参数)
//   const [provinceCode, cityCode, countyCode] = ev.detail.code!
//   // form.value.provinceCode = provinceCode
//   Object.assign(form.value, { provinceCode, cityCode, countyCode })
// }

// 收集是否默认收货地址
// const onSwitchChange: UniHelper.SwitchOnChange = (ev) => {
//   form.value.isDefault = ev.detail.value ? 1 : 0
// }

// 定义校验规则
// const rules: UniHelper.UniFormsRules = {
//   receiver: {
//     rules: [{ required: true, errorMessage: '请输入收货人姓名' }],
//   },
//   contact: {
//     rules: [
//       { required: true, errorMessage: '请输入联系方式' },
//       { pattern: /^1[3-9]\d{9}$/, errorMessage: '手机号格式不正确' },
//     ],
//   },
//   countyCode: {
//     rules: [{ required: true, errorMessage: '请选择所在地区' }],
//   },
//   address: {
//     rules: [{ required: true, errorMessage: '请选择详细地址' }],
//   },
// }

// 定义校验规则
const rules: UniHelper.UniFormsRules = {
  realName: {
    rules: [{ required: true, errorMessage: '请输入收货人姓名' }],
  },
  identificationNumber: {
    rules: [
      { required: true, errorMessage: '请输入证件号码' },
      { pattern: /(^\d{15}$)|(^\d{17}([0-9]|X|x)$)/, errorMessage: '身份证号格式不正确' },
    ],
  },
  phoneNumber: {
    rules: [
      { required: true, errorMessage: '请输入联系方式' },
      { pattern: /^1[3-9]\d{9}$/, errorMessage: '手机号格式不正确' },
    ],
  },
  // countyCode: {
  //   rules: [{ required: true, errorMessage: '请选择所在地区' }],
  // },
  // address: {
  //   rules: [{ required: true, errorMessage: '请选择详细地址' }],
  // },
}


// 表单组件实例
const formRef = ref<UniHelper.UniFormsInstance>()

// 提交表单
const onSubmit = async () => {
  try {
    // 表单校验
    await formRef.value?.validate?.()

    // 请求结果
    let res;

    // 校验通过后再发送请求
    if (query.id) {
      // 修改地址请求
      res = await putMemberAddressByIdAPI(query.id, form.value)
    } else {
      // 新建地址请求
      res = await postMemberWriteListAPI(form.value)
    }
    // console.log("res?.code", res?.code);
    // 判断响应体的状态码和消息
    // if (res?.code === '404' && res?.msg === 'Personal information authentication failed.') {
    if (res?.msg === 'Personal information authentication failed.') {
      // 认证失败提示
      uni.showToast({ icon: 'error', title: '用户信息认证失败' })
    } else {
      // 成功提示
      uni.showToast({ icon: 'success', title: query.id ? '修改成功' : '添加成功' })
    }
    // 返回上一页
    setTimeout(() => {
      uni.navigateBack()
    }, 800)

  } catch (error) {
    // 失败提示
    uni.showToast({ icon: 'error', title: '请填写完整信息' })
  }
}


// #ifdef H5 || APP-PLUS
const onCityChange: UniHelper.UniDataPickerOnChange = (ev) => {
  // 省市区
  const [province, city, county] = ev.detail.value
  // 收集后端所需的 code 数据
  Object.assign(form.value, {
    provinceCode: province.value,
    cityCode: city.value,
    countyCode: county.value,
  })
}
// #endif
</script>

<template>
  <view class="content">
    <uni-forms :rules="rules" :model="form" ref="formRef">
      <!-- 表单内容 -->
      <uni-forms-item name="realName" class="form-item">
        <text class="label">姓名</text>
        <input class="input" placeholder="请填写姓名" v-model="form.realName" />
      </uni-forms-item>
      <uni-forms-item name="idCardType" class="form-item">
        <text class="label">证件类型</text>
        <text class="input">{{ form.documentType === 1 ? '身份证' : '' }}</text>
      </uni-forms-item>
      <uni-forms-item name="identificationNumber" class="form-item">
        <text class="label">证件号</text>
        <input class="input" placeholder="请填写身份证号" :maxlength="18" v-model="form.identificationNumber" />
      </uni-forms-item>
      <uni-forms-item name="phoneNumber" class="form-item">
        <text class="label">联系方式</text>
        <input class="input" placeholder="请填写手机号" :maxlength="11" v-model="form.phoneNumber" />
      </uni-forms-item>
      <!-- <uni-forms-item name="countyCode" class="form-item">
        <text class="label">所在地区</text> -->
      <!-- #ifdef MP-WEIXIN -->
      <!-- <picker @change="onRegionChange" class="picker" mode="region" :value="form.fullLocation.split(' ')">
          <view v-if="form.fullLocation">{{ form.fullLocation }}</view>
          <view v-else class="placeholder">请选择省/市/区(县)</view>
        </picker> -->
      <!-- #endif -->

      <!-- #ifdef H5 || APP-PLUS -->
      <!-- <uni-data-picker placeholder="请选择地址" popup-title="请选择城市" collection="opendb-city-china"
          field="code as value, name as text" orderby="value asc" :step-searh="true" self-field="code"
          parent-field="parent_code" @change="onCityChange" :clear-icon="false" v-model="form.countyCode" /> -->
      <!-- #endif -->
      <!-- </uni-forms-item> -->
      <!-- <uni-forms-item name="address" class="form-item">
        <text class="label">详细地址</text>
        <input class="input" placeholder="街道、楼牌号等信息" v-model="form.address" />
      </uni-forms-item>
      <view class="form-item">
        <label class="label">设为默认地址</label>
        <switch @change="onSwitchChange" class="switch" color="#27ba9b" :checked="form.isDefault === 1" />
      </view> -->
    </uni-forms>
  </view>
  <!-- 提交按钮 -->
  <button @tap="onSubmit" class="button">保存并使用</button>
</template>

<style lang="scss">
// 深度选择器修改 uni-data-picker 组件样式
:deep(.selected-area) {
  flex: 0 1 auto;
  height: auto;
}

page {
  background-color: #f4f4f4;
}

.content {
  margin: 20rpx 20rpx 0;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;

  .form-item,
  .uni-forms-item {
    display: flex;
    align-items: center;
    min-height: 96rpx;
    padding: 25rpx 10rpx;
    background-color: #fff;
    font-size: 28rpx;
    border-bottom: 1rpx solid #ddd;
    position: relative;
    margin-bottom: 0;

    // 调整 uni-forms 样式
    .uni-forms-item__content {
      display: flex;
    }

    .uni-forms-item__error {
      margin-left: 200rpx;
    }

    &:last-child {
      border: none;
    }

    .label {
      width: 200rpx;
      color: #333;
    }

    .input {
      flex: 1;
      display: block;
      height: 46rpx;
    }

    .switch {
      position: absolute;
      right: -20rpx;
      transform: scale(0.8);
    }

    .picker {
      flex: 1;
    }

    .placeholder {
      color: #808080;
    }
  }
}

.button {
  height: 80rpx;
  margin: 30rpx 20rpx;
  color: #fff;
  border-radius: 80rpx;
  font-size: 30rpx;
  background-color: #27ba9b;
}
</style>
