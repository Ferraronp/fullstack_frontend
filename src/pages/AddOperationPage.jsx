import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function AddOperationPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  const [form, setForm] = useState({
    type: "expense",
    amount: "",
    category_id: 0,
    date: new Date().toISOString().split('T')[0], // текущая дата по умолчанию
    comment: "",
  });

  // Проверка токена и загрузка категорий
  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    
    if (!access_token) {
      navigate("/login");
      return;
    }

    // Загрузка категорий с бэкенда
    const fetchCategories = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/categories", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${access_token}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem("access_token");
            navigate("/login");
            return;
          }
          throw new Error("Ошибка при загрузке категорий");
        }

        const categoriesData = await response.json();
        setCategories(categoriesData);

      } catch (err) {
        console.error("Ошибка загрузки категорий:", err);
        setError("Не удалось загрузить категории");
      }
    };

    fetchCategories();
  }, [navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(""); // Очищаем ошибку при изменении формы
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const access_token = localStorage.getItem("access_token");
    if (!access_token) {
      navigate("/login");
      return;
    }

    // Валидация
    if (!form.amount || parseFloat(form.amount) <= 0) {
      setError("Введите корректную сумму");
      return;
    }

    if (!form.category) {
      setError("Выберите категорию");
      return;
    }

    if (!form.date) {
      setError("Выберите дату");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const operationData = {
        type: form.type,
        amount: form.type === "expense" ? -Math.abs(parseFloat(form.amount)) : Math.abs(parseFloat(form.amount)),
        category_id: form.category,
        date: form.date,
        comment: form.comment || "",
      };

      const response = await fetch("http://127.0.0.1:8000/operations", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(operationData),
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }
        throw new Error("Ошибка при добавлении операции");
      }

      const result = await response.json();
      
      // Успешно добавлено, перенаправляем на главную или список операций
      navigate("/"); // или navigate("/operations")

    } catch (err) {
      setError(err.message);
      console.error("Ошибка при добавлении операции:", err);
    } finally {
      setLoading(false);
    }
  };

  // Функция для выхода
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#D9D9D9] flex flex-col items-center py-6">
      {/* Верхняя панель */}
      <div className="flex justify-between items-center w-[90%] mb-6">
        <div className="text-lg font-medium">Личный финансовый учёт</div>
        <div className="flex gap-4">
          {/* Кнопка "На главную" */}
          <button
            onClick={() => navigate("/")}
            className="bg-[#767676] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
            disabled={loading}
          >
            На главную
          </button>

          {/* Кнопка "Настройки" */}
          <button
            onClick={() => navigate("/settings")}
            className="bg-[#767676] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
            disabled={loading}
          >
            Настройки ⚙️
          </button>

          {/* Кнопка выхода */}
          <button
            onClick={handleLogout}
            className="bg-[#ff4444] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
            disabled={loading}
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Заголовок */}
      <h2 className="text-2xl font-semibold mb-6">Добавить операцию</h2>

      {/* Сообщение об ошибке */}
      {error && (
        <div className="w-[400px] mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-5 bg-[#B1B1B1] px-10 py-8 rounded-xl shadow-[5px_5px_10px_rgba(0,0,0,0.75)] w-[400px]"
      >
        {/* Тип */}
        <div className="flex items-center justify-between">
          <label className="text-lg font-medium">Тип:</label>
          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="bg-[#767676] text-white px-3 py-2 rounded-md shadow-[5px_5px_10px_rgba(0,0,0,0.75)]"
            disabled={loading}
          >
            <option value="income">Доходы</option>
            <option value="expense">Расходы</option>
          </select>
        </div>

        {/* Сумма */}
        <div className="flex items-center justify-between">
          <label className="text-lg font-medium">Сумма:</label>
          <input
            type="number"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            className="bg-[#F0F0F0] px-3 py-2 rounded-md shadow-[5px_5px_4px_rgba(0,0,0,0.75)] w-[200px] outline-none"
            required
            min="0.01"
            step="0.01"
            disabled={loading}
            placeholder="0.00"
          />
        </div>

        {/* Категория */}
        <div className="flex items-center justify-between">
          <label className="text-lg font-medium">Категория:</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="bg-[#767676] text-white px-3 py-2 rounded-md shadow-[5px_5px_10px_rgba(0,0,0,0.75)] w-[200px]"
            required
            disabled={loading || categories.length === 0}
          >
            <option value="">{categories.length === 0 ? "Загрузка..." : "Выберите"}</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Дата */}
        <div className="flex items-center justify-between">
          <label className="text-lg font-medium">Дата:</label>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="bg-[#767676] text-white px-3 py-2 rounded-md shadow-[5px_5px_10px_rgba(0,0,0,0.75)] w-[200px]"
            required
            disabled={loading}
            max={new Date().toISOString().split('T')[0]} // нельзя выбрать будущую дату
          />
        </div>

        {/* Комментарий */}
        <div className="flex flex-col">
          <label className="text-lg font-medium mb-1">Комментарий:</label>
          <input
            type="text"
            name="comment"
            value={form.comment}
            onChange={handleChange}
            className="bg-[#F0F0F0] px-3 py-2 rounded-md shadow-[5px_5px_4px_rgba(0,0,0,0.75)] outline-none"
            disabled={loading}
            placeholder="Необязательно"
          />
        </div>

        {/* Кнопки */}
        <div className="flex justify-between mt-4">
          <button
            type="submit"
            disabled={loading}
            className={`px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90 ${
              loading
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-[#4CAF50] text-white"
            }`}
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>

          {/* Кнопка отмены */}
          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={loading}
            className="bg-[#767676] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90 disabled:opacity-50"
          >
            Отменить
          </button>
        </div>
      </form>
    </div>
  );
}