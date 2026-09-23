'use client';

import React, { useState, useMemo } from 'react';
import { Search, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { exportToCsv } from '../../lib/csv-export';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
}

interface FilterOption {
  key: string;
  label: string;
  options: { label: string; value: string }[];
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  title?: string;
  searchPlaceholder?: string;
  searchKeys?: (keyof T)[];
  filters?: FilterOption[];
  exportFileName?: string;
  pageSize?: number;
  emptyMessage?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  title,
  searchPlaceholder = 'Search records...',
  searchKeys,
  filters = [],
  exportFileName = 'data_export',
  pageSize = 10,
  emptyMessage = 'No records found matching criteria',
}: DataTableProps<T>) {
  const [search, setSearch] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [currentPage, setCurrentPage] = useState(1);

  // Filter & Search with memoization
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // 1. Search filter
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesSearch = searchKeys
          ? searchKeys.some((k) => String(row[k] || '').toLowerCase().includes(query))
          : Object.values(row).some((val) => String(val || '').toLowerCase().includes(query));
        if (!matchesSearch) return false;
      }

      // 2. Faceted filters
      for (const [key, value] of Object.entries(selectedFilters)) {
        if (value && value !== 'ALL') {
          if (String(row[key]) !== value) return false;
        }
      }

      return true;
    });
  }, [data, search, searchKeys, selectedFilters]);

  // Pagination with memoization
  const totalPages = Math.ceil(filteredData.length / pageSize) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleExport = () => {
    const headers = columns.map((c) => ({ key: c.key as keyof T, label: c.header }));
    exportToCsv(exportFileName, filteredData, headers);
  };

  return (
    <div className="bg-white rounded-2xl border border-line shadow-xs overflow-hidden">
      {/* Header with Title, Search, Filters, CSV Export */}
      <div className="p-4 border-b border-line flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-ground/50">
        <div className="flex items-center gap-2">
          {title && <h3 className="font-display font-bold text-navy text-base me-2">{title}</h3>}
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-2.5 rtl:right-3 rtl:left-auto h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={searchPlaceholder}
              className="w-full ps-9 pe-3 py-1.5 text-xs bg-white border border-line rounded-xl focus:outline-none focus:ring-1 focus:ring-signal-orange"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {filters.map((f) => (
            <select
              key={f.key}
              value={selectedFilters[f.key] || 'ALL'}
              onChange={(e) => {
                setSelectedFilters((prev) => ({ ...prev, [f.key]: e.target.value }));
                setCurrentPage(1);
              }}
              className="text-xs font-medium bg-white border border-line rounded-xl px-2.5 py-1.5 text-slate-700 focus:outline-none focus:ring-1 focus:ring-signal-orange"
            >
              <option value="ALL">All {f.label}</option>
              {f.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ))}

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-white hover:bg-slate-50 border border-line text-navy rounded-xl shadow-xs transition"
            title="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5 text-signal-orange" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-start text-xs text-slate-600">
          <thead className="bg-ground/80 text-[11px] font-bold text-slate-700 uppercase tracking-wider border-b border-line">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="px-4 py-3 text-start">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-slate-50/75 transition">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-3">
                      {col.render ? col.render(row) : String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-slate-400">
                  {emptyMessage}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3 border-t border-line bg-ground/50 flex items-center justify-between text-xs text-slate-500">
        <div>
          Showing {filteredData.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to{' '}
          {Math.min(currentPage * pageSize, filteredData.length)} of {filteredData.length} records
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-line bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium text-navy">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-line bg-white hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
