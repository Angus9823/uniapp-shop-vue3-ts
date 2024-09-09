<script setup lang="ts">
import { getHomeGoodsGuessLikeAPI, getProjectListAPI } from '@/services/home'
import type { PageParams } from '@/types/global'
import type { GuessItem, ProjectItem } from '@/types/home'
import { onMounted, ref } from 'vue'


// // 获取屏幕边界到安全区域距离
// const { model, safeAreaInsets } = uni.getSystemInfoSync()

// let paddingTop: number;

// paddingTop = safeAreaInsets!.top < 50 ? 55 : safeAreaInsets!.top;
// // paddingTop = 55
// console.log("Angus` safeAreaInsets", safeAreaInsets)
// // console.log("safeAreaInsets.top", safeAreaInsets.top)
// console.log("Angus` paddingTop", paddingTop)

// 分页参数
const pageParams: Required<PageParams> = {
  page: 1,
  pageSize: 10,
}
// 猜你喜欢的列表
const guessList = ref<ProjectItem[]>([])
// 已结束标记
const finish = ref(false)
// 获取猜你喜欢数据
const getHomeGoodsGuessLikeData = async () => {
  // 退出分页判断
  if (finish.value === true) {
    return uni.showToast({ icon: 'none', title: '没有更多数据~' })
  }
  const res = await getProjectListAPI(pageParams)
  // guessList.value = res.result.items
  // 数组追加
  guessList.value.push(...res.result.items)

  // console.log("res.result.items", res.result.items)
  // console.log("guessList.value", guessList.value)
  // 分页条件
  if (pageParams.page < res.result.pages) {
    // 页码累加
    pageParams.page++
  } else {
    finish.value = true
  }
}
// 重置数据
const resetData = () => {
  pageParams.page = 1
  guessList.value = []
  finish.value = false
}
// 组件挂载完毕
onMounted(() => {
  getHomeGoodsGuessLikeData()
})
// 暴露方法
defineExpose({
  resetData,
  getMore: getHomeGoodsGuessLikeData,
})
</script>

<template>
  <!-- 猜你喜欢 -->
  <view class="caption">
    <!-- <text class="text">猜你喜欢</text> -->
    <text class="text">项目列表</text>
  </view>
  <view class="guess">
    <navigator class="guess-item" v-for="item in guessList" :key="item.id" :url="`/pages/goods/goods?id=${item.id}`">
      <!-- <image class="image" mode="aspectFill" :src="item.projectImg"></image> -->
      <view class="name"> {{ item.projectName }} </view>
      <!-- <view class="price">
        <text class="small">¥</text>
        <text>{{ 99 }}</text>
      </view> -->
      <!-- <view>{{ item.projectTime }}</view> -->
    </navigator>
  </view>
  <view class="loading-text">
    {{ finish ? '没有更多数据~' : '正在加载...' }}
  </view>
</template>

<style lang="scss">
:host {
  display: block;
}

/* 分类标题 */
.caption {
  display: flex;
  justify-content: center;
  line-height: 1;
  padding: 36rpx 0 40rpx;
  font-size: 32rpx;
  color: #262626;

  .text {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0 28rpx 0 30rpx;

    &::before,
    &::after {
      content: '';
      width: 20rpx;
      height: 20rpx;
      background-image: url(@/static/images/bubble.png);
      background-size: contain;
      margin: 0 10rpx;
    }
  }
}

/* 猜你喜欢 */
.guess {
  display: flex;
  // flex-wrap: wrap;
  // justify-content: space-between;
  flex-direction: column; // 列布局，一排显示一个项目
  padding: 0 20rpx;

  // .guess-item {
  //   width: 345rpx;
  //   padding: 24rpx 20rpx 20rpx;
  //   margin-bottom: 20rpx;
  //   border-radius: 10rpx;
  //   overflow: hidden;
  //   // background-color: #fff;
  // }
  .guess-item {
    width: 100%; // 宽度设置为100%，使得每排只显示一个项目
    padding: 24rpx 20rpx;
    margin-bottom: 20rpx;
    border-radius: 10rpx;
    background-color: #fff; // 白色背景
    box-shadow: 0 4rpx 8rpx rgba(0, 0, 0, 0.1); // 添加阴影，增加层次感
    overflow: hidden;
  }

  .image {
    width: 304rpx;
    height: 304rpx;
  }

  // .name {
  //   height: 75rpx;
  //   margin: 10rpx 0;
  //   font-size: 26rpx;
  //   color: #262626;
  //   overflow: hidden;
  //   text-overflow: ellipsis;
  //   display: -webkit-box;
  //   -webkit-line-clamp: 2;
  //   -webkit-box-orient: vertical;
  // }
  .name {
    height: auto; // 让高度自适应内容
    margin: 10rpx 0;
    font-size: 30rpx; // 适当增大字体
    color: #262626;
    overflow: hidden;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
  }

  .price {
    line-height: 1;
    padding-top: 4rpx;
    color: #cf4444;
    font-size: 26rpx;
  }

  .small {
    font-size: 80%;
  }
}

// 加载提示文字
.loading-text {
  text-align: center;
  font-size: 28rpx;
  color: #666;
  padding: 20rpx 0;
}
</style>
