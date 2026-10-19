import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function Dashboard() {
  const { t, i18n } = useTranslation();

  const user = JSON.parse(localStorage.getItem("user"));

  const [dashboardData, setDashboardData] = useState({
    NotesCount: 0,
    QuizzesCount: 0,
    AverageScore: 0
  });

  const [recentQuizzes, setRecentQuizzes] = useState([]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/dashboard/${user.id}`
        );

        setDashboardData(response.data);

        const quizzesResponse = await axios.get(
          `http://localhost:5000/api/dashboard/${user.id}/recent-quizzes`
        );

        setRecentQuizzes(quizzesResponse.data);
      } catch (error) {
        console.error("Failed to load dashboard:", error);
      }
    };

    if (user) {
      fetchDashboard();
    }
  }, []);

  const locale = i18n.language.startsWith("fa") ? "fa-IR" : "en-US";

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="fw-bold mb-2">
          {t("welcomeBack")}, {user?.name}
        </h1>

        <p className="text-secondary mb-0">
          {t("dashboardDescription")}
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <p className="text-secondary mb-2">
                {t("studyNotes")}
              </p>

              <h2 className="fw-bold mb-0">
                {dashboardData.NotesCount}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <p className="text-secondary mb-2">
                {t("quizzesCompleted")}
              </p>

              <h2 className="fw-bold mb-0">
                {dashboardData.QuizzesCount}
              </h2>
            </div>
          </div>
        </div>

        <div className="col-md-4">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <p className="text-secondary mb-2">
                {t("averageQuizScore")}
              </p>

              <h2 className="fw-bold mb-0">
                {Number(dashboardData.AverageScore).toFixed(1)}%
              </h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <h4 className="fw-bold mb-2">
                {t("quickStudy")}
              </h4>

              <p className="text-secondary mb-4">
                {t("quickStudyDescription")}
              </p>

              <div className="d-grid gap-2">
                <Link to="/upload" className="btn btn-outline-primary">
                  {t("uploadNewNote")}
                </Link>

                <Link to="/notes" className="btn btn-outline-primary">
                  {t("generateAQuiz")}
                </Link>

                <Link to="/flashcards" className="btn btn-outline-primary">
                  {t("studyFlashcards")}
                </Link>

                <Link to="/summaries" className="btn btn-outline-primary">
                  {t("reviewSummaries")}
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body p-4">
              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <h4 className="fw-bold mb-1">
                    {t("recentQuizzes")}
                  </h4>

                  <p className="text-secondary small mb-0">
                    {t("recentQuizzesDescription")}
                  </p>
                </div>

                <Link
                  to="/quiz-history"
                  className="btn btn-sm btn-outline-primary"
                >
                  {t("viewAll")}
                </Link>
              </div>

              {recentQuizzes.length === 0 ? (
                <div className="py-4 text-center">
                  <p className="text-secondary mb-3">
                    {t("noRecentQuizzes")}
                  </p>

                  <Link
                    to="/notes"
                    className="btn btn-sm btn-primary"
                  >
                    {t("createQuiz")}
                  </Link>
                </div>
              ) : (
                <div className="list-group list-group-flush">
                  {recentQuizzes.map((quiz) => (
                    <div
                      key={quiz.QuizId}
                      className="list-group-item px-0 py-3"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <h6 className="fw-semibold mb-1">
                            {quiz.Title}
                          </h6>

                          <small className="text-secondary">
                            {new Date(quiz.CreatedAt).toLocaleDateString(locale)}
                          </small>
                        </div>

                        <div
                          className={
                            i18n.language.startsWith("fa")
                              ? "text-start"
                              : "text-end"
                          }
                        >
                          <span className="fw-bold" dir="ltr">
                            {quiz.Score} / {quiz.TotalQuestions}
                          </span>

                          <div className="small text-secondary">
                            {t("score")}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}