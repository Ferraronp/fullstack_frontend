import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const navigate = useNavigate();
  const email = localStorage.getItem("userEmail") || "user@example.com";

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-[#D9D9D9] flex flex-col items-center py-6">
      {/* Верхняя панель */}
      <div className="flex justify-between items-center w-[90%] mb-6">
        <div className="text-lg font-medium">Личный финансовый учёт</div>
        <div className="flex gap-4">
          <button
            className="bg-[#767676] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
            onClick={() => navigate("/")}
          >
            На главную
          </button>
          <button
            className="bg-[#767676] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
            onClick={() => navigate(-1)}
          >
            Назад
          </button>
        </div>
      </div>

      {/* Основной блок */}
      <div className="bg-[#B1B1B1] w-[50%] rounded-xl shadow-[5px_5px_10px_rgba(0,0,0,0.75)] p-6 flex flex-col items-center">
        <h2 className="text-xl font-semibold mb-6">Настройки</h2>

        {/* Email */}
        <div className="w-[80%] mb-6">
          <label className="block font-medium mb-2">Email:</label>
          <div className="bg-[#F0F0F0] px-4 py-3 rounded-md shadow-[5px_5px_4px_rgba(0,0,0,0.75)]">
            {email}
          </div>
        </div>

        {/* Кнопка выхода */}
        <button
          className="bg-[#767676] text-white font-semibold px-6 py-2 rounded-xl shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
          onClick={handleLogout}
        >
          Выйти
        </button>
      </div>
    </div>
  );
}
