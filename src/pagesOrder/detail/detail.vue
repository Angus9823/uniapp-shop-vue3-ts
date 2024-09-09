<script setup lang="ts">
import { useGuessList } from '@/composables'
import { OrderState, MyOrderState, orderStateList, myOrderStateList } from '@/services/constants'
import {
  deleteMemberOrderAPI,
  myDeleteMemberOrderAPI,
  getMemberOrderByIdAPI,
  getMemberOrderCancelByIdAPI,
  myGetMemberOrderCancelByIdAPI,
  getMemberOrderLogisticsByIdAPI,
  getMemberOrderConsignmentByIdAPI,
  putMemberOrderReceiptByIdAPI,
  MyGetMemberOrderByIdAPI,
} from '@/services/order'
import type { LogisticItem, OrderResult, MyOrderResult } from '@/types/order'
import { onLoad, onReady } from '@dcloudio/uni-app'
import { ref } from 'vue'
import PageSkeleton from './components/PageSkeleton.vue'
import { getPayMockAPI, getPayWxPayMiniPayAPI, myGetPayWxPayMiniPayAPI } from '@/services/pay'

// 获取屏幕边界到安全区域距离
const { model, safeAreaInsets } = uni.getSystemInfoSync()

let paddingTop: number;

paddingTop = safeAreaInsets!.top < 10 ? 48 : safeAreaInsets!.top
// paddingTop = 55
console.log("Angus` safeAreaInsets det", safeAreaInsets)
// console.log("safeAreaInsets.top", safeAreaInsets.top)
console.log("Angus` paddingTop det", paddingTop)

// 猜你喜欢
const { guessRef, onScrolltolower } = useGuessList()
// 弹出层组件
const popup = ref<UniHelper.UniPopupInstance>()
// 取消原因列表
const reasonList = ref([
  '商品无货',
  '不想要了',
  '商品信息填错了',
  '地址信息填写错误',
  '商品降价',
  '其它',
])
// 订单取消原因
const reason = ref('')
// 复制内容
const onCopy = (id: string) => {
  // 设置系统剪贴板的内容
  uni.setClipboardData({ data: id })
}
// 获取页面参数
// const query = defineProps<{
//   id: string
// }>()

const query = defineProps<{
  id: string
}>()

// 获取页面栈
const pages = getCurrentPages()

// 基于小程序的 Page 类型扩展 uni-app 的 Page
type PageInstance = Page.PageInstance & WechatMiniprogram.Page.InstanceMethods<any>

// #ifdef MP-WEIXIN
// 获取当前页面实例，数组最后一项
const pageInstance = pages.at(-1) as PageInstance

// 页面渲染完毕，绑定动画效果
onReady(() => {
  // 动画效果,导航栏背景色
  pageInstance.animate(
    '.navbar',
    [{ backgroundColor: 'transparent' }, { backgroundColor: '#f8f8f8' }],
    1000,
    {
      scrollSource: '#scroller',
      timeRange: 1000,
      startScrollOffset: 0,
      endScrollOffset: 50,
    },
  )
  // 动画效果,导航栏标题
  pageInstance.animate('.navbar .title', [{ color: 'transparent' }, { color: '#000' }], 1000, {
    scrollSource: '#scroller',
    timeRange: 1000,
    startScrollOffset: 0,
    endScrollOffset: 50,
  })
  // 动画效果,导航栏返回按钮
  pageInstance.animate('.navbar .back', [{ color: '#fff' }, { color: '#000' }], 1000, {
    scrollSource: '#scroller',
    timeRange: 1000,
    startScrollOffset: 0,
    endScrollOffset: 50,
  })
})
// #endif

// 获取订单详情
const order = ref<MyOrderResult>()
const getMemberOrderByIdData = async () => {
  const res = await MyGetMemberOrderByIdAPI(query.id)
  order.value = res.result
  console.log("Order data:", order.value, order.value.imgUrl); // 打印订单数据
  // if (
  //   [OrderState.DaiShouHuo, OrderState.DaiPingJia, OrderState.YiWanCheng].includes(
  //     order.value.orderState,
  //   )
  // ) {
  //   getMemberOrderLogisticsByIdData()
  // }
}

// 获取物流信息
const logisticList = ref<LogisticItem[]>([])
const getMemberOrderLogisticsByIdData = async () => {
  const res = await getMemberOrderLogisticsByIdAPI(query.id)
  logisticList.value = res.result.list
}

onLoad(() => {
  getMemberOrderByIdData()
})

// 倒计时结束事件
const onTimeup = () => {
  // 修改订单状态为已取消
  order.value!.orderStatus = MyOrderState.YiQuXiao
  // 取消订单，返还库存
  // onOrderCancel()
  // // 重新获取订单详情
  // getMemberOrderByIdData()

}
//定义一个wxOpenId
// const wxOpenId = ref('')
// wx.login({
//   success(res) {
//     if (res.code) {
//       wxOpenId.value = res.code
//     }
//   },
// })

// 订单支付
const onOrderPay = async () => {
  let orderNum; // 初始化 orderNum
  if (import.meta.env.DEV) {
    // 开发环境模拟支付
    // await getPayMockAPI({ orderId: query.id })

    // 正式环境支付：1.获取支付订单信息，2.调用微信支付API
    // const res = await getPayWxPayMiniPayAPI({ orderId: query.id })
    const idNumber = parseInt(query.id)
    const res = await myGetPayWxPayMiniPayAPI({ orderId: idNumber })
    console.log("res", res.result)
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
    const idNumber = parseInt(query.id)
    const res = await myGetPayWxPayMiniPayAPI({ orderId: idNumber })
    console.log("res", res.result)
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
  uni.redirectTo({ url: `/pagesOrder/payment/payment?orderNum=${orderNum}&id=${query.id}` })
}

// 是否为开发环境
const isDev = import.meta.env.DEV
// 模拟发货
// const onOrderSend = async () => {
//   if (isDev) {
//     await getMemberOrderConsignmentByIdAPI(query.id)
//     uni.showToast({ icon: 'success', title: '模拟发货完成' })
//     // 主动更新订单状态
//     // order.value!.orderState = OrderState.DaiShouHuo
//   }
// }
// 确认收货
// const onOrderConfirm = () => {
//   // 二次确认弹窗
//   uni.showModal({
//     content: '为保障您的权益，请收到货并确认无误后，再确认收货',
//     confirmColor: '#27BA9B',
//     success: async (success) => {
//       if (success.confirm) {
//         const res = await putMemberOrderReceiptByIdAPI(query.id)
//         // 更新订单状态
//         order.value = res.result
//       }
//     },
//   })
// }
// 删除订单
const onOrderDelete = () => {
  // 二次确认
  uni.showModal({
    content: '是否删除订单',
    confirmColor: '#27BA9B',
    success: async (success) => {
      if (success.confirm) {
        await myDeleteMemberOrderAPI(query.id)
        // uni.redirectTo({ url: '/pagesOrder/list/list' })
        uni.redirectTo({ url: '/pages/ticketFolder/list' })
      }
    },
  })
}

// 取消订单
const onOrderCancel = async () => {
  // 发送请求
  const res = await myGetMemberOrderCancelByIdAPI(query.id)
  // 更新订单信息
  order.value = res.result
  // 关闭弹窗
  popup.value?.close!()
  // 轻提示
  uni.showToast({ icon: 'none', title: '订单取消成功' })
}
// 处理点击图片放大显示
const onImageTap = (imgUrl: string) => {
  uni.previewImage({
    urls: [imgUrl], // 预览图片的数组
    current: imgUrl, // 当前显示图片的url
    success: () => {
      console.log('预览图片成功')
    },
    fail: () => {
      console.log('预览图片失败')
    }
  })
}

// 保存图片到本地
const saveImage = (imgUrl: string) => {
  uni.downloadFile({
    url: imgUrl,
    success: (res) => {
      if (res.statusCode === 200) {
        uni.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: () => {
            uni.showToast({ title: '保存成功', icon: 'success' })
          },
          fail: () => {
            uni.showToast({ title: '保存失败', icon: 'none' })
          }
        })
      }
    },
    fail: () => {
      uni.showToast({ title: '下载图片失败', icon: 'none' })
    }
  })
}
</script>

<template>
  <!-- 自定义导航栏: 默认透明不可见, scroll-view 滚动到 50 时展示 -->
  <!-- <view class="navbar" :style="{ paddingTop: safeAreaInsets?.top + 'px' }"> -->
  <view class="navbar" :style="{ paddingTop: paddingTop + 'px' }">
    <view class="wrap">
      <navigator v-if="pages.length > 1" open-type="navigateBack" class="back icon-left"></navigator>
      <navigator v-else url="/pages/index/index" open-type="switchTab" class="back icon-home">
      </navigator>
      <view class="title">订单详情</view>
    </view>
  </view>
  <scroll-view enable-back-to-top scroll-y class="viewport" id="scroller" @scrolltolower="onScrolltolower">
    <template v-if="order">
      <!-- 订单状态 -->
      <!-- <view class="overview" :style="{ paddingTop: safeAreaInsets!.top + 20 + 'px' }"> -->
      <view class="overview" :style="{ paddingTop: paddingTop + 'px' }">
        <!-- 待付款状态:展示倒计时 -->
        <template v-if="order.orderStatus === MyOrderState.DaiFuKuan">
          <view class="status icon-clock">等待付款</view>
          <view class="tips">
            <text class="money">应付金额: ¥ {{ order.orderPrice }}</text>
            <text class="time">支付剩余</text>
            <!-- <uni-countdown :second="order.countdown" color="#fff" splitor-color="#fff" :show-day="false" -->
            <uni-countdown :second="order.countdown" color="#fff" splitor-color="#fff" :show-day="false"
              :show-colon="false" @timeup="onTimeup" />
          </view>
          <view class="button" @tap="onOrderPay">去支付</view>
        </template>
        <!-- 其他订单状态:展示再次购买按钮 -->
        <template v-else-if="order.orderStatus === MyOrderState.YiQuXiao">
          <!-- 订单状态文字 -->
          <view class="status"> {{ myOrderStateList[order.orderStatus].text }} </view>
          <view class="button-group">
            <!-- <navigator class="button" :url="`/pagesOrder/create/create?orderId=${query.id}`" hover-class="none">
              再次购买
            </navigator> -->
            <!-- <view class="button" hover-class="none"> 交易成功 </view> -->
            <!-- 待发货状态：模拟发货,开发期间使用,用于修改订单状态为已发货 -->
            <!-- <view v-if="order.orderStatus == MyOrderState.YiQuXiao" class="button">
              已取消
            </view>
            <view v-else-if="order.orderStatus == MyOrderState.DaiChuPiao" class="button">
              待出票
            </view>
            <view v-else-if="order.orderStatus == MyOrderState.YiChuPiao" class="button">
              已出票
            </view> -->

            <!-- <view v-if="isDev && order.orderState == OrderState.DaiFaHuo" @tap="onOrderSend" class="button">
              模拟发货
            </view> -->
            <!-- 待收货状态: 展示确认收货按钮 -->
            <!-- <view v-if="order.orderState === OrderState.DaiShouHuo" @tap="onOrderConfirm" class="button">
              确认收货
            </view> -->
          </view>
        </template>
        <template v-else-if="order.orderStatus === MyOrderState.DaiChuPiao">
          <!-- 订单状态文字 -->
          <view class="status"> {{ myOrderStateList[order.orderStatus].text }} </view>
        </template>

        <template v-else-if="order.orderStatus === MyOrderState.YiChuPiao">
          <!-- 订单状态文字 -->
          <view class="status"> {{ myOrderStateList[order.orderStatus].text }} </view>
        </template>
      </view>
      <!-- 配送状态 -->
      <!-- <view class="shipment"> -->
      <!-- 订单物流信息 -->
      <!-- <view v-for="item in logisticList" :key="item.id" class="item">
          <view class="message">
            {{ item.text }}
          </view>
          <view class="date"> {{ item.time }} </view>
        </view> -->
      <!-- 用户收货地址 -->
      <!-- <view class="locate">
          <view class="user"> {{ order.receiverContact }} {{ order.receiverMobile }} </view>
          <view class="address"> {{ order.receiverAddress }} </view>
        </view> -->
      <!-- </view> -->

      <!-- 商品信息 :url="`/pages/goods/goods?id=${item.spuId}`"-->
      <view class="goods">
        <view class="item">
          <navigator class="navigator" v-for="item in order.ticketHolders" :key="item.whiteListId" hover-class="none">
            <!-- <image class="cover" :src="item.image"></image> -->
            <view class="meta">
              <view class="name ellipsis">{{ item.projectSession }}</view>
              <view class="type">持票人： {{ item.userName }}</view>
              <view class="price">
                <view class="actual">
                  <text class="symbol">¥</text>
                  <text>{{ item.projectSessionPrice }}</text>
                </view>
              </view>
              <!-- <view class="quantity">x{{ item.quantity }}</view> -->
              <view class="quantity">x 1</view>
              <!-- <view class="quantity">共 {{ order.orderTicketNum }} 张票</view> -->

              <!-- 新增的购票凭证部分 -->
              <view v-if="order.orderStatus === MyOrderState.YiChuPiao" class="voucher">
                <view class="title">购票凭证</view>
                <image class="picture" mode="aspectFill" :src="item.imgUrl" @tap="onImageTap(item.imgUrl)"></image>
              </view>
            </view>

          </navigator>
          <!-- 待评价状态:展示按钮 -->
          <!-- <view class="action" v-if="order.orderStatus === OrderState.DaiPingJia">
            <view class="button primary">申请售后</view>
            <navigator url="" class="button"> 去评价 </navigator>
          </view> -->
        </view>
        <!-- 合计 -->
        <view class="total">
          <!-- <view class="row">
            <view class="text">商品总价: </view>
            <view class="symbol">{{ order.totalMoney }}</view>
          </view> -->
          <!-- <view class="row">
            <view class="text">运费: </view>
            <view class="symbol">{{ order.postFee }}</view>
          </view> -->
          <view class="row">
            <view class="text">应付金额: </view>
            <view class="symbol primary">{{ order.orderPrice }}</view>
          </view>
        </view>

        <!-- 新增的购票凭证部分 -->
        <!-- <view v-if="order.orderStatus === MyOrderState.YiChuPiao" class="voucher">
          <view class="title">购票凭证</view>
          <image class="picture" mode="aspectFill" :src="order.imgUrl" @tap="onImageTap(order.imgUrl)"></image>
        </view> -->
      </view>

      <!-- 订单信息 -->
      <view class="detail">
        <view class="title">订单信息</view>
        <view class="row">
          <view class="item">
            订单编号: {{ query.id }} <text class="copy" @tap="onCopy(query.id)">复制</text>
          </view>
          <view class="item">下单时间: {{ order.createTime }}</view>
          <view v-if="order.orderStatus === MyOrderState.YiChuPiao || order.orderStatus === MyOrderState.DaiChuPiao"
            class="item">付款时间: {{ order.payTime }}</view>
        </view>
      </view>
      <!-- 温馨提示 -->
      <view v-if="order.orderStatus === MyOrderState.YiChuPiao" class="proof">
        <view class="notice">温馨提示：请您按照购票凭证信息提示实名观演。</view>
      </view>

      <!-- 猜你喜欢 -->
      <!-- <XtxGuess ref="guessRef" /> -->

      <!-- 底部操作栏 -->
      <view class="toolbar-height" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }"></view>
      <view class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
        <!-- 待付款状态:展示支付按钮 -->
        <template v-if="order.orderStatus === MyOrderState.DaiFuKuan">
          <view class="button primary" @tap="onOrderPay"> 去支付 </view>
          <view class="button" @tap="popup?.open?.()"> 取消订单 </view>
        </template>
        <!-- 其他订单状态:按需展示按钮 -->
        <template v-else-if="order.orderStatus === MyOrderState.YiChuPiao">
          <!-- <navigator class="button secondary" :url="`/pagesOrder/create/create?orderId=${query.id}`" hover-class="none">
            再次购买
          </navigator> -->
          <view class="button secondary" hover-class="none"> 交易成功 </view>
          <!-- 待收货状态: 展示确认收货 -->
          <!-- <view class="button primary" v-if="order.orderState === OrderState.DaiShouHuo" @tap="onOrderConfirm">
            确认收货
          </view> -->
          <!-- 待评价状态: 展示去评价 -->
          <!-- <view class="button" v-if="order.orderState === OrderState.DaiPingJia"> 去评价 </view> -->
          <!-- 待评价/已完成/已取消 状态: 展示删除订单 -->
          <!-- <view class="button delete" v-if="order.orderState >= OrderState.DaiPingJia" @tap="onOrderDelete">
            删除订单
          </view> -->
        </template>
        <!-- <template>
          <view class="button secondary" hover-class="none"> 已取消 </view>
        </template> -->
      </view>
    </template>
    <template v-else>
      <!-- 骨架屏组件 -->
      <PageSkeleton />
    </template>
  </scroll-view>
  <!-- 取消订单弹窗 -->
  <uni-popup ref="popup" type="bottom" background-color="#fff">
    <view class="popup-root">
      <view class="title">订单取消</view>
      <!-- <view class="description">
        <view class="tips">请选择取消订单的原因：</view>
        <view class="cell" v-for="item in reasonList" :key="item" @tap="reason = item">
          <text class="text">{{ item }}</text>
          <text class="icon" :class="{ checked: item === reason }"></text>
        </view>
      </view> -->
      <view class="footer">
        <view class="button" @tap="popup?.close?.()">取消</view>
        <view class="button primary" @tap="onOrderCancel">确认</view>
      </view>
    </view>
  </uni-popup>
</template>

<style lang="scss">
page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.navbar {
  width: 750rpx;
  color: #000;
  position: fixed;
  top: 0;
  left: 0;
  z-index: 9;
  /* background-color: #f8f8f8; */
  background-color: transparent;

  .wrap {
    position: relative;

    .title {
      height: 44px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 32rpx;
      /* color: #000; */
      color: transparent;
    }

    .back {
      position: absolute;
      left: 0;
      height: 44px;
      width: 44px;
      font-size: 44rpx;
      display: flex;
      align-items: center;
      justify-content: center;
      /* color: #000; */
      color: #fff;
    }
  }
}

.viewport {
  background-color: #f7f7f8;
}


.overview {
  display: flex;
  flex-direction: column;
  align-items: center;

  line-height: 1;
  padding-bottom: 30rpx;
  color: #fff;
  background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/order_bg.png);
  background-size: cover;

  .status {
    font-size: 36rpx;
  }

  .status::before {
    margin-right: 6rpx;
    font-weight: 500;
  }

  .tips {
    margin: 30rpx 0;
    display: flex;
    font-size: 14px;
    align-items: center;

    .money {
      margin-right: 30rpx;
    }
  }

  .button-group {
    margin-top: 30rpx;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .button {
    width: 260rpx;
    height: 64rpx;
    margin: 0 10rpx;
    text-align: center;
    line-height: 64rpx;
    font-size: 28rpx;
    color: #27ba9b;
    border-radius: 68rpx;
    background-color: #fff;
  }
}

.shipment {
  line-height: 1.4;
  padding: 0 20rpx;
  margin: 20rpx 20rpx 0;
  border-radius: 10rpx;
  background-color: #fff;

  .locate,
  .item {
    min-height: 120rpx;
    padding: 30rpx 30rpx 25rpx 75rpx;
    background-size: 50rpx;
    background-repeat: no-repeat;
    background-position: 6rpx center;
  }

  .locate {
    background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/locate.png);

    .user {
      font-size: 26rpx;
      color: #444;
    }

    .address {
      font-size: 24rpx;
      color: #666;
    }
  }

  .item {
    background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/car.png);
    border-bottom: 1rpx solid #eee;
    position: relative;

    .message {
      font-size: 26rpx;
      color: #444;
    }

    .date {
      font-size: 24rpx;
      color: #666;
    }
  }
}

.proof {
  margin-top: 10px;
  margin: 20rpx 20rpx 0;
  padding: 0 20rpx;
}

.notice {
  margin-top: 10px;
  color: #ff0000;
  /* 温馨提示文字颜色 */
  font-size: 14px;
}

.goods {
  margin: 20rpx 20rpx 0;
  padding: 0 20rpx;
  border-radius: 10rpx;
  background-color: #fff;

  .voucher {
    // margin-left: 20px; // 调整左边距以匹配订单信息

    .title {
      margin-bottom: 10px;
      font-weight: bold;
      font-size: 30rpx;
      color: #444;
    }

    .picture {
      margin-top: 15rpx;
      width: 270rpx;
      height: 270rpx;
      border-radius: 10px;
    }
  }

  .item {
    padding: 30rpx 0;
    border-bottom: 1rpx solid #eee;

    .navigator {
      display: flex;
      flex-direction: column; // 确保 meta 部分是纵向排列的
      margin: 20rpx 0;
    }

    .cover {
      width: 170rpx;
      height: 170rpx;
      border-radius: 10rpx;
      margin-right: 20rpx;
    }

    .meta {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: center;
      position: relative;
      // background-image: url(https://pcapi-xiaotuxian-front-devtest.itheima.net/miniapp/images/car.png);
      border-bottom: 1rpx solid #eee;
    }

    .name {
      height: 80rpx;
      font-size: 26rpx;
      color: #444;
    }

    .type {
      line-height: 1.8;
      padding: 0 15rpx;
      margin-top: 6rpx;
      font-size: 24rpx;
      align-self: flex-start;
      border-radius: 4rpx;
      color: #888;
      background-color: #f7f7f8;
    }

    .price {
      display: flex;
      margin-top: 6rpx;
      font-size: 24rpx;
    }

    .symbol {
      font-size: 20rpx;
    }

    .original {
      color: #999;
      text-decoration: line-through;
    }

    .actual {
      margin-left: 10rpx;
      color: #444;
    }

    .text {
      font-size: 22rpx;
    }

    .quantity {
      position: absolute;
      bottom: 0;
      right: 0;
      font-size: 24rpx;
      color: #444;
    }

    .action {
      display: flex;
      flex-direction: row-reverse;
      justify-content: flex-start;
      padding: 30rpx 0 0;

      .button {
        width: 200rpx;
        height: 60rpx;
        text-align: center;
        justify-content: center;
        line-height: 60rpx;
        margin-left: 20rpx;
        border-radius: 60rpx;
        border: 1rpx solid #ccc;
        font-size: 26rpx;
        color: #444;
      }

      .primary {
        color: #27ba9b;
        border-color: #27ba9b;
      }
    }
  }

  .total {
    line-height: 1;
    font-size: 26rpx;
    padding: 20rpx 0;
    color: #666;

    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 10rpx 0;
    }

    .symbol::before {
      content: '¥';
      font-size: 80%;
      margin-right: 3rpx;
    }

    .primary {
      color: #cf4444;
      font-size: 36rpx;
    }
  }
}

.detail {
  line-height: 1;
  padding: 30rpx 20rpx 0;
  margin: 20rpx 20rpx 0;
  font-size: 26rpx;
  color: #666;
  border-radius: 10rpx;
  background-color: #fff;

  .title {
    font-size: 30rpx;
    color: #444;
  }

  .row {
    padding: 20rpx 0;

    .item {
      padding: 10rpx 0;
      display: flex;
      align-items: center;
    }

    .copy {
      border-radius: 20rpx;
      font-size: 20rpx;
      border: 1px solid #ccc;
      padding: 5rpx 10rpx;
      margin-left: 10rpx;
    }
  }
}

.toolbar-height {
  height: 100rpx;
  box-sizing: content-box;
}

.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc(var(--window-bottom));
  z-index: 1;

  height: 100rpx;
  padding: 0 20rpx;
  display: flex;
  align-items: center;
  flex-direction: row-reverse;
  border-top: 1rpx solid #ededed;
  border-bottom: 1rpx solid #ededed;
  background-color: #fff;
  box-sizing: content-box;

  .button {
    display: flex;
    justify-content: center;
    align-items: center;

    width: 200rpx;
    height: 72rpx;
    margin-left: 15rpx;
    font-size: 26rpx;
    border-radius: 72rpx;
    border: 1rpx solid #ccc;
    color: #444;
  }

  .delete {
    order: 4;
    color: #cf4444;
  }

  .button {
    order: 3;
  }

  .secondary {
    order: 2;
    color: #27ba9b;
    border-color: #27ba9b;
  }

  .primary {
    order: 1;
    color: #fff;
    background-color: #27ba9b;
  }
}

.popup-root {
  padding: 30rpx 30rpx 0;
  border-radius: 10rpx 10rpx 0 0;
  overflow: hidden;

  .title {
    font-size: 30rpx;
    text-align: center;
    margin-bottom: 30rpx;
  }

  .description {
    font-size: 28rpx;
    padding: 0 20rpx;

    .tips {
      color: #444;
      margin-bottom: 12rpx;
    }

    .cell {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15rpx 0;
      color: #666;
    }

    .icon::before {
      content: '\e6cd';
      font-family: 'erabbit' !important;
      font-size: 38rpx;
      color: #999;
    }

    .icon.checked::before {
      content: '\e6cc';
      font-size: 38rpx;
      color: #27ba9b;
    }
  }

  .footer {
    display: flex;
    justify-content: space-between;
    padding: 30rpx 0 40rpx;
    font-size: 28rpx;
    color: #444;

    .button {
      flex: 1;
      height: 72rpx;
      text-align: center;
      line-height: 72rpx;
      margin: 0 20rpx;
      color: #444;
      border-radius: 72rpx;
      border: 1rpx solid #ccc;
    }

    .primary {
      color: #fff;
      background-color: #27ba9b;
      border: none;
    }
  }
}
</style>
