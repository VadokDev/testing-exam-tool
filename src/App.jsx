import { useState, useEffect } from "react";

function App() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);

  useEffect(() => {
    fetch("/questions.json")
      .then((response) => response.json())
      .then((data) => setQuestions(data.questions))
      .catch((error) => console.error("Error loading questions:", error));
  }, []);

  const handleAnswer = (answer) => {
    setUserAnswers({ ...userAnswers, [currentQuestionIndex]: answer });
    setShowFeedback(false);
  };

  const handleVerify = () => {
    const currentQuestion = questions[currentQuestionIndex];
    const userAnswer = userAnswers[currentQuestionIndex];
    let correct = false;

    if (currentQuestion.type === "multiple_choice") {
      correct = userAnswer === currentQuestion.correctIndex;
    } else if (currentQuestion.type === "written") {
      correct =
        (userAnswer || "").trim().toLowerCase() ===
        currentQuestion.correctAnswer.trim().toLowerCase();
    } else if (currentQuestion.type === "development") {
      const keywords = currentQuestion.keywords.map((k) => k.toLowerCase());
      const userWords = (userAnswer || "").toLowerCase().split(/\s+/);
      const foundKeywords = keywords.filter((k) => userWords.includes(k));
      if (foundKeywords.length >= 2) {
        correct = true;
      } else if (foundKeywords.length === 1) {
        correct = "partial";
      } else {
        correct = false;
      }
    }
    setIsCorrect(correct);
    setShowFeedback(true);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setShowFeedback(false);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setShowFeedback(false);
    }
  };

  const renderQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return null;

    return (
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          {currentQuestion.text}
        </h2>
        {currentQuestion.type === "multiple_choice" ? (
          <div className="flex flex-col gap-4">
            {currentQuestion.options.map((option, index) => {
              const selected = userAnswers[currentQuestionIndex] === index;
              return (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleAnswer(index)}
                  className={`w-full text-left px-6 py-3 rounded-lg border transition-all duration-150
                    ${
                      selected
                        ? "bg-blue-500 text-white border-blue-600 shadow-md scale-105"
                        : "bg-gray-100 text-gray-800 border-gray-300 hover:bg-blue-100 hover:border-blue-400"
                    }
                  `}
                >
                  <span className="font-medium">{option}</span>
                  {selected && (
                    <span className="ml-3 inline-block align-middle">✔️</span>
                  )}
                </button>
              );
            })}
          </div>
        ) : currentQuestion.type === "written" ? (
          <input
            type="text"
            value={userAnswers[currentQuestionIndex] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
            placeholder="Escribe tu respuesta aquí..."
          />
        ) : (
          <textarea
            value={userAnswers[currentQuestionIndex] || ""}
            onChange={(e) => handleAnswer(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg h-32"
            placeholder="Escribe tu respuesta aquí..."
          />
        )}
        <button
          onClick={handleVerify}
          className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors duration-150 shadow"
        >
          Verificar
        </button>
        {showFeedback && (
          <div
            className={`mt-4 text-lg font-semibold ${
              isCorrect === true
                ? "text-green-600"
                : isCorrect === "partial"
                ? "text-yellow-600"
                : "text-red-500"
            }`}
          >
            {isCorrect === true
              ? "¡Correcto!"
              : isCorrect === "partial"
              ? "Respuesta parcialmente correcta"
              : "Incorrecto. Intenta de nuevo."}
          </div>
        )}
      </div>
    );
  };

  const renderResults = () => {
    const correctAnswers = questions.filter((q, index) => {
      const userAnswer = userAnswers[index];
      if (q.type === "multiple_choice") {
        return userAnswer === q.correctIndex;
      } else if (q.type === "written") {
        return (
          (userAnswer || "").trim().toLowerCase() ===
          q.correctAnswer.trim().toLowerCase()
        );
      } else if (q.type === "development") {
        const keywords = q.keywords.map((k) => k.toLowerCase());
        const userWords = (userAnswer || "").toLowerCase().split(/\s+/);
        const foundKeywords = keywords.filter((k) => userWords.includes(k));
        return foundKeywords.length >= 2;
      }
      return false;
    }).length;

    return (
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Resumen</h2>
        <p className="mb-4 text-lg">
          Respuestas correctas:{" "}
          <span className="font-bold">{correctAnswers}</span> de{" "}
          {questions.length}
        </p>
        <h3 className="font-semibold mt-4 mb-2 text-gray-700">
          Respuestas incorrectas:
        </h3>
        {questions.map((q, index) => {
          const userAnswer = userAnswers[index];
          let correct = false;
          if (q.type === "multiple_choice") {
            correct = userAnswer === q.correctIndex;
          } else if (q.type === "written") {
            correct =
              (userAnswer || "").trim().toLowerCase() ===
              q.correctAnswer.trim().toLowerCase();
          } else if (q.type === "development") {
            const keywords = q.keywords.map((k) => k.toLowerCase());
            const userWords = (userAnswer || "").toLowerCase().split(/\s+/);
            const foundKeywords = keywords.filter((k) => userWords.includes(k));
            if (foundKeywords.length >= 2) {
              correct = true;
            } else if (foundKeywords.length === 1) {
              correct = "partial";
            } else {
              correct = false;
            }
          }
          if (!correct) {
            return (
              <div
                key={index}
                className="mt-2 p-3 bg-red-50 rounded border border-red-200"
              >
                <p className="font-medium">
                  Pregunta: <span className="font-normal">{q.text}</span>
                </p>
                <p>
                  Tu respuesta:{" "}
                  <span className="italic">
                    {userAnswer || (
                      <span className="text-gray-400">(sin respuesta)</span>
                    )}
                  </span>
                </p>
                <p>
                  Respuesta correcta:{" "}
                  <span className="font-semibold">
                    {q.type === "multiple_choice"
                      ? q.options[q.correctIndex]
                      : q.type === "written"
                      ? q.correctAnswer
                      : "Debe contener al menos 2 palabras clave: " +
                        q.keywords.join(", ")}
                  </span>
                </p>
              </div>
            );
          }
          return null;
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 py-8">
      {!showResults ? (
        <>
          {renderQuestion()}
          <div className="flex justify-between gap-4 mt-8 w-full max-w-xl">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className={`flex-1 py-3 rounded-lg font-semibold shadow transition-colors duration-150 ${
                currentQuestionIndex === 0
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              Anterior
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3 rounded-lg font-semibold shadow bg-green-600 text-white hover:bg-green-700 transition-colors duration-150"
            >
              Siguiente
            </button>
          </div>
        </>
      ) : (
        renderResults()
      )}
    </div>
  );
}

export default App;
