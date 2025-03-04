import request from '@/config/axios'
import type { MenuVO } from './types'

// 查询菜单（精简)列表
export const listSimpleMenusApi = () => {
  return request.get({ url: '/system/menu/list-all-simple' })
}
// 查询菜单列表
export const getMenuListApi = (params) => {
  return request.get({ url: '/system/menu/list', params })
}

// 获取菜单详情
export const getMenuApi = (id: number) => {
  return request.get({ url: '/system/menu/get?id=' + id })
}

// 新增菜单
export const createMenuApi = (data: MenuVO) => {
  return request.post({ url: '/system/menu/create', data })
}

// 修改菜单
export const updateMenuApi = (data: MenuVO) => {
  return request.put({ url: '/system/menu/update', data })
}

// 删除菜单
export const deleteMenuApi = (id: number) => {
  return request.delete({ url: '/system/menu/delete?id=' + id })
}
