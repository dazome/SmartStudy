import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function MyFlashcards() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcardSets = async () => {
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:5000/api/flashcard-sets/user/${user.id}`
        );

        setSets(response.data);
      } catch (error) {
        console.error("Failed to load flashcard sets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcardSets();
  }, [navigate]);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      t("confirmDeleteFlashcards")
    );

    if (!confirmed) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/flashcard-sets/${id}`
      );

      setSets(
        sets.filter((set) => set.FlashcardSetId !== id)
      );
    } catch (error) {
      console.error("Failed to delete flashcards:", error);
      alert(t("deleteFlashcardsFailed"));
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
          {t("loadingFlashcards")}
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
            🃏 {t("myFlashcards")}
          </h1>

          {/* <p className="text-secondary mb-0">
            {t("myFlashcardsDescription")}
          </p> */}
        </div>

        <Link
          to="/notes"
          className="btn btn-primary"
        >
          {t("createFlashcards")}
        </Link>
      </div>

      {sets.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">

            <div className="fs-1 mb-3">
              🃏
            </div>

            <h4 className="fw-bold mb-2">
              {t("noFlashcardsYet")}
            </h4>

            <p className="text-secondary mb-4">
              {t("noFlashcardsDescription")}
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

          {sets.map((set) => (
            <div
              className="col-md-6 col-xl-4"
              key={set.FlashcardSetId}
            >
              <div className="card h-100 border-0 shadow-sm">
                <div className="card-body p-4 d-flex flex-column">

                  <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                    <span className="badge bg-light text-dark border">
                      {t("flashcards")}
                    </span>

                    <span className="text-secondary small">
                      {set.CardCount} {t("cards")}
                    </span>
                  </div>

                  <h5 className="fw-bold mb-2">
                    {set.Title}
                  </h5>

                  <p className="text-secondary small mb-4">
                    {t("created")}{" "}
                    {new Date(set.CreatedAt).toLocaleDateString(locale)}
                  </p>

                  <div className="d-flex gap-2 mt-auto">
                    <button
                      className="btn btn-outline-primary btn-sm"
                      onClick={() =>
                        navigate(`/flashcards/${set.FlashcardSetId}`)
                      }
                    >
                      {t("studyFlashcards")}
                    </button>

                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() =>
                        handleDelete(set.FlashcardSetId)
                      }
                    >
                      {t("delete")}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          ))}

        </div>
      )}

    </div>
  );
}