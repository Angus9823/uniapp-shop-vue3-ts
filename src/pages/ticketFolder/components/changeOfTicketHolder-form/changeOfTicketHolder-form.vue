<script setup lang="ts">
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { myOrderEditAPI } from '@/services/order'

// 表单数据
const form = ref({
  realName: '', // 收货人
  identificationNumber: '', // 证件号码
  documentType: 1, // 证件类型固定为“身份证”
  phoneNumber: '',
})

// 从父组件或页面接收 orderId 和 orderWhiteListDetailsId 参数
const query = defineProps<{
  orderId: number,
  orderWhiteListDetailsId: number
}>()

// 页面加载时设置导航栏标题
onLoad(() => {
  uni.setNavigationBarTitle({
    title: '修改持票人信息'
  })
})

// 校验规则
const rules: UniHelper.UniFormsRules = {
  realName: {
    rules: [{ required: true, errorMessage: '请输入姓名' }],
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
  }
}

// 表单组件实例
const formRef = ref<UniHelper.UniFormsInstance>()

// 提交表单函数
const onSubmit = async () => {
  try {
    // 表单校验
    await formRef.value?.validate?.()

    // 如果校验通过，则发送请求修改持票人信息
    const params = {
      orderId: query.orderId, // 订单ID
      orderWhiteListDetailsId: query.orderWhiteListDetailsId, // 白名单详情ID
      username: form.value.realName, // 持票人姓名
      documentType: form.value.documentType, // 证件类型
      identificationNumber: form.value.identificationNumber, // 证件号码
      phoneNumber: form.value.phoneNumber, // 手机号码
    }

    const res = await myOrderEditAPI(params)

    // 判断响应结果
    if (res?.msg === 'Personal information authentication failed.') {
      // 如果认证失败，弹出提示
      uni.showToast({ icon: 'error', title: '用户信息认证失败' })
    } else if (res?.msg === 'The user has ticket purchase information.') {
      uni.showToast({ icon: 'error', title: '用户已有购票信息' })
    } else {
      // 成功提示并返回上一页
      uni.showToast({ icon: 'success', title: '修改成功' })
      setTimeout(() => {
        uni.navigateBack()
      }, 800)
    }
  } catch (error) {
    // 如果有错误，显示错误提示
    uni.showToast({ icon: 'error', title: '请填写完整信息' })
  }
}

// 修改订单持票人函数，传递 orderId 和 orderWhiteListDetailsId 并导航到修改页面
// const onOrderEdit = (orderId: number, orderWhiteListDetailsId: number) => {
//   uni.showModal({
//     content: '你确定要修改该订单？',
//     confirmColor: '#27BA9B',
//     success: async (res) => {
//       if (res.confirm) {
//         // 确认后跳转到修改持票人信息的页面，并携带参数
//         uni.navigateTo({
//           url: `/pages/ticketFolder/components/changeOfTicketHolder-form/changeOfTicketHolder-form?orderId=${orderId}&orderWhiteListDetailsId=${orderWhiteListDetailsId}`
//         })
//       }
//     },
//   })
// }
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
    </uni-forms>
  </view>
  <!-- 提交按钮 -->
  <button @tap="onSubmit" class="button">保存并修改</button>
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
