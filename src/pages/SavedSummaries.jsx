import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

const isRTLText = (text = "") => {
  return /[\u0600-\u06FF]/.test(text);
};

export default function SavedSummaries() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [summaries, setSummaries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummaries = async () => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/summaries/user/${user.id}`
        );

        setSummaries(response.data);
      } catch (error) {
        console.error("Failed to load summaries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSummaries();
  }, [navigate]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      t("confirmDeleteSummary")
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/summaries/${id}`
      );

      setSummaries(
        summaries.filter((summary) => summary.SummaryId !== id)
      );
    } catch (error) {
      console.error("Failed to delete summary:", error);
      alert(t("deleteSummaryFailed"));
    }
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="text-secondary mt-3">
          {t("loadingSummaries")}
        </p>
      </div>
    );
  }

  const locale = i18n.language.startsWith("fa") ? "fa-IR" : "en-US";

  return (
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-2">
            ✨ {t("savedSummaries")}
          </h1>

          {/* <p className="text-secondary mb-0">
            {t("savedSummariesDescription")}
          </p> */}
        </div>

        <Link to="/notes" className="btn btn-primary">
          {t("myNotes")}
        </Link>
      </div>

      {summaries.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">

            <h4 className="fw-bold mb-2">
              {t("noSavedSummariesYet")}
            </h4>

            <p className="text-secondary mb-4">
              {t("noSavedSummariesDescription")}
            </p>

            <Link to="/notes" className="btn btn-primary">
              {t("goToMyNotes")}
            </Link>

          </div>
        </div>
      ) : (
        <div className="row g-4">
          {summaries.map((summary) => {
            const rtl = isRTLText(summary.SummaryText);

            const preview =
              summary.SummaryText.length > 220
                ? `${summary.SummaryText.substring(0, 220)}...`
                : summary.SummaryText;

            return (
              <div
                className="col-md-6"
                key={summary.SummaryId}
              >
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body p-4 d-flex flex-column">

                    <div className="mb-3">
                      <span className="badge bg-light text-dark border">
                        {t("summary")}
                      </span>
                    </div>

                    <h5
                      className={`fw-bold mb-2 ${
                        rtl ? "text-end" : "text-start"
                      }`}
                      dir={rtl ? "rtl" : "ltr"}
                    >
                      {summary.NoteTitle}
                    </h5>

                    <p className="text-secondary small mb-3">
                      {t("saved")}{" "}
                      {new Date(summary.CreatedAt).toLocaleDateString(locale)}
                    </p>

                    <p
                      dir={rtl ? "rtl" : "ltr"}
                      className={`text-secondary mb-4 flex-grow-1 ${
                        rtl ? "text-end" : "text-start"
                      }`}
                      style={{ lineHeight: "1.7" }}
                    >
                      {preview}
                    </p>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-outline-primary btn-sm"
                        onClick={() =>
                          navigate(`/summaries/${summary.SummaryId}`)
                        }
                      >
                        {t("viewSummary")}
                      </button>

                      <button
                        className="btn btn-outline-danger btn-sm"
                        onClick={() => handleDelete(summary.SummaryId)}
                      >
                        {t("delete")}
                      </button>
                    </div>

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