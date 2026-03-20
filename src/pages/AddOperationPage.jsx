import SEOMeta from "../components/SEOMeta";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function AddOperationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
    comment: "",
  });

  useEffect(() => {
    API.get("/categories/")
      .then(r => setCategories(r.data))
      .catch(() => setError("Не удалось загрузить категории"));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) { setError("Введите корректную сумму"); return; }

    if (!form.date) { setError("Выберите дату"); return; }

    setLoading(true);
    setError("");
    try {
      await API.post("/operations/", {
        amount: form.type === "expense" ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount)),
        category_id: form.category ? parseInt(form.category) : null,
        date: form.date,
        comment: form.comment || "",
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Ошибка при добавлении операции");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
        <SEOMeta title="Добавить операцию" description="Добавление новой финансовой операции" path="/add-operation" noindex={true} />
      <div className="min-h-screen bg-[#D9D9D9] flex flex-col items-center py-6">
      <div className="flex justify-between items-center w-[90%] mb-6">
        <div className="text-lg font-medium">Личный финансовый учёт</div>
        <button onClick={() => navigate("/")} className="bg-[#767676] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90">На главную</button>
      </div>

      <h2 className="text-2xl font-semibold mb-6">Добавить операцию</h2>

      {error && (
        <div className="w-[400px] mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-[#B1B1B1] px-10 py-8 rounded-xl shadow-[5px_5px_10px_rgba(0,0,0,0.75)] w-[400px]">
        <div className="flex items-center justify-between">
          <label className="text-lg font-medium">Тип:</label>
          <select name="type" value={form.type} onChange={handleChange} disabled={loading}
            className="bg-[#767676] text-white px-3 py-2 rounded-md shadow-[5px_5px_10px_rgba(0,0,0,0.75)]">
            <option value="income">Доход</option>
            <option value="expense">Расход</option>
          </select>
        </div>

        <div className="flex items-center justify-between">
          <label className="text-lg font-medium">Сумма:</label>
          <input type="number" name="amount" value={form.amount} onChange={handleChange} required min="0.01" step="0.01"
            disabled={loading} placeholder="0.00"
            className="bg-[#F0F0F0] px-3 py-2 rounded-md shadow-[5px_5px_4px_rgba(0,0,0,0.75)] w-[200px] outline-none" />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-lg font-medium">Категория:</label>
          <select name="category" value={form.category} onChange={handleChange}
            disabled={loading}
            className="bg-[#767676] text-white px-3 py-2 rounded-md shadow-[5px_5px_10px_rgba(0,0,0,0.75)] w-[200px]">
            <option value="">Без категории</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        {categories.length === 0 && (
          <p className="text-sm text-center">
            Нет категорий —{" "}
            <span className="underline cursor-pointer text-blue-800" onClick={() => navigate("/add-category")}>
              создать
            </span>
          </p>
        )}

        <div className="flex items-center justify-between">
          <label className="text-lg font-medium">Дата:</label>
          <input type="date" name="date" value={form.date} onChange={handleChange} required
            disabled={loading} max={new Date().toISOString().split("T")[0]}
            className="bg-[#767676] text-white px-3 py-2 rounded-md shadow-[5px_5px_10px_rgba(0,0,0,0.75)] w-[200px]" />
        </div>

        <div className="flex flex-col">
          <label className="text-lg font-medium mb-1">Комментарий:</label>
          <input type="text" name="comment" value={form.comment} onChange={handleChange}
            disabled={loading} placeholder="Необязательно"
            className="bg-[#F0F0F0] px-3 py-2 rounded-md shadow-[5px_5px_4px_rgba(0,0,0,0.75)] outline-none" />
        </div>

        <div className="flex justify-between mt-4">
          <button type="submit" disabled={loading}
            className={`px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90 ${loading ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-[#4CAF50] text-white"}`}>
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
          <button type="button" onClick={() => navigate(-1)} disabled={loading}
            className="bg-[#767676] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90 disabled:opacity-50">
            Отменить
          </button>
        </div>
      </form>
    </div>
  </>
  );
}
