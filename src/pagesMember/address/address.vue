<script setup lang="ts">
import { deleteMemberAddressByIdAPI, getMemberAddressAPI, getMemberWriteListAPI } from '@/services/address'
import { useAddressStore } from '@/stores/modules/address'
import type { AddressItem, AddWriteListItem } from '@/types/address'
import { onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'

// 获取白名单列表数据
const addressList = ref<AddWriteListItem[]>([])
const getMemberAddressData = async () => {
  const res = await getMemberWriteListAPI()
  addressList.value = res.result
}

// 初始化调用(页面显示)
onShow(() => {
  getMemberAddressData()
})

// 删除收货地址
const onDeleteAddress = (id: number) => {
  // 二次确认
  uni.showModal({
    content: '删除持票人?',
    confirmColor: '#27BA9B',
    success: async (res) => {
      if (res.confirm) {
        // 根据id删除收货地址
        await deleteMemberAddressByIdAPI(id)
        // 重新获取收货地址列表
        getMemberAddressData()
      }
    },
  })
}

// 修改收货地址
const onChangeAddress = (item: AddressItem) => {
  // 修改地址
  const addressStore = useAddressStore()
  addressStore.changeSelectedAddress(item)
  // 返回上一页
  uni.navigateBack()
}

// 新增持票人
const onAddAddress = () => {
  if (addressList.value.length >= 6) {
    uni.showToast({
      title: '您的持票人数量已达限制',
      icon: 'none',
    })
    return
  }
  uni.navigateTo({
    url: '/pagesMember/address-form/address-form',
  })
}

</script>

<template>
  <view class="viewport">
    <!-- 地址列表 -->
    <scroll-view enable-back-to-top class="scroll-view" scroll-y>
      <view v-if="addressList.length" class="address">
        <uni-swipe-action class="address-list">
          <!-- 收货地址项 -->
          <uni-swipe-action-item class="item" v-for="item in addressList" :key="item.id">
            <!-- <view class="item-content" @tap="onChangeAddress(item)"> -->
            <view class="item-content">
              <!-- <view class="user">
                姓名： {{ item.realName }}

                <text v-if="item.isSelf === true" class="badge">本人</text>
              </view>
              <view class="locate">证件类型：{{
                item.documentType === 1 ? '身份证' : item.documentType
                }}</view>
              <view class="locate">证件号： {{ item.identificationNumber }}</view> -->

              <view class="user">
                <view class="label">姓名：</view>
                <view class="value">{{ item.realName }}</view>
                <text v-if="item.isSelf === true" class="badge">本人</text>
              </view>
              <view class="locate">
                <view class="label">证件类型：</view>
                <view class="value">{{ item.documentType === 1 ? '身份证' : item.documentType }}</view>
              </view>
              <view class="locate">
                <view class="label">证件号：</view>
                <view class="value">{{ item.identificationNumber }}</view>
              </view>

              <!-- H5 端需添加 .prevent 阻止链接的默认行为 -->
              <!-- <navigator class="edit" hover-class="none" :url="`/pagesMember/address-form/address-form?id=${item.id}`"
                @tap.stop="() => { }" @tap.prevent="() => { }">
                修改
              </navigator> -->
            </view>
            <!-- 右侧插槽 -->
            <template #right>
              <button @tap="onDeleteAddress(item.id)" class="delete-button">删除</button>
            </template>
          </uni-swipe-action-item>
        </uni-swipe-action>
      </view>
      <view v-else class="blank">暂无持票人</view>
    </scroll-view>
    <!-- 添加按钮 -->
    <!-- <view class="add-btn">
      <navigator hover-class="none" url="/pagesMember/address-form/address-form">
        新增持票人
      </navigator>
    </view> -->
    <!-- 添加按钮 -->
    <view>
      <button class="add-btn" @tap="onAddAddress">新增持票人</button>
    </view>
  </view>
</template>

<style lang="scss">
page {
  height: 100%;
  overflow: hidden;
}

/* 删除按钮 */
.delete-button {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 50px;
  height: 100%;
  font-size: 28rpx;
  color: #fff;
  border-radius: 0;
  padding: 0;
  background-color: #cf4444;
}

.viewport {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f4f4f4;

  .scroll-view {
    padding-top: 20rpx;
  }
}

.address {
  padding: 0 20rpx;
  margin: 0 20rpx;

  /* 每个卡片容器 */
  .item-content {
    line-height: 1;
    padding: 40rpx 10rpx 38rpx;
    margin-bottom: 20rpx;
    border-radius: 15rpx;
    background-color: #fff;
    border: 1rpx solid #e0e0e0;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
    /* 添加基础阴影效果 */
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    /* 动画效果 */
    position: relative;

    &:hover {
      transform: translateY(-10rpx);
      /* 悬停时轻微上移 */
      box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
      /* 增加阴影深度 */
    }

    /* 修改后的标签和数值样式 */
    .label {
      flex: 1;
      color: #333;
      font-size: 26rpx;
      font-weight: bold;
    }

    .value {
      flex: 1;
      color: #0b0a0a;
      font-size: 28rpx;
      font-weight: bold;
      text-align: right;
    }

    .edit {
      position: absolute;
      top: 36rpx;
      right: 30rpx;
      padding: 2rpx 0 2rpx 20rpx;
      border-left: 1rpx solid #666;
      font-size: 26rpx;
      color: #666;
      line-height: 1;
    }
  }

  /* 删除最后一个元素的边框 */
  .item:last-child .item-content {
    border: none;
  }

  /* 用户信息部分 */
  .user {
    display: flex;
    font-size: 28rpx;
    margin-bottom: 20rpx;
    color: #333;

    .contact {
      color: #666;
    }

    .badge {
      display: inline-block;
      padding: 4rpx 10rpx 2rpx 14rpx;
      margin: 2rpx 0 0 10rpx;
      font-size: 26rpx;
      color: #27ba9b;
      border-radius: 6rpx;
      border: 1rpx solid #27ba9b;
    }
  }

  /* 地址信息部分 */
  .locate {
    display: flex;
    line-height: 1.6;
    font-size: 26rpx;
    color: #333;
  }
}

.blank {
  margin-top: 300rpx;
  text-align: center;
  font-size: 32rpx;
  color: #888;
}

/* 添加按钮样式 */
.add-btn {
  height: 80rpx;
  text-align: center;
  line-height: 80rpx;
  margin: 30rpx 20rpx;
  color: #fff;
  border-radius: 80rpx;
  font-size: 30rpx;
  background-color: #27ba9b;
}
</style>
