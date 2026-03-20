import SEOMeta from "../components/SEOMeta";
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../api/api";

export default function OperationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const getParam = (key, fallback = "") => searchParams.get(key) || fallback;

  const [filters, setFilters] = useState({
    start_date: getParam("start_date"),
    end_date: getParam("end_date"),
    category_id: getParam("category_id"),
    comment: getParam("comment"),
    min_amount: getParam("min_amount"),
    max_amount: getParam("max_amount"),
    sort_by: getParam("sort_by", "date"),
    sort_order: getParam("sort_order", "desc"),
  });
  const [page, setPage] = useState(Number(getParam("page", "1")));

  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Файлы
  const [expandedOp, setExpandedOp] = useState(null);
  const [uploadingFor, setUploadingFor] = useState(null);

  const fetchOperations = useCallback(async (f, p) => {
    setLoading(true);
    setError("");
    try {
      const params = new URLSearchParams();
      if (f.start_date) params.set("start_date", f.start_date);
      if (f.end_date) params.set("end_date", f.end_date);
      if (f.category_id) params.set("category_id", f.category_id);
      if (f.comment) params.set("comment", f.comment);
      if (f.min_amount) params.set("min_amount", f.min_amount);
      if (f.max_amount) params.set("max_amount", f.max_amount);
      params.set("sort_by", f.sort_by);
      params.set("sort_order", f.sort_order);
      params.set("page", p);
      params.set("page_size", "20");

      // Сохраняем фильтры в URL
      setSearchParams(params);

      const res = await API.get(`/operations/?${params}`);
      setData(res.data);
    } catch {
      setError("Ошибка загрузки операций");
    } finally {
      setLoading(false);
    }
  }, [setSearchParams]);

  useEffect(() => {
    API.get("/categories/").then(r => setCategories(r.data)).catch(() => {});
    fetchOperations(filters, page);
  }, []);

  const applyFilters = () => {
    setPage(1);
    fetchOperations(filters, 1);
  };

  const resetFilters = () => {
    const empty = { start_date: "", end_date: "", category_id: "", comment: "", min_amount: "", max_amount: "", sort_by: "date", sort_order: "desc" };
    setFilters(empty);
    setPage(1);
    fetchOperations(empty, 1);
  };

  const handleSort = (field) => {
    const newOrder = filters.sort_by === field && filters.sort_order === "asc" ? "desc" : "asc";
    const newFilters = { ...filters, sort_by: field, sort_order: newOrder };
    setFilters(newFilters);
    fetchOperations(newFilters, page);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить операцию?")) return;
    try {
      await API.delete(`/operations/${id}`);
      fetchOperations(filters, page);
    } catch {
      setError("Ошибка удаления");
    }
  };

  // --- файлы ---
  const handleUpload = async (operationId, e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingFor(operationId);
    try {
      const form = new FormData();
      form.append("file", file);
      await API.post(`/operations/${operationId}/files`, form);
      fetchOperations(filters, page);
      setExpandedOp(operationId);
    } catch (err) {
      setError(err.response?.data?.detail || "Ошибка загрузки файла");
    } finally {
      setUploadingFor(null);
    }
  };

  const handleDownload = async (operationId, fileId, filename) => {
    try {
      const res = await API.get(`/operations/${operationId}/files/${fileId}/url`);
      const a = document.createElement("a");
      a.href = res.data.url;
      a.download = filename;
      a.target = "_blank";
      a.click();
    } catch {
      setError("Ошибка получения ссылки");
    }
  };

  const handleDeleteFile = async (operationId, fileId) => {
    if (!window.confirm("Удалить файл?")) return;
    try {
      await API.delete(`/operations/${operationId}/files/${fileId}`);
      fetchOperations(filters, page);
    } catch {
      setError("Ошибка удаления файла");
    }
  };

  const SortArrow = ({ field }) => {
    if (filters.sort_by !== field) return <span className="opacity-30"> ↕</span>;
    return <span>{filters.sort_order === "asc" ? " ↑" : " ↓"}</span>;
  };

  const formatDate = (d) => new Date(d).toLocaleDateString("ru-RU");

  return (
    <SEOMeta title="Операции" description="Управление финансовыми операциями" path="/operations" noindex={true} />
      <div className="min-h-screen bg-[#D9D9D9] flex flex-col items-center py-6">
      <div className="flex justify-between items-center w-[90%] mb-6">
        <div className="text-lg font-medium">Личный финансовый учёт</div>
        <div className="flex gap-4">
          <button onClick={() => navigate("/")} className="bg-[#767676] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90">На главную</button>
        </div>
      </div>

      {error && (
        <div className="w-[90%] mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error} <button onClick={() => setError("")} className="ml-4 font-bold">×</button>
        </div>
      )}

      {/* Фильтры */}
      <div className="w-[90%] bg-[#B1B1B1] rounded-lg shadow p-4 mb-4">
        <div className="flex flex-wrap gap-3 items-end">
          <label className="flex flex-col text-sm">
            С даты
            <input type="date" value={filters.start_date} onChange={e => setFilters({...filters, start_date: e.target.value})}
              className="bg-[#F0F0F0] px-2 py-1 rounded" />
          </label>
          <label className="flex flex-col text-sm">
            По дату
            <input type="date" value={filters.end_date} onChange={e => setFilters({...filters, end_date: e.target.value})}
              className="bg-[#F0F0F0] px-2 py-1 rounded" />
          </label>
          <label className="flex flex-col text-sm">
            Категория
            <select value={filters.category_id} onChange={e => setFilters({...filters, category_id: e.target.value})}
              className="bg-[#F0F0F0] px-2 py-1 rounded">
              <option value="">Все</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col text-sm">
            Комментарий
            <input type="text" value={filters.comment} onChange={e => setFilters({...filters, comment: e.target.value})}
              placeholder="Поиск..." className="bg-[#F0F0F0] px-2 py-1 rounded" />
          </label>
          <label className="flex flex-col text-sm">
            Сумма от
            <input type="number" value={filters.min_amount} onChange={e => setFilters({...filters, min_amount: e.target.value})}
              className="bg-[#F0F0F0] px-2 py-1 rounded w-24" />
          </label>
          <label className="flex flex-col text-sm">
            Сумма до
            <input type="number" value={filters.max_amount} onChange={e => setFilters({...filters, max_amount: e.target.value})}
              className="bg-[#F0F0F0] px-2 py-1 rounded w-24" />
          </label>
          <button onClick={applyFilters} className="bg-[#4CAF50] text-white px-4 py-2 rounded font-semibold hover:opacity-90">Применить</button>
          <button onClick={resetFilters} className="bg-[#767676] text-white px-4 py-2 rounded font-semibold hover:opacity-90">Сбросить</button>
          <button onClick={() => navigate("/add-category")} className="bg-[#FF9800] text-white px-4 py-2 rounded font-semibold hover:opacity-90">+ Категория</button>
          <button onClick={() => navigate("/add-operation")} className="bg-[#2196F3] text-white px-4 py-2 rounded font-semibold hover:opacity-90">+ Операция</button>
        </div>
      </div>

      {/* Таблица */}
      <div className="w-[90%] bg-[#B1B1B1] rounded-lg shadow p-4">
        {loading ? (
          <p className="text-center py-8">Загрузка...</p>
        ) : data.items.length === 0 ? (
          <p className="text-center py-8">Нет операций</p>
        ) : (
          <>
            <table className="w-full text-center border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="py-2 cursor-pointer" onClick={() => handleSort("date")}>Дата<SortArrow field="date" /></th>
                  <th>Категория</th>
                  <th className="cursor-pointer" onClick={() => handleSort("amount")}>Сумма<SortArrow field="amount" /></th>
                  <th>Комментарий</th>
                  <th>Файлы</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map(op => (
                  <>
                    <tr key={op.id} className="border-t border-black">
                      <td className="py-2">{formatDate(op.date)}</td>
                      <td style={{ color: op.category?.color || "#767676" }}>{op.category?.name || "—"}</td>
                      <td className={op.amount < 0 ? "text-red-600 font-bold" : "text-green-700 font-bold"}>
                        {op.amount > 0 ? `+${op.amount}` : op.amount} ₽
                      </td>
                      <td>{op.comment || "—"}</td>
                      <td>
                        <button onClick={() => setExpandedOp(expandedOp === op.id ? null : op.id)}
                          className="text-blue-700 underline text-sm">
                          {op.files?.length || 0} файл(ов)
                        </button>
                      </td>
                      <td>
                        <div className="flex justify-center gap-2">
                          <button onClick={() => navigate(`/edit-operation/${op.id}`)}
                            className="bg-[#2196F3] text-white px-3 py-1 rounded text-sm hover:opacity-90">Ред.</button>
                          <button onClick={() => handleDelete(op.id)}
                            className="bg-[#ff4444] text-white px-3 py-1 rounded text-sm hover:opacity-90">Уд.</button>
                        </div>
                      </td>
                    </tr>
                    {expandedOp === op.id && (
                      <tr key={`files-${op.id}`} className="bg-[#D0D0D0]">
                        <td colSpan={6} className="px-4 py-2 text-left">
                          <div className="flex flex-col gap-1">
                            {op.files?.map(f => (
                              <div key={f.id} className="flex items-center gap-3 text-sm">
                                <span>{f.filename}</span>
                                <button onClick={() => handleDownload(op.id, f.id, f.filename)}
                                  className="text-blue-700 underline">Скачать</button>
                                <button onClick={() => handleDeleteFile(op.id, f.id)}
                                  className="text-red-600 underline">Удалить</button>
                              </div>
                            ))}
                            <label className="mt-1 cursor-pointer text-sm text-blue-800 underline">
                              {uploadingFor === op.id ? "Загрузка..." : "Прикрепить файл"}
                              <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.webp,.pdf,.txt"
                                onChange={e => handleUpload(op.id, e)} disabled={uploadingFor === op.id} />
                            </label>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))}
              </tbody>
            </table>

            {/* Пагинация */}
            <div className="flex justify-center items-center gap-3 mt-4">
              <button onClick={() => { setPage(page - 1); fetchOperations(filters, page - 1); }}
                disabled={page <= 1}
                className="bg-[#767676] text-white px-3 py-1 rounded disabled:opacity-40">←</button>
              <span>Стр. {page} из {data.pages} (всего {data.total})</span>
              <button onClick={() => { setPage(page + 1); fetchOperations(filters, page + 1); }}
                disabled={page >= data.pages}
                className="bg-[#767676] text-white px-3 py-1 rounded disabled:opacity-40">→</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
