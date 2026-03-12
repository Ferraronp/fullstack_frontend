import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const formData = new URLSearchParams();
      formData.append("username", username);
      formData.append("password", password);

      const response = await axios.post("http://127.0.0.1:8000/auth/login", formData, {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });
      localStorage.setItem("access_token", response.data.access_token);
      navigate("/");
    } catch (err) {
      setError("Неверное имя пользователя или пароль");
    }
  };

  return (
    <div className="min-h-screen bg-[#D9D9D9] flex flex-col items-center py-6">
      <div className="flex justify-between items-center w-[90%] mb-6">
        <div className="text-lg font-medium">Личный финансовый учёт</div>
      </div>

      <div className="text-3xl font-semibold mb-8">Вход в аккаунт</div>

      <form
        onSubmit={handleLogin}
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

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex justify-between mt-4">
          <button
            type="submit"
            className="bg-[#767676] text-white px-6 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
          >
            Войти
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="bg-[#767676] text-white px-6 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
          >
            Регистрация
          </button>
        </div>
      </form>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-[#D9D9D9] flex flex-col items-center py-6">
      <div className="flex justify-between items-center w-[90%] mb-6">
        <div className="text-lg font-medium">Личный финансовый учёт</div>
      </div>

      <div className="text-3xl font-semibold mb-8">Вход в аккаунт</div>

      <form
        onSubmit={handleLogin}
        className="flex flex-col space-y-6 w-80 text-lg"
      >
        <label className="flex flex-col">
          <span className="mb-1">Email:</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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

        {error && <div className="text-red-600 text-sm">{error}</div>}

        <div className="flex justify-between mt-4">
          <button
            type="submit"
            className="bg-[#767676] text-white px-6 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
          >
            Войти
          </button>

          <button
            type="button"
            onClick={() => navigate("/register")}
            className="bg-[#767676] text-white px-6 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90"
          >
            Регистрация
          </button>
        </div>
      </form>
    </div>
  );
}
