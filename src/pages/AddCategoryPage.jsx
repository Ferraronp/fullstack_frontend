import SEOMeta from "../components/SEOMeta";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function AddCategoryPage() {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#FF6666");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Введите название категории");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await API.post("/categories/", { name: name.trim(), color });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.detail || "Ошибка при сохранении категории");
    } finally {
      setLoading(false);
    }
  };

  // Функция отмены
  const handleCancel = () => navigate(-1);

  return (
    <SEOMeta title="Добавить категорию" description="Создание категории для операций" path="/add-category" noindex={true} />
      <div className="min-h-screen bg-[#D9D9D9] flex flex-col items-center py-6">
      <div className="flex justify-between items-center w-[90%] mb-6">
        <div className="text-lg font-medium">Личный финансовый учёт</div>
        <div className="flex gap-4">
          <button onClick={() => navigate("/")} className="bg-[#767676] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90">На главную</button>
        </div>
      </div>

      {/* Основной блок */}
      <div className="bg-[#B1B1B1] w-[70%] rounded-xl shadow-[5px_5px_10px_rgba(0,0,0,0.75)] p-6 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-6">Добавить категорию</h2>

        {/* Сообщение об ошибке */}
        {error && (
          <div className="w-[80%] mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Поле ввода названия */}
        <div className="w-[80%] mb-5">
          <label className="block font-medium mb-2">Название категории:</label>
          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(""); // Очищаем ошибку при изменении
            }}
            placeholder="Введите название..."
            className="w-full bg-[#F0F0F0] px-4 py-2 rounded-md shadow-[5px_5px_4px_rgba(0,0,0,0.75)] outline-none"
            disabled={loading}
          />
        </div>

        {/* Превью названия */}
        <div className="w-[80%] mb-5">
          <label className="block font-medium mb-2">Предпросмотр:</label>
          <div
            className="w-full text-center text-xl font-semibold py-2 rounded-md shadow-[5px_5px_4px_rgba(0,0,0,0.75)]"
            style={{ backgroundColor: "#F0F0F0", color: color }}
          >
            {name || "Название категории"}
          </div>
        </div>

        {/* Выбор цвета */}
        <div className="w-[80%] mb-5 flex items-center justify-between">
          <div>
            <label className="block font-medium mb-2">Цвет категории:</label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-16 h-10 cursor-pointer shadow-[5px_5px_4px_rgba(0,0,0,0.75)] rounded-md border-none"
              disabled={loading}
            />
          </div>
          <div className="flex flex-col items-center">
            <label className="font-medium mb-2">HEX:</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="bg-[#F0F0F0] px-3 py-2 w-28 text-center rounded-md shadow-[5px_5px_4px_rgba(0,0,0,0.75)] outline-none"
              disabled={loading}
            />
          </div>
        </div>

        {/* Кнопки */}
        <div className="flex gap-6 mt-6">
          <button
            onClick={handleSave}
            disabled={loading || !name.trim()}
            className={`font-semibold px-6 py-2 rounded-xl shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90 ${
              loading || !name.trim()
                ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                : "bg-[#4CAF50] text-white"
            }`}
          >
            {loading ? "Сохранение..." : "Сохранить"}
          </button>
          <button
            onClick={handleCancel}
            disabled={loading}
            className="bg-[#767676] text-white font-semibold px-6 py-2 rounded-xl shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90 disabled:opacity-50"
          >
            Отменить
          </button>
        </div>
      </div>
    </div>
  );
}