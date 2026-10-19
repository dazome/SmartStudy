import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

const isRTLText = (text = "") => {
  return /[\u0600-\u06FF]/.test(text);
};

export default function QuizReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/quizzes/${id}/review`
        );

        setQuiz(response.data.quiz);
        setQuestions(response.data.questions);
      } catch (error) {
        console.error("Failed to load quiz review:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [id]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="text-secondary mt-3">
          {t("loadingQuizReview")}
        </p>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="alert alert-danger">
        {t("quizNotFound")}
      </div>
    );
  }

  const percentage = quiz.TotalQuestions
    ? Math.round(
        (quiz.Score / quiz.TotalQuestions) * 100
      )
    : 0;

  return (
    <div className="container-fluid">

      <div className="mb-4">
        <h1 className="fw-bold mb-2">
          📝 {t("quizReview")}
        </h1>

        <p className="text-secondary mb-0">
          {quiz.Title}
        </p>
      </div>

      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body p-4">
          <div className="row align-items-center text-center">

            <div className="col-md-6">
              <p className="text-secondary mb-1">
                {t("yourScore")}
              </p>

              <h2 className="fw-bold mb-0" dir="ltr">
                {quiz.Score} / {quiz.TotalQuestions}
              </h2>
            </div>

            <div className="col-md-6 mt-4 mt-md-0">
              <p className="text-secondary mb-1">
                {t("percentage")}
              </p>

              <h2 className="fw-bold text-primary mb-0">
                {percentage}%
              </h2>
            </div>

          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">

          {questions.map((question, index) => {
            const isCorrect =
              question.UserAnswer === question.CorrectAnswer;

            const options = [
              { key: "A", text: question.OptionA },
              { key: "B", text: question.OptionB },
              { key: "C", text: question.OptionC },
              { key: "D", text: question.OptionD }
            ];

            const rtl =
              isRTLText(question.QuestionText) ||
              isRTLText(question.OptionA) ||
              isRTLText(question.OptionB) ||
              isRTLText(question.OptionC) ||
              isRTLText(question.OptionD);

            return (
              <div
                key={question.QuestionId}
                className="card border-0 shadow-sm mb-4"
                dir={rtl ? "rtl" : "ltr"}
              >
                <div className="card-body p-4">

                  <div
                    className={`d-flex justify-content-between align-items-start gap-3 mb-4 ${
                      rtl ? "flex-row-reverse" : ""
                    }`}
                  >
                    <h5
                      className={`fw-bold mb-0 flex-grow-1 ${
                        rtl ? "text-end" : "text-start"
                      }`}
                    >
                      {index + 1}. {question.QuestionText}
                    </h5>

                    <span
                      className={`badge ${
                        isCorrect
                          ? "bg-success"
                          : "bg-danger"
                      } text-nowrap`}
                    >
                      {isCorrect
                        ? t("correct")
                        : t("incorrect")}
                    </span>
                  </div>

                  <div className="d-grid gap-2">
                    {options.map((option) => {
                      const isCorrectOption =
                        option.key === question.CorrectAnswer;

                      const isUserOption =
                        option.key === question.UserAnswer;

                      let optionClass =
                        "border rounded p-3 position-relative";

                      if (isCorrectOption) {
                        optionClass +=
                          " border-success bg-success-subtle";
                      } else if (isUserOption && !isCorrect) {
                        optionClass +=
                          " border-danger bg-danger-subtle";
                      } else {
                        optionClass += " bg-light";
                      }

                      return (
                        <div
                          key={option.key}
                          className={optionClass}
                        >
                          <div
                            dir={rtl ? "rtl" : "ltr"}
                            className={
                              rtl ? "text-end" : "text-start"
                            }
                            style={
                              isCorrectOption ||
                              (isUserOption && !isCorrect)
                                ? rtl
                                  ? { paddingLeft: "140px" }
                                  : { paddingRight: "140px" }
                                : {}
                            }
                          >
                            <strong
                              className={
                                rtl ? "ms-2" : "me-2"
                              }
                            >
                              {option.key}.
                            </strong>

                            {option.text}
                          </div>

                          {isCorrectOption && (
                            <span
                              className="text-success fw-semibold text-nowrap position-absolute top-50 translate-middle-y"
                              style={
                                rtl
                                  ? { left: "16px" }
                                  : { right: "16px" }
                              }
                            >
                              {t("correctAnswer")}
                            </span>
                          )}

                          {isUserOption && !isCorrect && (
                            <span
                              className="text-danger fw-semibold text-nowrap position-absolute top-50 translate-middle-y"
                              style={
                                rtl
                                  ? { left: "16px" }
                                  : { right: "16px" }
                              }
                            >
                              {t("yourAnswer")}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div
                    className={`mt-4 pt-3 border-top ${
                      rtl ? "text-end" : "text-start"
                    }`}
                  >
                    <small className="text-secondary">
                      {t("yourAnswer")}:{" "}
                    </small>

                    <strong
                      className={
                        isCorrect
                          ? "text-success"
                          : "text-danger"
                      }
                    >
                      {question.UserAnswer || t("noAnswer")}
                    </strong>
                  </div>

                </div>
              </div>
            );
          })}

        </div>
      </div>

      <div className="d-flex gap-2 flex-wrap">
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/quiz-history")}
        >
          {t("backToQuizHistory")}
        </button>

        <button
          className="btn btn-primary"
          onClick={() => navigate("/notes")}
        >
          {t("createAnotherQuiz")}
        </button>
      </div>

    </div>
  );
}