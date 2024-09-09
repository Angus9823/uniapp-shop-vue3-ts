<script setup lang="ts">
import { OrderState, MyOrderState } from '@/services/constants'
import { orderStateList, myOrderStateList } from '@/services/constants'
import { putMemberOrderReceiptByIdAPI } from '@/services/order'
import { deleteMemberOrderAPI, myDeleteMemberOrderAPI, myOrderEditAPI } from '@/services/order'
import { getMemberOrderAPI } from '@/services/order'
import { getPayMockAPI, getPayWxPayMiniPayAPI, myGetPayWxPayMiniPayAPI } from '@/services/pay'
import type { OrderItem, OrderAboutWhiteListItem } from '@/types/order'
import type { OrderListParams } from '@/types/order'
import { onMounted, ref, defineExpose } from 'vue'
import { onShow } from '@dcloudio/uni-app'

// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

// 定义 porps
const props = defineProps<{
  orderState: number
}>()

// 请求参数
const queryParams: Required<OrderListParams> = {
  page: 1,
  pageSize: 5,
  orderState: props.orderState,
}

// 获取订单列表
const orderList = ref<OrderAboutWhiteListItem[]>([])
// 是否加载中标记，用于防止滚动触底触发多次请求
const isLoading = ref(false)

// 是否分页结束
const isFinish = ref(false)
// 是否触发下拉刷新
const isTriggered = ref(false)

// 新增：定义更新 orderState 的方法
const updateOrderState = (newOrderState: number) => {
  queryParams.page = 1
  queryParams.orderState = newOrderState
  orderList.value = [] // 清空现有列表
  isFinish.value = false // 重置分页结束标记
  getMemberOrderData() // 重新获取数据
}

const getMemberOrderData = async () => {
  console.log('getMemberOrderData', queryParams)
  // 如果数据出于加载中，退出函数
  if (isLoading.value) return
  // 退出分页判断
  if (isFinish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据~' })
  }
  // 发送请求前，标记为加载中
  isLoading.value = true
  // 发送请求
  const res = await getMemberOrderAPI(queryParams)
  // 发送请求后，重置标记
  isLoading.value = false

  // 添加新数据，但要避免重复
  const newItems = res.result.items.filter(item =>
    !orderList.value.some(existingItem => existingItem.id === item.id)
  );

  // 数组追加
  // orderList.value.push(...res.result.items)
  orderList.value.push(...newItems)
  // 分页条件
  if (queryParams.page < res.result.pages) {
    // 页码累加
    queryParams.page++
  } else {
    // 分页已结束
    isFinish.value = true
  }
}

const getMemberOrderDataForToggleCursor = async () => {
  console.log('getMemberOrderData', queryParams)
  // 清空当前列表数据
  orderList.value = []
  // 发送请求
  const res = await getMemberOrderAPI(queryParams)
  // 将新的数据直接赋值给 orderList
  orderList.value = res.result.items
  // 不再使用分页逻辑，因为你只需要展示当前的数据，不需要分页
  isFinish.value = true  // 这里标记分页完成，实际分页逻辑被移除
}

onMounted(() => {
  getMemberOrderData()
})

// onShow(() => {
//   getMemberOrderData()
// })

// 订单支付
const onOrderPay = async (id: string) => {
  let orderNum; // 初始化 orderNum
  if (import.meta.env.DEV) {
    // 开发环境模拟支付
    // await getPayMockAPI({ orderId: query.id })

    // 正式环境支付：1.获取支付订单信息，2.调用微信支付API
    // const res = await getPayWxPayMiniPayAPI({ orderId: query.id })

    const idNumber = parseInt(id);

    const res = await myGetPayWxPayMiniPayAPI({ orderId: idNumber })
    const { timeStamp, nonceStr, paySign, outTradeNo, prepayId, signType } = res.result;
    // await wx.requestPayment(res.result);
    await wx.requestPayment({
      timeStamp: String(timeStamp), // 将 timeStamp 转换为字符串
      nonceStr,
      paySign,
      package: `prepay_id=${prepayId}`, // 添加 package 字段
      signType, // 根据你的签名类型设定
    });

    orderNum = outTradeNo // 使用返回的 orderNum 或 query.id

    console.log("orderNum", orderNum)

  } else {
    // #ifdef MP-WEIXIN

    // 正式环境支付：1.获取支付订单信息，2.调用微信支付API
    // const res = await getPayWxPayMiniPayAPI({ orderId: query.id })
    const idNumber = parseInt(id);
    const res = await myGetPayWxPayMiniPayAPI({ orderId: idNumber })
    const { timeStamp, nonceStr, paySign, outTradeNo, prepayId, signType } = res.result;
    console.log("prepayId111", prepayId)
    console.log("timeStamp", timeStamp)
    // await wx.requestPayment(res.result);
    await wx.requestPayment({
      timeStamp: String(timeStamp), // 将 timeStamp 转换为字符串
      nonceStr,
      paySign,
      package: `prepay_id=${prepayId}`, // 添加 package 字段
      signType, // 根据你的签名类型设定
    });
    // orderNum = resultOrderNum; // 使用返回的 orderNum 或 query.id
    orderNum = outTradeNo; // 使用返回的 orderNum 或 query.id

    console.log("orderNum", orderNum)


    // 注意：因小程序上线后被恶意投诉：理由为支付 0.01 元后不发货，现调整为模拟支付
    // await getPayMockAPI({ orderId: query.id })
    // #endif

    // #ifdef H5 || APP-PLUS
    // H5端 和 App 端未开通支付-模拟支付体验
    // await getPayMockAPI({ orderId: id })
    // #endif
  }
  // 关闭当前页，再跳转支付结果页
  // uni.redirectTo({ url: `/pagesOrder/payment/payment?id=${query.id}` })/
  uni.redirectTo({ url: `/pagesOrder/payment/payment?orderNum=${orderNum}&id=${id}` })
}

// 确认收货
// const onOrderConfirm = (id: string) => {
//   uni.showModal({
//     content: '为保障您的权益，请收到货并确认无误后，再确认收货',
//     confirmColor: '#27BA9B',
//     success: async (res) => {
//       if (res.confirm) {
//         await putMemberOrderReceiptByIdAPI(id)
//         uni.showToast({ icon: 'success', title: '确认收货成功' })
//         // 确认成功，更新为待评价
//         const order = orderList.value.find((v) => v.id === id)
//         order!.orderState = OrderState.DaiPingJia
//       }
//     },
//   })
// }

// 删除订单
const onOrderDelete = (id: number) => {
  uni.showModal({
    content: '你确定要删除该订单？',
    confirmColor: '#27BA9B',
    success: async (res) => {
      if (res.confirm) {
        await myDeleteMemberOrderAPI(id)
        // 删除成功，界面中删除订单
        const index = orderList.value.findIndex((v) => v.id === id)
        orderList.value.splice(index, 1)
      }
    },
  })
}

// 修改 订单 持票人
const onOrderEdit = (orderId: number, orderWhiteListDetailsId: number) => {
  uni.showModal({
    content: '你确定要修改该持票人？',
    confirmColor: '#27BA9B',
    success: async (res) => {
      if (res.confirm) {
        // 使用模板字符串，将orderId和orderWhiteListDetailsId传递到目标页面
        uni.navigateTo({
          url: `/pages/ticketFolder/components/changeOfTicketHolder-form/changeOfTicketHolder-form?orderId=${orderId}&orderWhiteListDetailsId=${orderWhiteListDetailsId}`
        })
      }
    },
  })
}


// 自定义下拉刷新被触发
const onRefresherrefresh = async () => {
  // 开始动画
  isTriggered.value = true
  // 重置数据
  queryParams.page = 1
  orderList.value = []
  isFinish.value = false
  // 加载数据
  await getMemberOrderData()
  // 关闭动画
  isTriggered.value = false
}

// 暴露方法给父组件调用
defineExpose({
  getMemberOrderData,
  onRefresherrefresh,
  updateOrderState,
  getMemberOrderDataForToggleCursor,
})
</script>

<template>
  <scroll-view enable-back-to-top scroll-y class="orders" refresher-enabled :refresher-triggered="isTriggered"
    @refresherrefresh="onRefresherrefresh" @scrolltolower="getMemberOrderData">
    <view class="card" v-for="order in orderList" :key="order.id">
      <!-- 订单信息 -->
      <view class="status">
        <text class="date">{{ order.createTime }}</text>
        <!-- 订单状态文字 -->
        <text>{{ myOrderStateList[order.orderStatus].text }}</text>
        <!-- 待评价/已完成/已取消 状态: 展示删除订单 -->
        <text v-if="order.orderStatus === MyOrderState.DaiFuKuan || order.orderStatus === MyOrderState.YiQuXiao"
          class="icon-delete" @tap="onOrderDelete(order.id)">
        </text>

      </view>
      <!-- 商品信息，点击商品跳转到订单详情，不是商品详情 -->
      <navigator v-for="item in order.ticketHolders" :key="item.whiteListId" class="goods"
        :url="`/pagesOrder/detail/detail?id=${order.id}`" hover-class="none">
        <!-- <view class="cover">
          <image class="image" mode="aspectFit" :src="item.image"></image>
        </view> -->
        <view class="meta">
          <view class="info">
            <view class="name ellipsis">{{ item.projectSession }}</view>
            <view class="type">持票人： {{ item.userName }} |
              <!-- 设置按钮放在右侧 -->
              <text v-if="order.orderStatus === MyOrderState.DaiChuPiao" class="icon-settings"
                @tap.stop="onOrderEdit(order.id, item.id)">
              </text>
            </view>
          </view>

        </view>
      </navigator>
      <!-- 支付信息 -->
      <view class="payment">
        <text class="quantity">共{{ order.orderTicketNum }}张票</text>
        <text>实付</text>
        <text class="amount"> <text class="symbol">¥</text>{{ order.orderPrice }}</text>
      </view>
      <!-- 订单操作按钮 -->
      <view class="action">
        <!-- 待付款状态：显示去支付按钮 -->
        <template v-if="order.orderStatus === MyOrderState.DaiFuKuan">
          <view class="button primary" @tap="onOrderPay(order.id.toString())">去支付</view>
        </template>
        <template v-else-if="order.orderStatus === MyOrderState.YiQuXiao">
          <!-- <navigator class="button secondary" :url="`/pagesOrder/create/create?orderId=${order.id}`" hover-class="none">
            已取消
          </navigator> -->
          <view class="button secondary" hover-class="none">
            已取消
          </view>
          <!-- 待收货状态: 展示确认收货 -->
          <!-- <view v-else="order.orderState === MyOrderState.DaiShouHuo" class="button primary"
            @tap="onOrderConfirm(order.id)">
            确认收货
          </view> -->
        </template>
        <!-- MyOrderState.YiWanCheng -->
        <template v-else-if="order.orderStatus === MyOrderState.DaiChuPiao">
          <view class="button secondary">待出票</view>
        </template>
        <template v-else>
          <view class="button secondary">已出票</view>
        </template>
      </view>
    </view>
    <!-- 底部提示文字 -->
    <view class="loading-text" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
      {{ isFinish ? '没有更多数据~' : '正在加载...' }}
    </view>
  </scroll-view>
</template>

<style lang="scss">
// 订单列表
.orders {
  // .card {
  //   min-height: 100rpx;
  //   padding: 20rpx;
  //   margin: 20rpx 20rpx 0;
  //   border-radius: 10rpx;
  //   background-color: #fff;

  //   &:last-child {
  //     padding-bottom: 40rpx;
  //   }
  // }

  .card {
    min-height: 100rpx;
    padding: 20rpx;
    margin: 20rpx 20rpx 0;
    border-radius: 18rpx; // 圆角更加圆润
    background-color: #fff;
    box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.15); // 添加明显的阴影效果
    transition: transform 0.3s ease, box-shadow 0.3s ease; // 添加平滑过渡效果
    transform: translateY(0); // 初始状态

    // 鼠标悬停时增加立体效果
    &:hover {
      transform: translateY(-5rpx); // 悬停时向上浮动
      box-shadow: 0 8rpx 16rpx rgba(0, 0, 0, 0.3); // 加强阴影效果
    }

    &:last-child {
      padding-bottom: 40rpx;
    }
  }

  .status {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 28rpx;
    color: #999;
    margin-bottom: 15rpx;
    // border-bottom: 1rpx solid #eee; // 添加底部边框，让分隔更明显
    // padding-bottom: 10rpx;

    .date {
      color: #666;
      flex: 1;
    }

    .primary {
      color: #ff9240;
    }

    .icon-delete {
      line-height: 1;
      margin-left: 10rpx;
      padding-left: 10rpx;
      border-left: 1rpx solid #e3e3e3;
    }

    .icon-check {
      line-height: 1;
      margin-left: 10rpx;
      padding-left: 10rpx;
      border-left: 1rpx solid #e3e3e3;
    }

  }

  .goods {
    display: flex;
    margin-bottom: 20rpx;

    .cover {
      width: 170rpx;
      height: 170rpx;
      margin-right: 20rpx;
      border-radius: 10rpx;
      overflow: hidden;
      position: relative;

      .image {
        width: 170rpx;
        height: 170rpx;
      }
    }

    .quantity {
      position: absolute;
      bottom: 0;
      right: 0;
      line-height: 1;
      padding: 6rpx 4rpx 6rpx 8rpx;
      font-size: 24rpx;
      color: #fff;
      border-radius: 10rpx 0 0 0;
      background-color: rgba(0, 0, 0, 0.6);
    }

    .meta {
      // flex: 1;
      display: flex;
      // flex-direction: column;
      // justify-content: center;
      justify-content: space-between;
      // align-items: center;
      /* 垂直居中 */
      /* 在两端对齐 */
      border-bottom: 1rpx solid #eee;
    }

    // .info {
    //   flex: 1;
    //   display: flex;
    //   flex-direction: column;
    //   /* 持票人信息纵向排列 */
    //   justify-content: center;
    // }
    .info {
      flex: 1;
      /* 占据左侧空间 */
    }

    .icon-settings {
      font-size: 28rpx;
      color: #888;
      margin-left: 50rpx;
      /* 添加一点左侧间距，避免按钮太靠近文本 */
      /* 调整图标与文本的垂直对齐 */
      // align-self: center;
      /* 使图标在父级视图中垂直居中 */
      // margin-top: 2rpx;
      /* 确保图标不会有不必要的上边距 */
      line-height: 1rpx;
      /* 保持行高为1，避免过高影响布局 */
    }

    .type {
      line-height: 1.8;
      padding: 0 15rpx;
      margin-top: 10rpx;
      font-size: 24rpx;
      align-self: flex-start;
      border-radius: 4rpx;
      color: #888;
      background-color: #f7f7f8;
    }

    .more {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22rpx;
      color: #333;
    }
  }

  .payment {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    line-height: 1;
    padding: 20rpx 0;
    text-align: right;
    color: #999;
    font-size: 28rpx;
    border-bottom: 1rpx solid #eee;
    border-top: 1rpx solid #eee; // 添加顶部边框

    .quantity {
      font-size: 24rpx;
      margin-right: 16rpx;
    }

    .amount {
      color: #444;
      margin-left: 6rpx;
    }

    .symbol {
      font-size: 20rpx;
    }
  }

  .action {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    padding-top: 20rpx;

    .button {
      width: 180rpx;
      height: 60rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      margin-left: 20rpx;
      border-radius: 60rpx;
      border: 1rpx solid #ccc;
      font-size: 26rpx;
      color: #444;
    }

    .secondary {
      color: #27ba9b;
      border-color: #27ba9b;
    }

    .primary {
      color: #fff;
      background-color: #27ba9b;
      border-color: #27ba9b;
    }
  }

  .loading-text {
    text-align: center;
    font-size: 28rpx;
    color: #666;
    padding: 20rpx 0;
  }
}
</style>
