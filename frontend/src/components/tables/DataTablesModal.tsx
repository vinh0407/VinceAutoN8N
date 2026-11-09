import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Table as TableIcon,
  X,
  Plus,
  Trash2,
  Database,
  Search,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';
import { IDataTable, IDataTableRow } from '../../types';

interface DataTablesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DataTablesModal: React.FC<DataTablesModalProps> = ({ isOpen, onClose }) => {
  const [tables, setTables] = useState<IDataTable[]>([]);
  const [selectedTableId, setSelectedTableId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableDesc, setNewTableDesc] = useState('');
  const [newColumnsStr, setNewColumnsStr] = useState('id, name, status, createdAt');
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRowData, setNewRowData] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [msg, setMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const fetchTables = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get('/api/tables');
      if (res.data?.success) {
        const fetched = res.data.tables || [];
        setTables(fetched);
        if (fetched.length > 0 && !selectedTableId) {
          setSelectedTableId(fetched[0].id);
        }
      }
    } catch (err) {
      console.error('Lỗi khi tải bảng dữ liệu:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchTables();
      setMsg(null);
    }
  }, [isOpen]);

  const activeTable = tables.find((t) => t.id === selectedTableId) || tables[0] || null;

  const handleCreateTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName.trim()) return;

    setIsSubmitting(true);
    try {
      const columns = newColumnsStr
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
        .map((colName) => ({
          key: colName.toLowerCase().replace(/\s+/g, '_'),
          name: colName,
          type: 'string' as const,
        }));

      const res = await axios.post('/api/tables', {
        name: newTableName.trim(),
        description: newTableDesc.trim(),
        columns,
      });

      if (res.data?.success) {
        setMsg({ text: 'Đã tạo bảng dữ liệu mới thành công!', type: 'success' });
        setNewTableName('');
        setNewTableDesc('');
        setShowCreateTable(false);
        await fetchTables();
        if (res.data.table?.id) {
          setSelectedTableId(res.data.table.id);
        }
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err: any) {
      setMsg({ text: 'Lỗi khi tạo bảng.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTable = async (tableId: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bảng dữ liệu này cùng toàn bộ bản ghi?')) return;
    try {
      const res = await axios.delete(`/api/tables/${tableId}`);
      if (res.data?.success) {
        setMsg({ text: 'Đã xóa bảng thành công.', type: 'success' });
        await fetchTables();
        if (selectedTableId === tableId) {
          setSelectedTableId(null);
        }
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      setMsg({ text: 'Lỗi khi xóa bảng.', type: 'error' });
    }
  };

  const handleAddRow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTable) return;

    setIsSubmitting(true);
    try {
      const res = await axios.post(`/api/tables/${activeTable.id}/rows`, {
        data: newRowData,
      });
      if (res.data?.success) {
        setMsg({ text: 'Đã thêm bản ghi mới thành công!', type: 'success' });
        setNewRowData({});
        setShowAddRow(false);
        await fetchTables();
        setTimeout(() => setMsg(null), 3000);
      }
    } catch (err) {
      setMsg({ text: 'Lỗi khi thêm dòng dữ liệu.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRow = async (rowId: string) => {
    if (!activeTable) return;
    try {
      const res = await axios.delete(`/api/tables/${activeTable.id}/rows/${rowId}`);
      if (res.data?.success) {
        await fetchTables();
      }
    } catch (err) {
      setMsg({ text: 'Lỗi khi xóa dòng.', type: 'error' });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 select-none">
      <div className="w-full max-w-5xl bg-[#18181b] border border-[#2e2e33] rounded-2xl shadow-2xl flex flex-col h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[#28282c] bg-[#141416] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-[#242428] border border-[#36363c] flex items-center justify-center text-[#e6e8ec]">
              <Database className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-[#e6e8ec]">Bảng Dữ Liệu Nội Bộ (Data Tables)</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#26262a] text-zinc-300 border border-[#3a3a40]">
                  {tables.length} bảng
                </span>
              </div>
              <p className="text-[11px] text-zinc-400">
                Lưu trữ dữ liệu dạng bảng tương đương Airtable / Baserow bên trong VinceAuto không cần cài đặt SQL
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-[#252528] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Notices */}
        {msg && (
          <div
            className={`mx-5 my-2 px-3.5 py-1.5 rounded-lg text-xs flex items-center space-x-2 shrink-0 ${
              msg.type === 'success'
                ? 'bg-emerald-950/40 border border-emerald-500/40 text-emerald-300'
                : 'bg-amber-950/40 border border-amber-500/40 text-amber-300'
            }`}
          >
            {msg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Body Split View */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Left: Tables List */}
          <div className="w-64 border-r border-[#28282c] bg-[#141416] flex flex-col shrink-0">
            <div className="p-3 border-b border-[#28282c] flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-300">Danh Sách Bảng</span>
              <button
                onClick={() => setShowCreateTable(true)}
                className="p-1 rounded-lg bg-[#242428] hover:bg-[#2f2f35] border border-[#36363c] text-zinc-300 hover:text-white transition-all cursor-pointer"
                title="Tạo bảng mới"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {tables.map((t) => {
                const isSelected = activeTable?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTableId(t.id);
                      setShowAddRow(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#27272b] text-[#e6e8ec] font-semibold border border-[#3e3e44] shadow-sm'
                        : 'text-zinc-400 hover:bg-[#1e1e21] hover:text-zinc-200'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <TableIcon className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
                      <span className="truncate text-xs">{t.name}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono shrink-0 ml-1">
                      {t.rows?.length || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main Area: Active Table View */}
          <div className="flex-1 flex flex-col bg-[#18181b] overflow-hidden">
            {showCreateTable ? (
              <form onSubmit={handleCreateTable} className="p-6 max-w-lg space-y-4">
                <h4 className="text-sm font-bold text-[#e6e8ec]">Tạo Bảng Dữ Liệu Mới</h4>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-300 font-semibold">Tên Bảng:</label>
                  <input
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Ví dụ: leads_crm, doi_soat_don, blacklisted_emails..."
                    className="w-full bg-[#121214] border border-[#303036] focus:border-zinc-400 px-3 py-2 rounded-lg text-xs text-zinc-200 outline-none"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-300 font-semibold">Mô Tả:</label>
                  <input
                    type="text"
                    value={newTableDesc}
                    onChange={(e) => setNewTableDesc(e.target.value)}
                    placeholder="Mô tả mục đích sử dụng bảng..."
                    className="w-full bg-[#121214] border border-[#303036] focus:border-zinc-400 px-3 py-2 rounded-lg text-xs text-zinc-200 outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-300 font-semibold">
                    Các Cột (phân tách bằng dấu phẩy):
                  </label>
                  <input
                    type="text"
                    value={newColumnsStr}
                    onChange={(e) => setNewColumnsStr(e.target.value)}
                    placeholder="id, name, phone, order_code, status"
                    className="w-full bg-[#121214] border border-[#303036] focus:border-zinc-400 px-3 py-2 rounded-lg text-xs text-zinc-200 font-mono outline-none"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-lg bg-zinc-200 hover:bg-white text-zinc-900 font-bold text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Tạo Bảng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateTable(false)}
                    className="px-4 py-2 rounded-lg bg-[#27272b] text-zinc-300 hover:text-white text-xs cursor-pointer"
                  >
                    Hủy
                  </button>
                </div>
              </form>
            ) : activeTable ? (
              <div className="flex-1 flex flex-col overflow-hidden">
                {/* Table Control Bar */}
                <div className="px-5 py-3 border-b border-[#28282c] bg-[#161619] flex items-center justify-between shrink-0">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-bold text-[#e6e8ec]">{activeTable.name}</span>
                    <span className="text-xs text-zinc-400">{activeTable.description}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowAddRow(!showAddRow)}
                      className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-[#27272b] hover:bg-[#323237] border border-[#3c3c43] text-xs font-semibold text-[#e6e8ec] transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Thêm Bản Ghi</span>
                    </button>
                    <button
                      onClick={() => handleDeleteTable(activeTable.id)}
                      className="p-1.5 rounded-lg bg-[#252528] hover:bg-[#323236] border border-[#38383e] text-zinc-400 hover:text-white transition-colors cursor-pointer"
                      title="Xóa bảng này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Add Row Inline Form */}
                {showAddRow && (
                  <form
                    onSubmit={handleAddRow}
                    className="p-4 bg-[#1e1e22] border-b border-[#2e2e34] space-y-3 shrink-0 animate-in fade-in duration-150"
                  >
                    <div className="text-xs font-bold text-zinc-300">Thêm bản ghi mới vào {activeTable.name}:</div>
                    <div className="grid grid-cols-3 gap-3">
                      {activeTable.columns.map((col) => (
                        <div key={col.key} className="space-y-1">
                          <label className="text-[10.5px] font-mono text-zinc-400">{col.name}:</label>
                          <input
                            type="text"
                            value={newRowData[col.key] || ''}
                            onChange={(e) =>
                              setNewRowData({ ...newRowData, [col.key]: e.target.value })
                            }
                            placeholder={col.name}
                            className="w-full bg-[#121214] border border-[#34343a] focus:border-zinc-400 px-2.5 py-1.5 rounded-md text-xs text-zinc-200 outline-none font-mono"
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center space-x-2 pt-1">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-3 py-1.5 rounded-md bg-zinc-200 hover:bg-white text-zinc-900 font-bold text-xs flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
                      >
                        {isSubmitting && <Loader2 className="w-3 h-3 animate-spin" />}
                        <span>Lưu Dòng Này</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowAddRow(false)}
                        className="px-3 py-1.5 rounded-md bg-[#28282d] text-zinc-400 hover:text-zinc-200 text-xs cursor-pointer"
                      >
                        Đóng
                      </button>
                    </div>
                  </form>
                )}

                {/* Grid Table */}
                <div className="flex-1 overflow-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-[#28282c] bg-[#141416] text-zinc-400 sticky top-0 z-10">
                        <th className="p-3 font-semibold text-[11px] uppercase tracking-wider w-12">#</th>
                        {activeTable.columns.map((col) => (
                          <th key={col.key} className="p-3 font-semibold text-[11px] uppercase tracking-wider">
                            {col.name}
                          </th>
                        ))}
                        <th className="p-3 font-semibold text-[11px] uppercase tracking-wider w-16 text-right">
                          Xóa
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#242428] text-zinc-300">
                      {(activeTable.rows || []).length === 0 ? (
                        <tr>
                          <td
                            colSpan={activeTable.columns.length + 2}
                            className="text-center py-12 text-zinc-500"
                          >
                            Chưa có dữ liệu nào trong bảng này. Bấm "Thêm Bản Ghi" để bắt đầu lưu.
                          </td>
                        </tr>
                      ) : (
                        (activeTable.rows || []).map((row, idx) => (
                          <tr key={row.id} className="hover:bg-[#1d1d21] transition-colors">
                            <td className="p-3 text-zinc-500 font-mono text-[11px]">{idx + 1}</td>
                            {activeTable.columns.map((col) => (
                              <td key={col.key} className="p-3 font-mono text-[11.5px]">
                                {typeof (row[col.key] ?? (row as any).data?.[col.key]) === 'object'
                                  ? JSON.stringify(row[col.key] ?? (row as any).data?.[col.key])
                                  : String(row[col.key] ?? (row as any).data?.[col.key] ?? '')}
                              </td>
                            ))}
                            <td className="p-3 text-right">
                              <button
                                onClick={() => handleDeleteRow(row.id)}
                                className="p-1 rounded text-zinc-500 hover:text-white hover:bg-[#28282d] transition-colors cursor-pointer"
                                title="Xóa dòng"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 space-y-2">
                <Database className="w-10 h-10 stroke-[1.5] text-zinc-600" />
                <p className="text-xs">Chưa có bảng dữ liệu nào được chọn.</p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#28282c] bg-[#141416] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-zinc-500">
            Các node trong VinceAuto có thể đọc/ghi trực tiếp vào Data Tables thông qua các operation Append, Read, Delete.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#27272b] hover:bg-[#303035] text-xs font-semibold text-zinc-300 hover:text-white transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
