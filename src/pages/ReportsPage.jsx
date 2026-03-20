import SEOMeta from "../components/SEOMeta";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PieChart, Pie, Cell, Tooltip } from "recharts";

export default function ReportsPage() {
  const navigate = useNavigate(); // <-- подключаем навигацию

  // Пример данных
  const [data] = useState([
    { name: "Транспорт", value: 25, color: "#00FF66" },
    { name: "Жильё", value: 15, color: "#FFCC33" },
    { name: "Продукты", value: 20, color: "#6666FF" },
    { name: "Другое", value: 40, color: "#FF6666" },
  ]);

  const COLORS = data.map((d) => d.color);

  // Вынесем стили кнопок
  const getButtonStyle = (color) => ({
    backgroundColor: color,
    color: "white",
    fontWeight: "bold",
    padding: "12px 30px",
    borderRadius: "12px",
    boxShadow: "10px 15px 15px rgba(0,0,0,0.75)",
  });

  return (
    <>
        <SEOMeta title="Отчёты" description="Финансовые отчёты и аналитика" path="/report" noindex={true} />
      <div className="min-h-screen bg-[#D9D9D9] flex flex-col items-center py-6">
      {/* Верхняя панель */}
      <div className="flex justify-between items-center w-[90%] mb-6">
        <div className="text-lg font-medium">Личный финансовый учёт</div>
        <button
          className="bg-[#767676] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
          onClick={() => navigate("/settings")} // <-- переход к настройкам
        >
          Настройки ⚙️
        </button>
      </div>

      {/* Баланс и диаграмма */}
      <div className="w-[85%] flex flex-col items-center bg-[#B1B1B1] rounded-xl shadow-[5px_5px_10px_rgba(0,0,0,0.75)] p-6 mb-10">
        <div className="text-xl font-semibold mb-4">
          Баланс: <span className="text-green-600">12 450 ₽</span>
        </div>

        <div className="flex justify-center items-center gap-8">
          {/* Круговая диаграмма */}
          <PieChart width={250} height={250}>
            <Pie
              data={data}
              cx={120}
              cy={120}
              innerRadius={60}
              outerRadius={100}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>

          {/* Легенда справа */}
          <div className="bg-[#B1B1B1] rounded-xl p-4 shadow-[5px_5px_10px_rgba(0,0,0,0.75)] text-[17px]">
            {data.map((item) => (
              <div key={item.name} className="mb-1">
                {item.value}% -{" "}
                <span style={{ color: item.color }}>{item.name.toLowerCase()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Фильтры по периоду */}
      <div className="w-[85%] flex flex-col items-center bg-[#B1B1B1] rounded-xl shadow-[5px_5px_10px_rgba(0,0,0,0.75)] p-6 mb-10">
        <h2 className="text-xl font-semibold mb-4">Фильтр по периоду</h2>
        <div className="flex gap-6">
          <div className="flex flex-col">
            <label className="font-medium mb-1">С:</label>
            <input
              type="date"
              className="bg-[#F0F0F0] px-3 py-2 rounded-md shadow-[5px_5px_4px_rgba(0,0,0,0.75)] outline-none"
            />
          </div>
          <div className="flex flex-col">
            <label className="font-medium mb-1">По:</label>
            <input
              type="date"
              className="bg-[#F0F0F0] px-3 py-2 rounded-md shadow-[5px_5px_4px_rgba(0,0,0,0.75)] outline-none"
            />
          </div>
          <button className="bg-[#767676] text-white px-5 py-2 rounded-md font-semibold self-end shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90">
            Применить
          </button>
        </div>
      </div>

      {/* Кнопки навигации */}
      <div className="flex justify-center gap-10 mt-4">
        <button
          style={getButtonStyle("limegreen")}
          onClick={() => navigate("/operations")} // <-- переход к доходам
        >
          Доходы
        </button>

        <button
          style={getButtonStyle("red")}
          onClick={() => navigate("/operations?type=expense")} // <-- пример фильтра расходов
        >
          Расходы
        </button>

        <button
          style={getButtonStyle("blue")}
          onClick={() => navigate("/operations")} // <-- переход к таблице (или замени на свой путь)
        >
          Таблица
        </button>
      </div>
    </div>
  </>
  );
}
