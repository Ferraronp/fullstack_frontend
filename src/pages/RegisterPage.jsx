import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Пароли не совпадают");
      return;
    }

    try {
      await axios.post("http://127.0.0.1:8000/auth/register", {
        username,
        password,
      });
      setSuccess("Регистрация успешна! Теперь войдите в аккаунт.");
      setTimeout(() => navigate("/login"), 1500);
    } catch (err) {
      if (err.response && err.response.status === 400) {
        setError("Пользователь с таким именем уже существует");
      } else {
        setError("Ошибка при регистрации");
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#D9D9D9] flex flex-col items-center py-6">
      <div className="flex justify-between items-center w-[90%] mb-6">
        <div className="text-lg font-medium">Личный финансовый учёт</div>
      </div>

      <div className="text-3xl font-semibold mb-8">Регистрация</div>

      <form
        onSubmit={handleRegister}
        className="flex flex-col space-y-6 w-80 text-lg"
      >
        <label className="flex flex-col">
          <span className="mb-1">Имя пользователя:</span>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="bg-[#F0F0F0] px-3 py-2 rounded-md shadow-[5px_5px_4px_rgba(0,0,0,0.75)] outline-none"
            required
          />
        </label>

        <label className="flex flex-col">
          <span className="mb-1">Пароль:</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-[#F0F0F0] px-3 py-2 rounded-md shadow-[5px_5px_4px_rgba(0,0,0,0.75)] outline-none"
            required
          />
        </label>

        <label className="flex flex-col">
          <span className="mb-1">Повторите пароль:</span>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="bg-[#F0F0F0] px-3 py-2 rounded-md shadow-[5px_5px_4px_rgba(0,0,0,0.75)] outline-none"
            required
          />
        </label>

        {error && <div className="text-red-600 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <div className="flex justify-between mt-4">
          <button
            type="submit"
            className="bg-[#767676] text-white px-4 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
          >
            Зарегистрироваться
          </button>

          <button
            type="button"
            onClick={() => navigate("/login")}
            className="bg-[#767676] text-white px-6 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
          >
            Вход
          </button>
        </div>
      </form>
    </div>
  );
}
