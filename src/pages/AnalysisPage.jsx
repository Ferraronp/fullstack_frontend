import SEOMeta from "../components/SEOMeta";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

export default function AnalysisPage() {
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState("");
  const [count, setCount] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAnalyze = async () => {
    setLoading(true);
    setError("");
    setAnalysis("");
    try {
      const res = await API.get("/analysis/ai?limit=50");
      setAnalysis(res.data.analysis);
      setCount(res.data.operations_count);
    } catch (err) {
      setError(err.response?.data?.detail || "Сервис анализа временно недоступен. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#D9D9D9] flex flex-col items-center py-6">
      <SEOMeta title="AI-анализ" description="Анализ расходов с помощью ИИ" path="/analysis" noindex={true} />

      <div className="flex justify-between items-center w-[90%] mb-6">
        <div className="text-lg font-medium">Личный финансовый учёт</div>
        <button onClick={() => navigate("/")}
          className="bg-[#767676] text-white px-5 py-2 rounded-md font-semibold shadow-[5px_5px_15px_rgba(0,0,0,0.75)] hover:opacity-90">
          На главную
        </button>
      </div>

      <h2 className="text-2xl font-semibold mb-2">AI-анализ расходов</h2>
      <p className="text-sm text-gray-600 mb-6">Анализ последних 50 операций с помощью Groq LLM</p>

      <div className="w-[90%] max-w-[700px] bg-[#B1B1B1] rounded-lg shadow-[5px_5px_10px_rgba(0,0,0,0.75)] p-6 flex flex-col gap-4">
        <button
          onClick={handleAnalyze}
          disabled={loading}
          className={`px-6 py-3 rounded-md font-semibold shadow-[5px_5px_10px_rgba(0,0,0,0.75)] hover:opacity-90 self-start
            ${loading ? "bg-gray-400 text-gray-200 cursor-not-allowed" : "bg-[#4CAF50] text-white"}`}
        >
          {loading ? "Анализирую..." : "Проанализировать расходы"}
        </button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {analysis && (
          <div className="bg-[#F0F0F0] rounded-md p-4">
            {count !== null && (
              <p className="text-xs text-gray-500 mb-3">Проанализировано операций: {count}</p>
            )}
            <p style={{ whiteSpace: "pre-wrap", lineHeight: "1.7" }}>{analysis}</p>
          </div>
        )}

        {!analysis && !loading && !error && (
          <p className="text-gray-600 text-sm">
            Нажмите кнопку — ИИ проанализирует ваши последние операции и даст советы по оптимизации расходов.
          </p>
        )}
      </div>
    </div>
  );
}
