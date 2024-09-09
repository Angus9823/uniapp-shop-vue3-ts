<script setup lang="ts">
import { ref, computed } from 'vue'
import { getProjectByIdAPI } from '@/services/goods'
import type { ProjectListResult } from '@/types/goods'
import { onLoad } from '@dcloudio/uni-app'

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
            <view v-if="!holder.availableFlag" class="red-cross-icon">✖</view>
            <view v-else-if="selectedTicketHolders.includes(holder.identificationNumber)" class="green-check">✔</view>
          </view>
          <text>{{ holder.userName }}</text>
        </view>
        <text class="price">¥{{ holder.projectSessionPrice }}</text>
      </view>
    </view>

    <view class="total-payment">
      <text>应付款总额: ¥{{ totalPayment }}</text>
    </view>
  </scroll-view>
</template>

<style scoped>
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
  position: relative;
  /* 使红色叉号能够正确定位 */
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

.red-cross-icon {
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

.total-payment {
  margin: 20rpx;
  font-size: 36rpx;
  font-weight: bold;
}
</style>
