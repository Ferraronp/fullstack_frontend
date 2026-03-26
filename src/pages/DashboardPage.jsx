import SEOMeta from "../components/SEOMeta";
import React, { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Функция для преобразования операций в данные для диаграммы
  const transformOperationsToChartData = (operations, categories) => {
    if (!operations.length || !categories.length) return [];

    // Группируем операции по категориям и суммируем расходы (отрицательные суммы)
    const categoryExpenses = {};
    
    operations.forEach(op => {
      if (op.amount < 0) { // Только расходы для диаграммы
        const category = categories.find(cat => cat.id === op.category_id);
        const categoryName = category ? category.name : "Другое";
        
        if (!categoryExpenses[categoryName]) {
          categoryExpenses[categoryName] = 0;
        }
        categoryExpenses[categoryName] += Math.abs(op.amount);
      }
    });

    // Преобразуем в массив для диаграммы
    const totalExpenses = Object.values(categoryExpenses).reduce((sum, val) => sum + val, 0);
    
    if (totalExpenses === 0) return [];

    // Генерируем цвета для категорий
    const defaultColors = ["#7FFF00", "#FFA500", "#6495ED", "#FF7F7F", "#9370DB", "#FF69B4", "#20B2AA", "#FFD700"];
    
    return Object.entries(categoryExpenses).map(([name, amount], index) => ({
      name,
      value: Math.round((amount / totalExpenses) * 100),
      amount: amount,
      color: categories.find(cat => cat.name === name)?.color || defaultColors[index % defaultColors.length]
    }));
  };

  // Получение данных с бэкенда
  useEffect(() => {
    const access_token = localStorage.getItem("access_token");
    
    if (!access_token) {
      navigate("/login");
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Параллельно запрашиваем операции, баланс и категории
        const [operationsResponse, balanceResponse, categoriesResponse] = await Promise.all([
          fetch("/api/operations/", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("/api/operations/balance/total", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
          }),
          fetch("/api/categories/", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${access_token}`,
              "Content-Type": "application/json",
            },
          })
        ]);

        // Проверяем все ответы
        if (!operationsResponse.ok || !balanceResponse.ok || !categoriesResponse.ok) {
          if (operationsResponse.status === 401 || balanceResponse.status === 401 || categoriesResponse.status === 401) {
            localStorage.removeItem("access_token");
            navigate("/login");
            return;
          }
          throw new Error("Ошибка при получении данных");
        }

        const operationsData = await operationsResponse.json();
        const balanceData = await balanceResponse.json();
        const categoriesData = await categoriesResponse.json();

        // Устанавливаем данные
        setBalance(balanceData.balance || 0);
        setCategories(categoriesData);
        setTransactions(operationsData.items);

      } catch (err) {
        setError(err.message);
        console.error("Ошибка загрузки данных:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Функция для выхода
  const handleLogout = () => {
    localStorage.removeItem("access_token");
    navigate("/login");
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
  };

  // Получаем данные для диаграммы
  const chartData = transformOperationsToChartData(transactions, categories);

  // Сортируем транзакции по дате (новые сверху)
  const sortedTransactions = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10); // Показываем только последние 10 операций

  if (loading) {
    return (
      <>
        <SEOMeta title="Главная" description="Обзор ваших финансов" path="/" noindex={true} />
        <div
          className="min-h-screen p-6 flex justify-center items-center"
          style={{
            backgroundColor: "#D9D9D9",
            fontFamily: "sans-serif",
          }}
        >
          <p>Загрузка данных...</p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div
        className="min-h-screen p-6 flex justify-center items-center"
        style={{
          backgroundColor: "#D9D9D9",
          fontFamily: "sans-serif",
        }}
      >
        <div className="text-center">
          <p className="text-red-500 mb-4">Ошибка: {error}</p>
          <button
            onClick={() => window.location.reload()}
            style={{
              backgroundColor: "#767676",
              color: "white",
              padding: "8px 16px",
              borderRadius: "8px",
            }}
          >
            Повторить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-6"
      style={{
        backgroundColor: "#D9D9D9",
        fontFamily: "sans-serif",
      }}
    >
      {/* Заголовок */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-semibold">Личный финансовый учёт</h1>
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/settings")}
            style={{
              backgroundColor: "#767676",
              color: "white",
              fontWeight: "bold",
              padding: "8px 16px",
              borderRadius: "8px",
              boxShadow: "10px 15px 15px rgba(0, 0, 0, 0.75)",
            }}
          >
            ⚙️ Настройки
          </button>
          <button
            onClick={handleLogout}
            style={{
              backgroundColor: "#ff4444",
              color: "white",
              fontWeight: "bold",
              padding: "8px 16px",
              borderRadius: "8px",
              boxShadow: "10px 15px 15px rgba(0, 0, 0, 0.75)",
            }}
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Баланс и диаграмма */}
      <div 
        className="flex flex-wrap gap-8 mb-8"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ paddingLeft: "20px" }}>
          <p className="text-lg font-medium mb-4">
            Баланс:{" "}
            <span style={{ 
              color: balance >= 0 ? "green" : "red", 
              fontWeight: "bold" 
            }}>
              {balance.toLocaleString('ru-RU')} ₽
            </span>
          </p>

          {chartData.length > 0 ? (
            <ResponsiveContainer width={250} height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div
              style={{
                width: 250,
                height: 250,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#B1B1B1",
                borderRadius: "50%",
              }}
            >
              <p className="text-center p-4">Нет данных для диаграммы<br/><small>Добавьте расходы</small></p>
            </div>
          )}
        </div>

        {/* Легенда */}
        {chartData.length > 0 && (
          <div
            style={{
              backgroundColor: "#B1B1B1",
              padding: "16px 24px",
              borderRadius: "10px",
              boxShadow: "5px 5px 10px rgba(0,0,0,0.75)",
              height: "fit-content",
              minWidth: "200px",
              marginRight: "20px",
              marginLeft: "auto",
            }}
          >
            <h3 className="font-semibold mb-2">Расходы по категориям:</h3>
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between mb-1">
                <div className="flex items-center">
                  <div 
                    style={{ 
                      backgroundColor: item.color,
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      marginRight: "8px"
                    }} 
                  />
                  <span>{item.name}:</span>
                </div>
                <span>{item.value}%</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Последние операции */}
      <div>
        <h2 className="text-lg mb-3">Последние операции</h2>

        {sortedTransactions.length > 0 ? (
          <table
            style={{
              width: "100%",
              backgroundColor: "#B1B1B1",
              borderCollapse: "collapse",
              borderRadius: "10px",
              overflow: "hidden",
              boxShadow: "5px 5px 10px rgba(0,0,0,0.75)",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#A0A0A0" }}>
                <th style={cellStyle}>Дата</th>
                <th style={cellStyle}>Категория</th>
                <th style={cellStyle}>Сумма</th>
                <th style={cellStyle}>Комментарий</th>
              </tr>
            </thead>
            <tbody>
              {sortedTransactions.map((transaction, index) => {
                const category = categories.find(cat => cat.id === transaction.category_id);
                const categoryName = category ? category.name : "Без категории";
                
                return (
                  <tr key={transaction.id || index}>
                    <td style={cellStyle}>{formatDate(transaction.date)}</td>
                    <td style={cellStyle}>{categoryName}</td>
                    <td
                      style={{
                        ...cellStyle,
                        color: transaction.amount < 0 ? "red" : "green",
                        fontWeight: "bold",
                      }}
                    >
                      {transaction.amount > 0 ? `+${transaction.amount} ₽` : `${transaction.amount} ₽`}
                    </td>
                    <td style={cellStyle}>{transaction.comment || "-"}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div
            style={{
              backgroundColor: "#B1B1B1",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "5px 5px 10px rgba(0,0,0,0.75)",
            }}
          >
            <p>Нет операций для отображения</p>
            <button
              onClick={() => navigate("/operations")}
              style={{
                backgroundColor: "#767676",
                color: "white",
                padding: "8px 16px",
                borderRadius: "8px",
                marginTop: "10px",
              }}
            >
              Добавить первую операцию
            </button>
          </div>
        )}
      </div>

      {/* Кнопки */}
      <div className="flex justify-center gap-8 mt-10">
        <button
          onClick={() => navigate("/operations?type=income")}
          style={getButtonStyle("limegreen")}
        >
          Доходы
        </button>

        <button
          onClick={() => navigate("/operations?type=expense")}
          style={getButtonStyle("red")}
        >
          Расходы
        </button>

        <button
          onClick={() => navigate("/report")}
          style={getButtonStyle("blue")}
        >
          Отчёты
        </button>
        <button
          onClick={() => navigate("/analysis")}
          style={getButtonStyle("green")}
        >
          AI-анализ 🤖
        </button>
      </div>
    </div>
  );
};

const cellStyle = {
  border: "1px solid black",
  padding: "8px 12px",
  textAlign: "center",
};

const getButtonStyle = (color) => ({
  backgroundColor: color,
  color: "white",
  fontWeight: "bold",
  padding: "12px 30px",
  borderRadius: "12px",
  boxShadow: "10px 15px 15px rgba(0,0,0,0.75)",
});

export default Dashboard;