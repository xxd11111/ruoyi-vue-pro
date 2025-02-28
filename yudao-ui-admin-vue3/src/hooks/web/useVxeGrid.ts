import { computed, reactive } from 'vue'
import { SizeType, VxeGridProps } from 'vxe-table'
import { useAppStore } from '@/store/modules/app'
import { VxeAllSchemas } from './useVxeCrudSchemas'
import { useI18n } from '@/hooks/web/useI18n'
import { useMessage } from '@/hooks/web/useMessage'

const { t } = useI18n()
const message = useMessage() // 消息弹窗

interface UseVxeGridConfig<T = any> {
  allSchemas: VxeAllSchemas
  getListApi: (option: any) => Promise<T>
  delListApi?: (option: any) => Promise<T>
  exportListApi?: (option: any) => Promise<T>
}

const appStore = useAppStore()

const currentSize = computed(() => {
  let resSize: SizeType = 'small'
  const appsize = appStore.getCurrentSize
  switch (appsize) {
    case 'large':
      resSize = 'medium'
      break
    case 'default':
      resSize = 'small'
      break
    case 'small':
      resSize = 'mini'
      break
  }
  return resSize
})

export const useVxeGrid = <T = any>(config?: UseVxeGridConfig<T>) => {
  const gridOptions = reactive<VxeGridProps>({
    loading: true,
    size: currentSize as any,
    height: 700,
    rowConfig: {
      isCurrent: true, // 当鼠标点击行时，是否要高亮当前行
      isHover: true // 当鼠标移到行时，是否要高亮当前行
    },
    showOverflow: 'tooltip', // 当内容溢出时显示为省略号
    tooltipConfig: {
      showAll: true // 开启全表工具提示
    },
    toolbarConfig: {
      custom: true,
      slots: { buttons: 'toolbar_buttons' }
    },
    printConfig: {
      columns: config?.allSchemas.printSchema
    },
    formConfig: {
      titleWidth: 100,
      titleAlign: 'right',
      items: config?.allSchemas.searchSchema
    },
    columns: config?.allSchemas.tableSchema,
    pagerConfig: {
      border: false, // 带边框
      background: true, // 带背景颜色
      perfect: true, // 配套的样式
      pageSize: 10, // 每页大小
      pagerCount: 7, // 显示页码按钮的数量
      autoHidden: true, // 当只有一页时自动隐藏
      pageSizes: [5, 10, 15, 20, 50, 100, 200, 500], // 每页大小选项列表
      layouts: [
        'PrevJump',
        'PrevPage',
        'Jump',
        'PageCount',
        'NextPage',
        'NextJump',
        'Sizes',
        'Total'
      ]
    },
    proxyConfig: {
      seq: true, // 启用动态序号代理（分页之后索引自动计算为当前页的起始序号）
      form: true, // 启用表单代理，当点击表单提交按钮时会自动触发 reload 行为
      props: { result: 'list', total: 'total' },
      ajax: {
        query: ({ page, form }) => {
          const queryParams = Object.assign({}, form)
          queryParams.pageSize = page.pageSize
          queryParams.pageNo = page.currentPage
          gridOptions.loading = false
          return new Promise(async (resolve) => {
            resolve(await config?.getListApi(queryParams))
          })
        }
      }
    }
  })
  const delList = (ids: string | number | string[] | number[]) => {
    return new Promise(async () => {
      message.delConfirm().then(() => {
        config?.delListApi && config?.delListApi(ids)
        message.success(t('common.delSuccess'))
      })
    })
  }
  return {
    gridOptions,
    delList
  }
}
