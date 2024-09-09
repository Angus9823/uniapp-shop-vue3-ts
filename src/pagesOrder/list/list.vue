<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'
import OrderList from './components/OrderList.vue'

// 获取页面参数
const query = defineProps<{ type: string }>()
console.log("Query parameters:", query)

// tabs 数据
const orderTabs = ref([
  { orderState: 0, title: '全部', isRender: true },
  { orderState: 1, title: '待付款', isRender: false },
  { orderState: 2, title: '已完成', isRender: false },
  { orderState: 3, title: '已取消', isRender: false },
])

// 高亮下标
const activeIndex = ref(orderTabs.value.findIndex((v) => v.orderState === Number(query.type)))
console.log("Initial active index:", activeIndex.value)

watch(activeIndex, async (newIndex) => {
  console.log("Watcher triggered, new index:", newIndex);

  orderTabs.value.forEach((tab, i) => {
    tab.isRender = i === newIndex;
  });

  // 等待 DOM 更新
  await nextTick();
  console.log("Checking for orderListComponent...");

  const orderListComponent = document.querySelector('.order-list-component');
  console.log("orderListComponent found:", orderListComponent);

  if (orderListComponent) {
    if (orderListComponent.onRefresherrefresh) {
      console.log("Calling refresh method");
      orderListComponent.onRefresherrefresh(); // 调用刷新方法
    } else {
      console.error("Refresh method not found");
    }
  } else {
    console.error("orderListComponent not found");
  }
});
onMounted(() => {
  console.log('Component mounted')
})

</script>

<template>
  <view class="viewport">
    <view class="tabs">
      <text class="item" v-for="(item, index) in orderTabs" :key="item.title" @tap="() => {
        activeIndex.value = index;
        console.log('Tab tapped:', item.title)
      }">
        {{ item.title }}
      </text>
      <view class="cursor" :style="{ left: activeIndex * (100 / orderTabs.length) + '%' }"></view>
    </view>
    <swiper class="swiper" :current="activeIndex">
      <swiper-item v-for="item in orderTabs" :key="item.title">
        <OrderList v-if="item.isRender" :order-state="item.orderState" class="order-list-component" />
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
