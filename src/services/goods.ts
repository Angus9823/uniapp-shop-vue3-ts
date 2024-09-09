import type { GoodsResult, ProjectListResult } from '@/types/goods'
import { http } from '@/utils/http'

/**
 * 商品详情
 * @param id 商品id
 */
export const getGoodsByIdAPI = (id: string) => {
  return http<GoodsResult>({
    method: 'GET',
    url: '/goods',
    data: { id },
  })
}

export const getProjectByIdAPI = (projectId: string) => {
  return http<ProjectListResult>({
    method: 'POST',
    url: '/applet/projectWhiteListRelation/list',
    data: { projectId },
  })
}
