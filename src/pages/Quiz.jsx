import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

const isRTLText = (text = "") => {
  return /[\u0600-\u06FF]/.test(text);
};

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [questions, setQuestions] = useState([]);
  const [quizId, setQuizId] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/quizzes/${id}`
        );

        setQuestions(response.data);
        setQuizId(id);
      } catch (error) {
        console.error("Failed to load quiz:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuiz();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="text-secondary mt-3">
          {t("loadingQuiz")}
        </p>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="alert alert-warning">
        {t("noQuizQuestions")}
      </div>
    );
  }

  const question = questions[currentQuestion];

  const rtl =
    isRTLText(question.QuestionText) ||
    isRTLText(question.OptionA) ||
    isRTLText(question.OptionB) ||
    isRTLText(question.OptionC) ||
    isRTLText(question.OptionD);

  const handleNext = async () => {
    if (!selectedAnswer) return;

    try {
      await axios.post(
        `http://localhost:5000/api/questions/${question.QuestionId}/answer`,
        {
          answer: selectedAnswer
        }
      );

      let newScore = score;

      if (selectedAnswer === question.CorrectAnswer) {
        newScore++;
      }

      if (currentQuestion === questions.length - 1) {
        await axios.post(
          `http://localhost:5000/api/quizzes/${quizId}/result`,
          {
            score: newScore
          }
        );

        setScore(newScore);
        setFinished(true);
      } else {
        setScore(newScore);
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer("");
      }
    } catch (error) {
      console.error("Failed to save answer:", error);
      alert(t("saveAnswerFailed"));
    }
  };

  if (finished) {
    const percentage = Math.round(
      (score / questions.length) * 100
    );

    return (
      <div className="container-fluid">
        <div className="row justify-content-center">
          <div className="col-lg-7 col-xl-6">
            <div
              className="card border-0 shadow-sm"
              dir={rtl ? "rtl" : "ltr"}
            >
              <div className="card-body text-center p-5">
                <div className="fs-1 mb-3">
                  🎉
                </div>

                <h1 className="fw-bold mb-2">
                  {t("quizCompleted")}
                </h1>

                <p className="text-secondary mb-4">
                  {t("quizCompletedDescription")}
                </p>

                <div className="mb-4">
                  <p className="text-secondary mb-1">
                    {t("yourScore")}
                  </p>

                  <h2 className="display-4 fw-bold text-primary mb-1" dir="ltr">
                    {score} / {questions.length}
                  </h2>

                  <p className="fw-semibold mb-0">
                    {percentage}%
                  </p>
                </div>

                <div className="d-flex justify-content-center gap-2 flex-wrap">
                  <button
                    className="btn btn-primary"
                    onClick={() =>
                      navigate(`/quiz/${quizId}/review`)
                    }
                  >
                    {t("reviewQuiz")}
                  </button>

                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/quiz-history")}
                  >
                    {t("quizHistory")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const options = [
    { key: "A", text: question.OptionA },
    { key: "B", text: question.OptionB },
    { key: "C", text: question.OptionC },
    { key: "D", text: question.OptionD }
  ];

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="container-fluid">
      <div className="row justify-content-center">
        <div className="col-xl-8">

          <div className="mb-4">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <span className="text-secondary small">
                {t("question")} {currentQuestion + 1} {t("of")}{" "}
                {questions.length}
              </span>

              <span className="text-secondary small">
                📝 {t("quiz")}
              </span>
            </div>

            <div
              className="progress"
              style={{ height: "6px" }}
            >
              <div
                className="progress-bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div
            className="card border-0 shadow-sm"
            dir={rtl ? "rtl" : "ltr"}
          >
            <div className="card-body p-4 p-md-5">

              <h3
                className={`fw-bold mb-4 ${
                  rtl ? "text-end" : "text-start"
                }`}
              >
                {question.QuestionText}
              </h3>

              <div className="d-grid gap-3">
                {options.map((option) => (
                  <button
                    key={option.key}
                    className={`btn p-3 ${
                      rtl ? "text-end" : "text-start"
                    } ${
                      selectedAnswer === option.key
                        ? "btn-primary"
                        : "btn-outline-secondary"
                    }`}
                    onClick={() =>
                      setSelectedAnswer(option.key)
                    }
                  >
                    <strong className={rtl ? "ms-2" : "me-2"}>
                      {option.key}.
                    </strong>

                    {option.text}
                  </button>
                ))}
              </div>

              <div className="d-flex justify-content-end mt-4">
                <button
                  className="btn btn-primary px-4"
                  onClick={handleNext}
                  disabled={!selectedAnswer}
                >
                  {currentQuestion === questions.length - 1
                    ? t("finishQuiz")
                    : t("nextQuestion")}
                </button>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}