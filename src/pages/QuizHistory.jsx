import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function QuizHistory() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/quizzes/user/${user.id}`
        );

        setQuizzes(response.data);
      } catch (error) {
        console.error("Failed to load quiz history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="text-secondary mt-3">
          {t("loadingQuizHistory")}
        </p>
      </div>
    );
  }

  const locale = i18n.language.startsWith("fa")
    ? "fa-IR"
    : "en-US";

  return (
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-2">
            📝 {t("quizHistory")}
          </h1>

          {/* <p className="text-secondary mb-0">
            {t("quizHistoryDescription")}
          </p> */}
        </div>

        <Link
          to="/notes"
          className="btn btn-primary"
        >
          {t("createNewQuiz")}
        </Link>
      </div>

      {quizzes.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">

            <h4 className="fw-bold mb-2">
              {t("noQuizzesYet")}
            </h4>

            <p className="text-secondary mb-4">
              {t("noQuizzesDescription")}
            </p>

            <Link
              to="/notes"
              className="btn btn-primary"
            >
              {t("goToMyNotes")}
            </Link>

          </div>
        </div>
      ) : (
        <div className="row g-4">
          {quizzes.map((quiz) => {
            const completed = quiz.Score !== null;

            const percentage =
              completed && quiz.TotalQuestions
                ? Math.round(
                    (quiz.Score / quiz.TotalQuestions) * 100
                  )
                : null;

            return (
              <div
                className="col-md-6 col-xl-4"
                key={quiz.QuizId}
              >
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4">

                    <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                      <span className="badge bg-light text-dark border">
                        {t("quiz")}
                      </span>

                      {completed ? (
                        <span className="badge bg-success-subtle text-success">
                          {t("completed")}
                        </span>
                      ) : (
                        <span className="badge bg-secondary-subtle text-secondary">
                          {t("notCompleted")}
                        </span>
                      )}
                    </div>

                    <h5 className="fw-bold mb-3">
                      {quiz.Title}
                    </h5>

                    <p className="text-secondary small mb-3">
                      {new Date(quiz.CreatedAt).toLocaleDateString(locale)}
                    </p>

                    {completed && (
                      <div className="bg-light rounded p-3 mb-3">
                        <div className="d-flex justify-content-between">
                          <span className="text-secondary">
                            {t("score")}
                          </span>

                          <strong dir="ltr">
                            {quiz.Score} / {quiz.TotalQuestions}
                          </strong>
                        </div>

                        <div className="d-flex justify-content-between mt-2">
                          <span className="text-secondary">
                            {t("percentage")}
                          </span>

                          <strong>
                            {percentage}%
                          </strong>
                        </div>
                      </div>
                    )}

                    {completed && (
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() =>
                          navigate(`/quiz/${quiz.QuizId}/review`)
                        }
                      >
                        {t("reviewQuiz")}
                      </button>
                    )}

                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}