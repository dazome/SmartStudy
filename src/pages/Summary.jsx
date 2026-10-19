import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

const isRTLText = (text = "") => {
  return /[\u0600-\u06FF]/.test(text);
};

export default function Summary() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const user = JSON.parse(localStorage.getItem("user"));
  const isSavedSummary = location.pathname.startsWith("/summaries/");

  const { title, summary } = location.state || {};

  const [savedSummary, setSavedSummary] = useState(null);
  const [loading, setLoading] = useState(isSavedSummary);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isSavedSummary) return;

    const fetchSummary = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/summaries/${id}`
        );

        setSavedSummary(response.data);
      } catch (error) {
        console.error("Failed to load summary:", error);
        setError(t("loadSummaryFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [id, isSavedSummary, t]);

  const handleSaveSummary = async () => {
    if (!user || !summary) return;

    try {
      setSaving(true);

      const response = await axios.post(
        "http://localhost:5000/api/summaries",
        {
          noteId: id,
          userId: user.id,
          summaryText: summary
        }
      );

      if (response.data.exists) {
        setSaved(true);
        return;
      }

      setSaved(true);
    } catch (error) {
      console.error("Save summary failed:", error);
      alert(t("saveSummaryFailed"));
    } finally {
      setSaving(false);
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
          {t("loadingSummary")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        {error}
      </div>
    );
  }

  const summaryText = summary || savedSummary?.SummaryText;
  const summaryTitle =
    title || savedSummary?.NoteTitle || t("studySummary");

  if (!summaryText) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning">
          {t("noSummaryFound")}
        </div>

        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/notes")}
        >
          {t("backToNotes")}
        </button>
      </div>
    );
  }

  const rtl = isRTLText(summaryText);
  const locale = i18n.language.startsWith("fa") ? "fa-IR" : "en-US";

  return (
    <div className="container-fluid">
      <div className="mb-4">
        <h1 className="fw-bold mb-2">
          {isSavedSummary
            ? `✨ ${t("savedSummary")}`
            : `✨ ${t("aiSummary")}`}
        </h1>

        {/* <p className="text-secondary mb-0">
          {isSavedSummary
            ? t("savedSummaryDescription")
            : t("aiSummaryDescription")}
        </p> */}
      </div>

      <div className="card border-0 shadow-sm">
        <div className="card-body p-4 p-md-5">

          <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mb-4">
            <div>
              <span className="badge bg-light text-dark border mb-3">
                {t("summary")}
              </span>

              <h3
                className={`fw-bold mb-0 ${
                  rtl ? "text-end" : "text-start"
                }`}
                dir={rtl ? "rtl" : "ltr"}
              >
                {summaryTitle}
              </h3>
            </div>

            {isSavedSummary && savedSummary?.CreatedAt && (
              <small className="text-secondary">
                {t("saved")}{" "}
                {new Date(savedSummary.CreatedAt).toLocaleDateString(locale)}
              </small>
            )}
          </div>

          <hr className="mb-4" />

          <div
            dir={rtl ? "rtl" : "ltr"}
            className={rtl ? "text-end" : "text-start"}
            style={{
              whiteSpace: "pre-wrap",
              lineHeight: "1.9"
            }}
          >
            {summaryText}
          </div>

          <hr className="my-4" />

          <div className="d-flex gap-2 flex-wrap">
            <button
              className="btn btn-outline-secondary"
              onClick={() =>
                navigate(isSavedSummary ? "/summaries" : "/notes")
              }
            >
              {isSavedSummary
                ? t("backToSavedSummaries")
                : t("backToNotes")}
            </button>

            {!isSavedSummary && (
              <button
                className={saved ? "btn btn-success" : "btn btn-primary"}
                onClick={handleSaveSummary}
                disabled={saving || saved}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    {t("saving")}
                  </>
                ) : saved ? (
                  t("summarySaved")
                ) : (
                  t("saveSummary")
                )}
              </button>
            )}
          </div>

          {saved && !isSavedSummary && (
            <div className="alert alert-success mt-4 mb-0">
              {t("summarySavedInLibrary")}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}