<script setup lang="ts">
import { getHomeBannerAPI, getHomeCategoryAPI, getHomeHotAPI } from '@/services/home'
import type { BannerItem, CategoryItem, HotItem } from '@/types/home'
import { onLoad, onShareAppMessage, onShareTimeline, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import CustomNavbar from './components/CustomNavbar.vue'
import CategoryPanel from './components/CategoryPanel.vue'
import HotPanel from './components/HotPanel.vue'
import PageSkeleton from './components/PageSkeleton.vue'
import { useGuessList } from '@/composables'

// // 获取屏幕边界到安全区域距离
// const { model, safeAreaInsets } = uni.getSystemInfoSync()

// let paddingTop: number;

// paddingTop = safeAreaInsets!.top < 30 && safeAreaInsets!.top > 40 ? 35 : safeAreaInsets!.top;
// // paddingTop = 55
// console.log("Angus` safeAreaInsets L", safeAreaInsets)
// // console.log("safeAreaInsets.top", safeAreaInsets.top)
// console.log("Angus` paddingTop L", paddingTop)


// 获取轮播图数据
const bannerList = ref<BannerItem[]>([])
const getHomeBannerData = async () => {
  const res = await getHomeBannerAPI()
  bannerList.value = res.result
}

// 获取前台分类数据
const categoryList = ref<CategoryItem[]>([])
const getHomeCategoryData = async () => {
  const res = await getHomeCategoryAPI()
  categoryList.value = res.result
}

// 获取热门推荐数据
const hotList = ref<HotItem[]>([])
const getHomeHotData = async () => {
  const res = await getHomeHotAPI()
  hotList.value = res.result
}

// 是否加载中标记
const isLoading = ref(false)
// 当前下拉刷新状态
const isTriggered = ref(false)

// 猜你喜欢组合式函数调用
const { guessRef, projectListRef, onScrolltolower } = useGuessList()

// 自定义下拉刷新被触发
// const onRefresherrefresh = async () => {
//   // 开始动画
//   isTriggered.value = true
//   // 加载数据
//   // await getHomeBannerData()
//   // await getHomeCategoryData()
//   // await getHomeHotData()
//   // 重置猜你喜欢组件数据
//   // guessRef.value?.resetData()
//   projectListRef.value?.resetData()
//   await Promise.all([
//     // getHomeBannerData(),
//     // getHomeCategoryData(),
//     // getHomeHotData(),
//     // guessRef.value?.getMore(),
//     projectListRef.value?.getMore(),
//   ])
//   // 关闭动画
//   isTriggered.value = false
// }

// 【修改1】封装一个函数来重置刷新状态
const resetRefresherState = () => {
  isTriggered.value = false
  isLoading.value = false
}

// 自定义下拉刷新被触发
const onRefresherrefresh = async () => {
  console.log('自定义下拉刷新被触发')
  // 开始动画
  isTriggered.value = true
  // 加载数据
  projectListRef.value?.resetData()
  try {
    await Promise.all([
      projectListRef.value?.getMore(),
    ])
  } catch (error) {
    console.error('刷新时出错:', error)
  } finally {
    // 【修改2】确保在刷新操作完成后关闭动画
    resetRefresherState()
  }
}

// 页面加载
onLoad(async () => {
  isLoading.value = true
  // 页面加载时触发下拉刷新
  try {
    await onRefresherrefresh()
  } catch (error) {
    console.error('加载时出错:', error)
  } finally {
    // 【修改3】确保页面加载时动画也关闭
    resetRefresherState()
  }
})


// 【修改4】在登录后返回页面时确保刷新状态已被重置，并自动触发刷新
onShow(async () => {
  resetRefresherState() // 用户回到页面时，确保动画关闭

  // 【修改5】每次显示页面时自动触发下拉刷新
  isLoading.value = true
  try {
    await onRefresherrefresh()
  } catch (error) {
    console.error('onShow刷新数据时出错:', error)
  } finally {
    isLoading.value = false
  }
})

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
    <CustomNavbar />
    <!-- 滚动容器 -->
    <scroll-view enable-back-to-top refresher-enabled @refresherrefresh="onRefresherrefresh"
      :refresher-triggered="isTriggered" @scrolltolower="onScrolltolower" class="scroll-view" scroll-y>
      <PageSkeleton v-if="isLoading" />
      <template v-else>
        <!-- <template> -->
        <!-- 自定义轮播图 -->
        <!-- <XtxSwiper :list="bannerList" /> -->
        <!-- 分类面板 -->
        <!-- <CategoryPanel :list="categoryList" /> -->
        <!-- 热门推荐 -->
        <!-- <HotPanel :list="hotList" /> -->
        <!-- 猜你喜欢 -->
        <!-- <XtxGuess ref="guessRef" /> -->
        <XtxProjectList ref="projectListRef" />
      </template>
    </scroll-view>
  </view>
</template>

<style lang="scss">
page {
  background-color: #f7f7f7;
  // background-color: #9619a2;
  height: 100%;
  overflow: hidden;
}

.viewport {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.scroll-view {
  flex: 1;
  overflow: hidden;
}
</style>
