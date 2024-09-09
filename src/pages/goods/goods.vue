<script setup lang="ts">
import { ref, computed } from 'vue'
import { getProjectByIdAPI } from '@/services/goods'
import type { ProjectListResult } from '@/types/goods'
import { onLoad } from '@dcloudio/uni-app'
import type {
  SkuPopupEvent,
  SkuPopupInstance,
  SkuPopupLocaldata,
  Localdata,
} from '@/components/vk-data-goods-sku-popup/vk-data-goods-sku-popup'
import {
  getMemberOrderPreAPI,
  getMemberOrderPreNowAPI,
  getMemberOrderRepurchaseByIdAPI,
  postMemberOrderAPI,
  postMyMemberOrderAPI,
} from '@/services/order'
// 获取屏幕边界到安全区域距离
const { safeAreaInsets } = uni.getSystemInfoSync()

const query = defineProps<{ id: string }>()

const goods = ref<ProjectListResult[]>([])
const selectedTicketHolders = ref<string[]>([])

const getGoodsByIdData = async () => {
  const res = await getProjectByIdAPI(query.id)
  if (Array.isArray(res.result)) {
    goods.value = res.result as ProjectListResult[];
  } else {
    goods.value = [res.result] as ProjectListResult[];
  }
}

const totalPayment = computed(() => {
  return goods.value
    .filter(holder => selectedTicketHolders.value.includes(holder.identificationNumber))
    .reduce((sum, holder) => sum + holder.projectSessionPrice, 0)
})

onLoad(() => {
  getGoodsByIdData()
})

const toggleSelection = (identificationNumber: string, availableFlag: boolean) => {
  if (!availableFlag) return; // 禁止选择不可用的项
  const index = selectedTicketHolders.value.indexOf(identificationNumber)
  if (index === -1) {
    selectedTicketHolders.value.push(identificationNumber)
  } else {
    selectedTicketHolders.value.splice(index, 1)
  }
}

// // 立即购买
// const onBuyNow = (ev: SkuPopupEvent) => {
//   uni.navigateTo({ url: `/pagesOrder/create/create?skuId=${ev._id}&count=${ev.buy_num}` })
// }
// 提交订单
const onOrderSubmit = async () => {
  if (selectedTicketHolders.value.length === 0) {
    return uni.showToast({ icon: 'none', title: '请选择商品' })
  }

  // 构建 priceInfos 数组
  const priceInfos = goods.value
    .filter(holder => selectedTicketHolders.value.includes(holder.identificationNumber))
    .map(holder => ({
      projectSessionPriceId: holder.projectSessionPriceId,
      whiteListId: holder.whiteListId
    }));

  // 发送请求
  const res = await postMyMemberOrderAPI({
    projectId: query.id,
    priceInfos: priceInfos
  });

  // 关闭当前页面，跳转到订单详情，传递订单id
  uni.redirectTo({ url: `/pagesOrder/detail/detail?id=${res.result.id}` })
}

// 添加持票人方法
const onAddTicketHolder = () => {
  uni.navigateTo({
    url: '/pagesMember/address/address', // 指定页面的URL
  });
};

</script>

<template>
  <scroll-view enable-back-to-top scroll-y class="viewport">
    <view class="ticket-holders">
      <view v-for="holder in goods" :key="holder.identificationNumber"
        :class="['holder-item', { 'disabled': !holder.availableFlag }]"
        @click="toggleSelection(holder.identificationNumber, holder.availableFlag)">
        <view class="checkbox-container">
          <view class="custom-checkbox" :class="{
            'checked': selectedTicketHolders.includes(holder.identificationNumber) && holder.availableFlag,
            'red-cross': !holder.availableFlag
          }">
            <view v-if="!holder.availableFlag" class="red-cross">✖</view>
            <view v-else-if="selectedTicketHolders.includes(holder.identificationNumber)" class="green-check">✔</view>
          </view>
          <text>{{ holder.userName }}</text>
        </view>
        <text class="price">¥{{ holder.projectSessionPrice }}</text>
      </view>
    </view>

    <view class="total-payment">
      <text>应付款总额:</text>
      <text class="total-pay"> ¥{{ totalPayment }}</text>
    </view>
  </scroll-view>

  <!-- 用户操作 -->
  <!-- <view v-if="goods" class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }"> -->
  <view v-if="goods" class="toolbar" :style="{ paddingBottom: safeAreaInsets?.bottom + 'px' }">
    <view class="icons">
      <!-- <button class="icons-button"><text class="icon-heart"></text>收藏</button> -->
      <!-- #ifdef MP-WEIXIN -->
      <!-- <button class="icons-button" open-type="contact">
        <text class="icon-handset"></text>客服
      </button> -->
      <!-- #endif -->
    </view>
    <view class="buttons">
      <!-- <view @tap="openSkuPopup(SkuMode.Cart)" class="addcart"> 加入购物车 </view> -->
      <!-- <view @tap="onBuyNow" class="payment"> 立即购买 </view> -->
    </view>
    <!-- 添加持票人按钮 -->
    <!-- <view class="button" @tap="onAddTicketHolder"> 添加持票人 </view>
    <view class="button" :class="{ disabled: selectedTicketHolders.length === 0 }" @tap="onOrderSubmit">
      提交订单
    </view> -->
    <view class="buttons-container">
      <view class="button" @tap="onAddTicketHolder"> 添加持票人 </view>
      <view class="button" :class="{ disabled: selectedTicketHolders.length === 0 }" @tap="onOrderSubmit">
        提交订单
      </view>
    </view>
  </view>

</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.viewport {
  background-color: #f4f4f4;
}


.ticket-holders {
  margin: 20rpx;
}

.holder-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20rpx;
  border-bottom: 1rpx solid #eaeaea;
}

.holder-item.disabled {
  background-color: #f5f5f5;
  /* 灰色背景 */
  color: #818181;
  /* 设置文字颜色为 #818181 */
}

.checkbox-container {
  display: flex;
  align-items: center;
}

.custom-checkbox {
  width: 24rpx;
  height: 24rpx;
  border: 1rpx solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 10rpx;
}

.custom-checkbox.checked {
  background-color: #52c41a;
  /* 绿色背景 */
  color: white;
}

.custom-checkbox.red-cross {
  background-color: #ff4d4f;
  /* 红色背景 */
  border-color: #ff4d4f;
}

.red-cross {
  color: white;
  font-size: 20rpx;
}

.green-check {
  color: white;
  font-size: 20rpx;
}

.price {
  font-size: 28rpx;
  color: #333;
}

.holder-item.disabled .price {
  color: #818181;
  /* 设置价格文字颜色为 #818181 */
}

.total-payment {
  margin: 20rpx;
  font-size: 36rpx;
  font-weight: bold;

}

.total-pay {
  font-size: 40rpx;
  color: #cf4444;

  .decimal {
    font-size: 75%;
  }
}


/* 底部工具栏 */
.toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: calc((var(--window-bottom)));
  z-index: 1;
  background-color: #fff;
  height: 100rpx;
  padding: 0 20rpx;
  border-top: 1rpx solid #eaeaea;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-sizing: content-box;

  .total-pay {
    font-size: 40rpx;
    color: #cf4444;

    .decimal {
      font-size: 75%;
    }
  }

  /* 新增按钮容器样式 */
  .buttons-container {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20rpx;
    /* 设置两个按钮之间的间隔 */
    padding: 20rpx 0;
    /* 上下留有一定的间距 */
  }

  .button {
    width: 220rpx;
    text-align: center;
    line-height: 72rpx;
    font-size: 26rpx;
    color: #fff;
    border-radius: 72rpx;
    background-color: #27ba9b;
  }

  .disabled {
    opacity: 0.6;
  }

  .buttons {
    display: flex;

    &>view {
      width: 220rpx;
      text-align: center;
      line-height: 72rpx;
      font-size: 26rpx;
      color: #fff;
      border-radius: 72rpx;
    }

    .addcart {
      background-color: #ffa868;
    }

    .payment {
      background-color: #27ba9b;
      margin-left: 20rpx;
    }
  }

  .icons {
    padding-right: 20rpx;
    display: flex;
    align-items: center;
    flex: 1;

    // 兼容 H5 端和 App 端的导航链接样式
    .navigator-wrap,
    .icons-button {
      flex: 1;
      text-align: center;
      line-height: 1.4;
      padding: 0;
      margin: 0;
      border-radius: 0;
      font-size: 20rpx;
      color: #333;
      background-color: #fff;

      &::after {
        border: none;
      }
    }

    text {
      display: block;
      font-size: 34rpx;
    }
  }
}
</style>
