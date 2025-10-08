import { type ReactNode } from 'react'
import clsx from 'clsx'

export interface TableColumn<T> {
  key: string
  header: string
  align?: 'left' | 'right' | 'center'
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  data: T[]
  columns: Array<TableColumn<T>>
  emptyMessage?: string
  dense?: boolean
}

export function DataTable<T>({
  data,
  columns,
  emptyMessage = 'Nenhum registro encontrado',
  dense,
}: DataTableProps<T>) {
  if (!data.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full table-fixed text-left text-sm text-slate-700 dark:text-slate-300">
        <thead className="bg-slate-100 text-xs uppercase text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={clsx('px-4 py-3 font-semibold', {
                  'text-right': column.align === 'right',
                  'text-center': column.align === 'center',
                })}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={clsx('border-b border-slate-100 dark:border-slate-800', {
                'hover:bg-slate-50 dark:hover:bg-slate-800/70': !dense,
              })}
            >
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={clsx('px-4 break-words', dense ? 'py-2' : 'py-3', {
                    'text-right': column.align === 'right',
                    'text-center': column.align === 'center',
                  })}
                >
                  <div className="whitespace-pre-line break-words">
                    {column.render(row)}
                  </div>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
