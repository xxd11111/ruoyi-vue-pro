import { DescriptionsSchema } from '@/types/descriptions'
import { getIntDictOptions } from '@/utils/dict'
import { reactive } from 'vue'
import {
  FormItemRenderOptions,
  VxeColumnPropTypes,
  VxeFormItemProps,
  VxeGridPropTypes,
  VxeTableDefines
} from 'vxe-table'
import { eachTree } from 'xe-utils'
import { useI18n } from '@/hooks/web/useI18n'
import { VxeTableColumn } from '@/types/table'
import { FormSchema } from '@/types/form'
import { ComponentOptions } from '@/types/components'

export type VxeCrudSchema = Omit<VxeTableColumn, 'children'> & {
  field: string
  title?: string
  formatter?: VxeColumnPropTypes.Formatter
  search?: CrudSearchParams
  table?: CrudTableParams
  form?: CrudFormParams
  detail?: CrudDescriptionsParams
  print?: CrudPrintParams
  children?: VxeCrudSchema[]
  dictType?: string
}
type CrudSearchParams = {
  // 是否显示在查询项
  show?: boolean
} & Omit<VxeFormItemProps, 'field'>

type CrudTableParams = {
  // 是否显示表头
  show?: boolean
} & Omit<VxeTableDefines.ColumnOptions, 'field'>

type CrudFormParams = {
  // 是否显示表单项
  show?: boolean
} & Omit<FormSchema, 'field'>

type CrudDescriptionsParams = {
  // 是否显示表单项
  show?: boolean
} & Omit<DescriptionsSchema, 'field'>

type CrudPrintParams = {
  // 是否显示表单项
  show?: boolean
} & Omit<VxeTableDefines.ColumnInfo[], 'field'>

export type VxeAllSchemas = {
  searchSchema: VxeFormItemProps[]
  tableSchema: VxeGridPropTypes.Columns
  formSchema: FormSchema[]
  detailSchema: DescriptionsSchema[]
  printSchema: VxeTableDefines.ColumnInfo[]
}

// 过滤所有结构
export const useVxeCrudSchemas = (
  crudSchema: VxeCrudSchema[]
): {
  allSchemas: VxeAllSchemas
} => {
  // 所有结构数据
  const allSchemas = reactive<VxeAllSchemas>({
    searchSchema: [],
    tableSchema: [],
    formSchema: [],
    detailSchema: [],
    printSchema: []
  })

  const searchSchema = filterSearchSchema(crudSchema)
  allSchemas.searchSchema = searchSchema || []

  const tableSchema = filterTableSchema(crudSchema)
  allSchemas.tableSchema = tableSchema || []

  const formSchema = filterFormSchema(crudSchema)
  allSchemas.formSchema = formSchema

  const detailSchema = filterDescriptionsSchema(crudSchema)
  allSchemas.detailSchema = detailSchema

  const printSchema = filterPrintSchema(crudSchema)
  allSchemas.printSchema = printSchema

  return {
    allSchemas
  }
}

// 过滤 Search 结构
const filterSearchSchema = (crudSchema: VxeCrudSchema[]): VxeFormItemProps[] => {
  const searchSchema: VxeFormItemProps[] = []
  const { t } = useI18n()
  eachTree(crudSchema, (schemaItem: VxeCrudSchema) => {
    // 判断是否显示
    if (schemaItem?.search?.show) {
      let itemRenderName = schemaItem?.search?.itemRender?.name || '$input'
      const options: any[] = []
      let itemRender: FormItemRenderOptions = {
        name: itemRenderName,
        props: { placeholder: t('common.inputText') }
      }
      if (schemaItem.dictType) {
        const allOptions = { label: '全部', value: '' }
        options.push(allOptions)
        getIntDictOptions(schemaItem.dictType).forEach((dict) => {
          options.push(dict)
        })
        itemRender.options = options
        if (!schemaItem.search.itemRender?.name) itemRenderName = '$select'
        itemRender = {
          name: itemRenderName,
          options: options,
          props: { placeholder: t('common.selectText') }
        }
      }
      const searchSchemaItem = {
        // 默认为 input
        span: 8,
        folding: searchSchema.length > 2,
        itemRender: itemRender,
        ...schemaItem.search,
        field: schemaItem.field,
        title: schemaItem.search?.title || schemaItem.title
      }
      // 删除不必要的字段
      delete searchSchemaItem.show

      searchSchema.push(searchSchemaItem)
    }
  })
  // 添加搜索按钮
  const buttons: VxeFormItemProps = {
    span: 24,
    align: 'center',
    collapseNode: searchSchema.length > 3,
    itemRender: {
      name: '$buttons',
      children: [
        { props: { type: 'submit', content: t('common.query'), status: 'primary' } },
        { props: { type: 'reset', content: t('common.reset') } }
      ]
    }
  }
  searchSchema.push(buttons)
  return searchSchema
}

// 过滤 table 结构
const filterTableSchema = (crudSchema: VxeCrudSchema[]): VxeGridPropTypes.Columns => {
  const tableSchema: VxeGridPropTypes.Columns = []
  eachTree(crudSchema, (schemaItem: VxeCrudSchema) => {
    // 判断是否显示
    if (schemaItem?.table?.show !== false) {
      const tableSchemaItem = {
        ...schemaItem.table,
        field: schemaItem.field,
        title: schemaItem.table?.title || schemaItem.title
      }
      if (schemaItem?.formatter) {
        tableSchemaItem.formatter = schemaItem.formatter
      }

      // 删除不必要的字段
      delete tableSchemaItem.show

      tableSchema.push(tableSchemaItem)
    }
  })
  return tableSchema
}

// 过滤 form 结构
const filterFormSchema = (crudSchema: VxeCrudSchema[]): FormSchema[] => {
  const formSchema: FormSchema[] = []

  eachTree(crudSchema, (schemaItem: VxeCrudSchema) => {
    // 判断是否显示
    if (schemaItem?.form?.show !== false) {
      let component = schemaItem?.form?.component || 'Input'
      const options: ComponentOptions[] = []
      let comonentProps = {}
      if (schemaItem.dictType) {
        getIntDictOptions(schemaItem.dictType).forEach((dict) => {
          options.push(dict)
        })
        comonentProps = {
          options: options
        }
        if (!(schemaItem.form && schemaItem.form.component)) component = 'Select'
      }
      const formSchemaItem = {
        // 默认为 input
        component: component,
        componentProps: comonentProps,
        ...schemaItem.form,
        field: schemaItem.field,
        label: schemaItem.form?.label || schemaItem.title
      }

      // 删除不必要的字段
      delete formSchemaItem.show

      formSchema.push(formSchemaItem)
    }
  })

  return formSchema
}

// 过滤 descriptions 结构
const filterDescriptionsSchema = (crudSchema: VxeCrudSchema[]): DescriptionsSchema[] => {
  const descriptionsSchema: DescriptionsSchema[] = []

  eachTree(crudSchema, (schemaItem: VxeCrudSchema) => {
    // 判断是否显示
    if (schemaItem?.detail?.show !== false) {
      const descriptionsSchemaItem = {
        ...schemaItem.detail,
        field: schemaItem.field,
        label: schemaItem.detail?.label || schemaItem.title
      }

      // 删除不必要的字段
      delete descriptionsSchemaItem.show

      descriptionsSchema.push(descriptionsSchemaItem)
    }
  })

  return descriptionsSchema
}

// 过滤 打印 结构
const filterPrintSchema = (crudSchema: VxeCrudSchema[]): any[] => {
  const printSchema: any[] = []

  eachTree(crudSchema, (schemaItem: VxeCrudSchema) => {
    // 判断是否显示
    if (schemaItem?.print?.show !== false) {
      const printSchemaItem = {
        field: schemaItem.field
      }

      printSchema.push(printSchemaItem)
    }
  })

  return printSchema
}
