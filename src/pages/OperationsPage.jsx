import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function OperationsPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [filters, setFilters] = useState({
    type: searchParams.get("type") || "",
    category_id: "",
    dateFrom: "",
    dateTo: "",
  });

  const [operations, setOperations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Загрузка операций и категорий
  useEffect(() => {
    const token = localStorage.getItem("access_token");
    
    if (!token) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Параллельно загружаем операции и категории
        const [operationsResponse, categoriesResponse] = await Promise.all([
          fetch("http://127.0.0.1:8000/operations/", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("http://127.0.0.1:8000/categories/", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })
        ]);

        if (!operationsResponse.ok || !categoriesResponse.ok) {
          if (operationsResponse.status === 401 || categoriesResponse.status === 401) {
            localStorage.removeItem("access_token");
            navigate("/login");
            return;
          }
          throw new Error("Ошибка при загрузке данных");
        }

        const operationsData = await operationsResponse.json();
        const categoriesData = await categoriesResponse.json();

        setOperations(operationsData);
        setCategories(categoriesData);

      } catch (err) {
        setError(err.message);
        console.error("Ошибка загрузки данных:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [navigate]);

  // Функция для выхода
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({ ...filters, [name]: value });
  };

  const applyFilters = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      
      // Собираем параметры запроса
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append("type", filters.type);
      if (filters.category_id) queryParams.append("category_id", filters.category_id);
      if (filters.dateFrom) queryParams.append("start_date", filters.dateFrom);
      if (filters.dateTo) queryParams.append("end_date", filters.dateTo);

      const response = await fetch(`http://127.0.0.1:8000/operations/?${queryParams}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }
        throw new Error("Ошибка при применении фильтров");
      }

      const filteredData = await response.json();
      setOperations(filteredData);

    } catch (err) {
      setError(err.message);
      console.error("Ошибка фильтрации:", err);
    } finally {
      setLoading(false);
    }
  };

  // Функция для удаления операции
  const handleDeleteOperation = async (operationId) => {
    if (!window.confirm("Вы уверены, что хотите удалить эту операцию?")) {
      return;
    }

    const token = localStorage.getItem("access_token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/operations/${operationId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("access_token");
          navigate("/login");
          return;
        }
        throw new Error("Ошибка при удалении операции");
      }

      // Удаляем операцию из состояния
      setOperations(operations.filter(op => op.id !== operationId));

    } catch (err) {
      setError(err.message);
      console.error("Ошибка удаления:", err);
    }
  };

  // Функция для получения названия категории по ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "Без категории";
  };

  // Функция для получения цвета категории по ID
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.color : "#767676";
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Сбрасываем фильтры
  const resetFilters = async () => {
    setFilters({
      type: "",
      category_id: "",
      dateFrom: "",
      dateTo: "",
    });
    
    // Перезагружаем все операции
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:8000/operations/", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const operationsData = await response.json();
        setOperations(operationsData);
      }
    } catch (err) {
      console.error("Ошибка при сбросе фильтров:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#D9D9D9] flex justify-center items-center">
        <p>Загрузка данных...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#D9D9D9] flex flex-col items-center py-6">
      {/* Верхняя панель */}
      <div className="flex justify-between items-center w-[90%] mb-6">
        <div className="text-lg font-medium">Личный финансовый учёт</div>
        <div className="flex gap-4">
          <button
            onClick={() => navigate("/")}
            className="bg-[#767676] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
          >
            На главную
          </button>
          <button
            onClick={() => navigate("/settings")}
            className="bg-[#767676] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
          >
            Настройки ⚙️
          </button>
          <button
            onClick={handleLogout}
            className="bg-[#ff4444] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Сообщение об ошибке */}
      {error && (
        <div className="w-[90%] mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
          {error}
          <button 
            onClick={() => setError("")}
            className="ml-4 text-red-800 font-bold"
          >
            ×
          </button>
        </div>
      )}

      {/* Кнопки над таблицей */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => navigate("/add-operation")}
          className="bg-[#4CAF50] text-white px-4 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
        >
          Добавить операцию
        </button>
        <button
          onClick={() => navigate("/report")}
          className="bg-[#2196F3] text-white px-4 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
        >
          Создать отчёт
        </button>
        <button
          onClick={() => navigate("/add-category")}
          className="bg-[#FF9800] text-white px-4 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
        >
          Добавить категорию
        </button>
      </div>

      {/* Фильтры */}
      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <select
          name="type"
          value={filters.type}
          onChange={handleFilterChange}
          className="bg-[#767676] text-white px-3 py-2 rounded-md shadow-[5px_5px_15px_rgba(0,0,0,0.75)]"
        >
          <option value="">Все типы</option>
          <option value="income">Доходы</option>
          <option value="expense">Расходы</option>
        </select>

        <select
          name="category_id"
          value={filters.category_id}
          onChange={handleFilterChange}
          className="bg-[#767676] text-white px-3 py-2 rounded-md shadow-[5px_5px_15px_rgba(0,0,0,0.75)]"
        >
          <option value="">Все категории</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          name="dateFrom"
          value={filters.dateFrom}
          onChange={handleFilterChange}
          className="bg-[#767676] text-white px-3 py-2 rounded-md shadow-[5px_5px_15px_rgba(0,0,0,0.75)]"
          placeholder="С даты"
        />

        <input
          type="date"
          name="dateTo"
          value={filters.dateTo}
          onChange={handleFilterChange}
          className="bg-[#767676] text-white px-3 py-2 rounded-md shadow-[5px_5px_15px_rgba(0,0,0,0.75)]"
          placeholder="По дату"
        />

        <button
          onClick={applyFilters}
          className="bg-[#4CAF50] text-white px-4 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
        >
          Применить
        </button>

        <button
          onClick={resetFilters}
          className="bg-[#767676] text-white px-4 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
        >
          Сбросить
        </button>
      </div>

      {/* Таблица */}
      <div className="w-[90%] bg-[#B1B1B1] rounded-lg shadow-[5px_5px_10px_rgba(0,0,0,0.75)] p-4">
        {operations.length > 0 ? (
          <table className="w-full text-center border-collapse">
            <thead>
              <tr className="border-b-2 border-black">
                <th className="py-2">Дата</th>
                <th>Категория</th>
                <th>Сумма</th>
                <th>Комментарий</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              {operations.map((operation) => (
                <tr key={operation.id} className="border-t border-black">
                  <td className="py-2">{formatDate(operation.date)}</td>
                  <td style={{ color: getCategoryColor(operation.category_id) }}>
                    {getCategoryName(operation.category_id)}
                  </td>
                  <td className={operation.amount < 0 ? "text-red-500 font-bold" : "text-green-500 font-bold"}>
                    {operation.amount > 0 ? `+${operation.amount} ₽` : `${operation.amount} ₽`}
                  </td>
                  <td>{operation.comment || "-"}</td>
                  <td>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => navigate(`/edit-operation/${operation.id}`)}
                        className="bg-[#2196F3] text-white px-3 py-1 rounded-md font-semibold shadow-[5px_5px_10px_rgba(0,0,0,0.75)] hover:opacity-90"
                      >
                        Ред.
                      </button>
                      <button
                        onClick={() => handleDeleteOperation(operation.id)}
                        className="bg-[#ff4444] text-white px-3 py-1 rounded-md font-semibold shadow-[5px_5px_10px_rgba(0,0,0,0.75)] hover:opacity-90"
                      >
                        Уд.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8">
            <p className="text-lg mb-4">Нет операций для отображения</p>
            <button
              onClick={() => navigate("/add-operation")}
              className="bg-[#4CAF50] text-white px-4 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
            >
              Добавить первую операцию
            </button>
          </div>
        )}
      </div>
    </div>
  );
}