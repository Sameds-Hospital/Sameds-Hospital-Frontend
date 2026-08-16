import { useState } from 'react'
import { ChevronUp, ChevronDown, Search } from 'lucide-react'
import { Badge, statusVariant } from './Badge'

export interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
  sortable?: boolean
  badge?: boolean
  width?: string
}

interface DataTableProps<T extends { id: string }> {
  columns: Column<T>[]
  data: T[]
  onRowClick?: (row: T) => void
  searchable?: boolean
  searchKeys?: (keyof T)[]
  emptyMessage?: string
  maxRows?: number
}

export function DataTable<T extends { id: string }>({
  columns, data, onRowClick, searchable, searchKeys, emptyMessage = 'No records found.', maxRows,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const filtered = query && searchKeys
    ? data.filter(row =>
        searchKeys.some(k => String(row[k] ?? '').toLowerCase().includes(query.toLowerCase()))
      )
    : data

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = String((a as Record<string, unknown>)[sortKey] ?? '')
        const bv = String((b as Record<string, unknown>)[sortKey] ?? '')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
    : filtered

  const rows = maxRows ? sorted.slice(0, maxRows) : sorted

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  return (
    <div className="data-table-wrapper">
      {searchable && (
        <div className="data-table__search">
          <Search size={15} />
          <input
            type="search"
            placeholder="Search..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            aria-label="Search table"
          />
        </div>
      )}
      <div className="data-table-scroll">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  style={col.width ? { width: col.width } : undefined}
                  onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
                  className={col.sortable ? 'data-table__th--sortable' : ''}
                >
                  <span>{col.label}</span>
                  {col.sortable && (
                    <span className="sort-icon">
                      {sortKey === col.key ? (
                        sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />
                      ) : (
                        <ChevronUp size={13} style={{ opacity: 0.3 }} />
                      )}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="data-table__empty">{emptyMessage}</td>
              </tr>
            ) : rows.map(row => (
              <tr
                key={row.id}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={onRowClick ? 'data-table__row--clickable' : ''}
              >
                {columns.map(col => {
                  const val = col.render
                    ? col.render(row)
                    : String((row as Record<string, unknown>)[String(col.key)] ?? '')
                  return (
                    <td key={String(col.key)}>
                      {col.badge && typeof val === 'string'
                        ? <Badge variant={statusVariant(val)}>{val}</Badge>
                        : val}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {maxRows && filtered.length > maxRows && (
        <p className="data-table__more">Showing {maxRows} of {filtered.length} records</p>
      )}
    </div>
  )
}
