<script setup lang="ts">
import { ref, watch, nextTick, onMounted, watchEffect } from 'vue'
import OrderList from './components/OrderList.vue'
import CustomTicketNavbar from './components/CustomTicketNavbar.vue'
import { onShow, onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app'
import { getMemberOrderAPI } from '@/services/order'



// 获取页面参数
const query = defineProps<{
  type: string
}>()

// tabs 数据
const orderTabs = ref([
  { orderState: 0, title: '全部', isRender: false }, // 默认渲染 "全部"
  { orderState: 1, title: '待付款', isRender: false },
  { orderState: 2, title: '待出票', isRender: false },
  { orderState: 3, title: '已出票', isRender: false },
  { orderState: 4, title: '已取消', isRender: false },
])

// 高亮下标
const activeIndex = ref(orderTabs.value.findIndex((v) => v.orderState === Number(query.type)))
// 默认渲染容器
orderTabs.value[activeIndex.value].isRender = true

// OrderList 的引用，用于调用子组件的方法
const orderListRefs = ref<InstanceType<typeof OrderList>[]>([])

// 修改1: 统一点击和滑动逻辑
const updateActiveIndex = async (newIndex: number) => {
  activeIndex.value = newIndex;
  orderTabs.value[newIndex].isRender = true;

  // 确保 DOM 渲染完成后再访问 ref
  await nextTick();

  const currentOrderListRef = orderListRefs.value[newIndex];
  if (currentOrderListRef) {
    console.log(`Refreshing data for tab: ${orderTabs.value[newIndex].title}`);
    currentOrderListRef.getMemberOrderDataForToggleCursor();
  } else {
    console.warn(`OrderList ref for tab index ${newIndex} is not yet initialized.`);
  }
}

// 处理swiper组件切换事件
const onSwiperChange = async (e: any) => {
  const newIndex = e.detail.current;
  updateActiveIndex(newIndex); // 修改2: 使用统一的updateActiveIndex方法
};

// 页面显示时处理逻辑
onShow(() => {
  const type = uni.getStorageSync('orderType');
  console.log("读取到的 orderType:", type);

  if (type) {
    const newIndex = orderTabs.value.findIndex((v) => v.orderState === Number(type));
    updateActiveIndex(newIndex); // 修改3: 使用统一的updateActiveIndex方法
  } else {
    updateActiveIndex(0); // 修改4: 使用统一的updateActiveIndex方法
  }

  // 清除存储的参数
  uni.removeStorageSync('orderType');
});

// 配置转发给朋友功能
onShareAppMessage(() => {
  return {
    title: 'AllByMusic票务', // 替换为你想要的分享标题
    path: '/pages/index/index', // 替换为你想要的分享路径
  }
})

// 配置分享到朋友圈功能
onShareTimeline(() => {
  return {
    title: 'AllByMusic票务', // 替换为你想要的分享标题
    path: '/pages/index/index', // 替换为你想要的分享路径
  }
})
</script>

<template>
  <view class="viewport">
    <!-- 自定义导航栏 -->
    <CustomTicketNavbar />

    <!-- tabs -->
    <view class="tabs">
      <text class="item" v-for="(item, index) in orderTabs" :key="item.title" @tap="() => updateActiveIndex(index)">
        <!-- 修改5: 使用统一的updateActiveIndex方法 -->
        {{ item.title }}
      </text>

      <!-- 游标 -->
      <view class="cursor" :style="{ left: activeIndex * 20 + '%' }"></view>
    </view>

    <!-- 滑动容器 -->
    <swiper class="swiper" :current="activeIndex" @change="onSwiperChange">
      <!-- 滑动项 -->
      <swiper-item v-for="(item, index) in orderTabs" :key="item.title">
        <!-- 订单列表 -->
        <OrderList v-if="item.isRender" :ref="el => orderListRefs[index] = el" :order-state="item.orderState" />
      </swiper-item>
    </swiper>
  </view>
</template>


<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
}

.viewport {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #fff;
}

// tabs
.tabs {
  display: flex;
  justify-content: space-around;
  line-height: 60rpx;
  margin: 0 10rpx;
  background-color: #fff;
  box-shadow: 0 4rpx 6rpx rgba(240, 240, 240, 0.6);
  position: relative;
  z-index: 9;

  .item {
    flex: 1;
    text-align: center;
    padding: 20rpx;
    font-size: 28rpx;
    color: #262626;
  }

  .cursor {
    position: absolute;
    left: 0;
    bottom: 0;
    // width: 25%;
    width: 20%;
    height: 6rpx;
    padding: 0 50rpx;
    background-color: #27ba9b;
    /* 过渡效果 */
    transition: all 0.4s;
  }
}

// swiper
.swiper {
  background-color: #f7f7f8;
}
</style>
