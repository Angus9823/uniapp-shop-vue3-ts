<script setup lang="ts">
import { useGuessList } from '@/composables'
import { onLoad } from '@dcloudio/uni-app'
import { ref, onMounted } from 'vue'
import { myGetPayWxCheckOrderAPI } from '@/services/pay'


// 获取页面参数
const query = defineProps<{
  id: string
  orderNum: string
}>()

// 猜你喜欢
const { guessRef, onScrolltolower } = useGuessList()

// 定义一个状态变量来存储接口返回的 trade_state_desc 和 trade_state
const tradeStateDescText = ref('') // 存储接口返回的 trade_state_desc
const tradeStateText = ref('') // 存储接口返回的 trade_state

// const onOrderCheck = async () => {
//   // 发送请求
//   const res = await myGetPayWxCheckOrderAPI({ orderId: query.id })
//   const { trade_state, trade_state_desc } = res.result;
//   orderNum = resultOrderNum; // 使用返回的 orderNum 或 query.id
//   // 轻提示
//   uni.showToast({ icon: 'none', title: '订单取消成功' })
// }

// 页面加载时自动调用查询订单状态的接口
onMounted(async () => {
  await onOrderCheck()
})

// 查询订单状态的函数
const onOrderCheck = async () => {
  try {
    // 发送请求
    const res = await myGetPayWxCheckOrderAPI({ orderId: query.orderNum })

    const { tradeState, tradeStateDesc } = res.result as WechatMiniprogram.CheckOrderTwoOptionRES
    // console.log("res.result.result", res.result.result)
    // const { tradeState, tradeStateDesc } = res.result.result

    // 更新状态变量
    tradeStateText.value = tradeState
    tradeStateDescText.value = tradeStateDesc

    // 根据订单状态进行不同处理
    if (tradeState === 'SUCCESS') {
      uni.showToast({ icon: 'success', title: '支付成功' })
    } else {
      uni.showToast({ icon: 'none', title: tradeStateDesc })
    }
  } catch (error) {
    // 处理错误情况
    console.log("error订单查询失败", error)
    uni.showToast({ icon: 'none', title: '订单查询失败' })
  }
}

// 页面加载
onLoad(() => {
  // wx.showModal({
  //   title: '温馨提示',
  //   content: '此交易是模拟支付，您并未付款，不会导致实际购买商品或服务',
  //   confirmText: '知道了',
  //   showCancel: false,
  // })
})
</script>
<!--
<template>
  <scroll-view enable-back-to-top class="viewport" scroll-y @scrolltolower="onScrolltolower">
    订单状态
    <view class="overview">
      <view class="status icon-checked">支付成功</view>
      <view class="tips">提示: 本小程序仅为教学演示用途，并未实际支付或购买商品或服务</view>
      <view class="buttons">
        <navigator hover-class="none" class="button navigator" url="/pages/index/index" open-type="switchTab">
          返回首页
        </navigator>
        <navigator hover-class="none" class="button navigator" :url="`/pagesOrder/detail/detail?id=${query.id}`"
          open-type="redirect">
          查看订单
        </navigator>
      </view>
    </view>

    猜你喜欢
    <XtxGuess ref="guessRef" />
  </scroll-view>
</template> -->

<template>
  <scroll-view enable-back-to-top class="viewport" scroll-y @scrolltolower="onScrolltolower">
    <!-- 订单状态 -->
    <view class="overview">
      <view class="status" :class="{ 'icon-checked': tradeStateText === 'SUCCESS' }">
        {{ tradeStateDescText }}
      </view>
      <view class="buttons" v-if="tradeStateText === 'SUCCESS'">
        <navigator hover-class="none" class="button navigator" url="/pages/index/index" open-type="switchTab">
          返回首页
        </navigator>
        <navigator hover-class="none" class="button navigator" :url="`/pagesOrder/detail/detail?id=${query.id}`"
          open-type="redirect">
          查看订单
        </navigator>
      </view>
    </view>

    <!-- 猜你喜欢 -->
    <!-- <XtxGuess ref="guessRef" /> -->
  </scroll-view>
</template>

<style lang="scss">
page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.viewport {
  background-color: #f7f7f8;
}

.overview {
  line-height: 1;
  padding: 50rpx 0;
  color: #fff;
  background-color: #27ba9b;

  .tips {
    width: 70%;
    font-size: 24rpx;
    text-align: center;
    line-height: 1.5;
    margin: 60rpx auto;
  }

  .status {
    font-size: 36rpx;
    font-weight: 500;
    text-align: center;
  }

  .status::before {
    display: block;
    font-size: 110rpx;
    margin-bottom: 20rpx;
  }

  .buttons {
    height: 60rpx;
    line-height: 60rpx;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 60rpx;
  }

  .button {
    text-align: center;
    margin: 0 10rpx;
    font-size: 28rpx;
    color: #fff;

    &:first-child {
      width: 200rpx;
      border-radius: 64rpx;
      border: 1rpx solid #fff;
    }
  }
}
</style>
