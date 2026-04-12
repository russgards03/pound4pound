import React, { useState, useEffect, useMemo } from "react";
import search from '@/assets/search.svg';

export default function DataTable({
  data,
  columns,
  itemsPerPage = 10,
  onRowClick,
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    setCurrentPage(1);
  }, [data, searchTerm]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return data;
    return data.filter((row) =>
      columns
        .filter((col) => col.searchable !== false)
        .some((col) => {
          const value = row[col.key];
          if (!value) return false;
          return value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
    );
  }, [data, searchTerm, columns]);

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    const sorted = [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      if (aValue == null) return -1;
      if (bValue == null) return 1;
      if (typeof aValue === "string") {
        return sortConfig.direction === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    });
    return sorted;
  }, [filteredData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentData = sortedData.slice(startIndex, startIndex + itemsPerPage);

  // Separate action column from data columns for cards
  const actionCol = columns.find((col) => col.sortable === false && col.render);
  const dataColumns = columns.filter((col) => col !== actionCol);

  return (
    <div className="w-full">
      {/* Search Bar */}
      <div className="mb-4 relative w-full sm:w-72">
        <img
          src={search}
          alt="Search"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
        />
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full border rounded-lg pl-10 pr-10 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-700"
          >
            ✕
          </button>
        )}
      </div>

      {/* ── DESKTOP TABLE ── */}
      <div className="hidden lg:block">
        <table className="min-w-full font-verdana bg-white rounded-2xl shadow-lg overflow-hidden">
          <thead className="bg-[#E6E9F5] text-[#0B0F3B]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => {
                    if (col.sortable === false) return;
                    setSortConfig((prev) => {
                      if (prev?.key === col.key) {
                        return { key: col.key, direction: prev.direction === "asc" ? "desc" : "asc" };
                      }
                      return { key: col.key, direction: "asc" };
                    });
                  }}
                  className={`px-6 py-3 font-verdana text-left text-sm font-semibold uppercase tracking-wider select-none ${
                    col.sortable === false ? "cursor-default text-gray-400" : "cursor-pointer"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {col.label}
                    {col.sortable !== false && (
                      <span className="flex flex-col text-xs leading-none">
                        <span className={sortConfig?.key === col.key && sortConfig.direction === "asc" ? "text-black" : "text-gray-400"}>▲</span>
                        <span className={sortConfig?.key === col.key && sortConfig.direction === "desc" ? "text-black" : "text-gray-400"}>▼</span>
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {currentData.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-6 text-gray-400">
                  No results found.
                </td>
              </tr>
            )}
            {currentData.map((row, idx) => (
              <tr
                key={row.id || idx}
                onClick={() => onRowClick && onRowClick(row)}
                className={`border-b ${onRowClick ? "cursor-pointer hover:bg-gray-100 transition" : ""}`}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-6 py-3 text-sm text-gray-600">
                    {col.type === "badge" ? (
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${col.badgeColors?.[String(row[col.key]).toLowerCase()] || "bg-gray-100 text-gray-700"}`}>
                        {row[col.key]}
                      </span>
                    ) : col.render ? (
                      col.render(row)
                    ) : typeof row[col.key] === "string" && row[col.key].length > 60 ? (
                      row[col.key].slice(0, 60) + "..."
                    ) : (
                      row[col.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── MOBILE CARDS ── */}
      <div className="lg:hidden flex flex-col gap-3">
        {currentData.length === 0 && (
          <p className="text-center py-6 text-gray-400">No results found.</p>
        )}
        {currentData.map((row, idx) => (
          <div
            key={row.id || idx}
            onClick={() => onRowClick && onRowClick(row)}
            className={`bg-white rounded-2xl shadow-sm border border-gray-200 p-4 ${onRowClick ? "cursor-pointer active:bg-gray-50" : ""}`}
          >
            {/* First data column as the card title */}
            <div className="flex justify-between items-start mb-3">
              <span className="font-semibold text-[#0B0F3B] text-base">
                {dataColumns[0]?.render
                  ? dataColumns[0].render(row)
                  : row[dataColumns[0]?.key]}
              </span>
              {/* Action column buttons go top-right */}
              {actionCol && (
                <div onClick={(e) => e.stopPropagation()}>
                  {actionCol.render(row)}
                </div>
              )}
            </div>

            {/* Remaining data columns as label: value rows */}
            <div className="flex flex-col gap-1">
              {dataColumns.slice(1).map((col) => {
                const value = col.render ? col.render(row) : row[col.key];
                if (value == null || value === "") return null;
                return (
                  <div key={col.key} className="flex justify-between items-center text-sm">
                    <span className="text-gray-400 uppercase tracking-wide text-xs font-semibold">
                      {col.label}
                    </span>
                    <span className="text-gray-700 text-right max-w-[60%]">
                      {col.type === "badge" ? (
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${col.badgeColors?.[String(row[col.key]).toLowerCase()] || "bg-gray-100 text-gray-700"}`}>
                          {row[col.key]}
                        </span>
                      ) : typeof value === "string" && value.length > 50 ? (
                        value.slice(0, 50) + "..."
                      ) : (
                        value
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-end mt-4 space-x-2">
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => prev - 1)}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span className="px-2 py-1">Page {currentPage} of {totalPages || 1}</span>
        <button
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          onClick={() => setCurrentPage((prev) => prev + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
        </button>
      </div>
    </div>
  );
}