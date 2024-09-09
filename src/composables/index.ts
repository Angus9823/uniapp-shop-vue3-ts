import type { XtxGuessInstance ,XtxProjectListInstance} from '@/types/components'
import { ref } from 'vue'

/**
 * 猜你喜欢组合式函数
 */
export const useGuessList = () => {
  // 获取猜你喜欢组件实例
  const guessRef = ref<XtxGuessInstance>()
  const projectListRef = ref<XtxProjectListInstance>()

  // 滚动触底事件
  const onScrolltolower = () => {
    // console.log('猜你喜欢组件触底事件')
    guessRef.value?.getMore()
    projectListRef.value?.getMore()
  }

  // 返回 ref 和事件处理函数
  return {
    guessRef,
    projectListRef,
    onScrolltolower
  }
}
