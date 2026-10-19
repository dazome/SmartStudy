import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

const isRTLText = (text = "") => {
  return /[\u0600-\u06FF]/.test(text);
};

export default function Flashcards() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [flashcardSet, setFlashcardSet] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFlashcards = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/flashcard-sets/${id}`
        );

        setFlashcardSet(response.data.flashcardSet);
        setFlashcards(response.data.flashcards);
      } catch (error) {
        console.error("Failed to load flashcards:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [id]);

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

  if (!flashcardSet || flashcards.length === 0) {
    return (
      <div className="alert alert-info">
        {t("noFlashcardsFound")}
      </div>
    );
  }

  const card = flashcards[currentCard];
  const cardText = showAnswer ? card.BackText : card.FrontText;
  const rtl = isRTLText(cardText);

  const progress =
    ((currentCard + 1) / flashcards.length) * 100;

  const handleNext = () => {
    if (currentCard < flashcards.length - 1) {
      setCurrentCard(currentCard + 1);
      setShowAnswer(false);
    }
  };

  const handlePrevious = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1);
      setShowAnswer(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="text-center mb-4">
        <h1 className="fw-bold mb-2">
          {flashcardSet.Title}
        </h1>

        <p className="text-secondary mb-3">
          {t("card")} {currentCard + 1} {t("of")} {flashcards.length}
        </p>

        <div
          className="progress mx-auto"
          style={{
            maxWidth: "720px",
            height: "6px"
          }}
        >
          <div
            className="progress-bar"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      <div
        className="card border-0 shadow-sm mx-auto"
        style={{
          maxWidth: "720px",
          minHeight: "360px"
        }}
      >
        <div className="card-body p-4 p-md-5 d-flex flex-column justify-content-center">

          <p className="text-secondary text-center small fw-semibold mb-4">
            {showAnswer ? t("answer") : t("question")}
          </p>

          <div
            dir={rtl ? "rtl" : "ltr"}
            className={rtl ? "text-end" : "text-start"}
          >
            {showAnswer ? (
              <h4 className="fw-normal lh-base mb-0">
                {card.BackText}
              </h4>
            ) : (
              <h3 className="fw-bold lh-base mb-0">
                {card.FrontText}
              </h3>
            )}
          </div>

        </div>
      </div>

      <div className="text-center mt-4">
        <button
          className="btn btn-primary px-4"
          onClick={() => setShowAnswer(!showAnswer)}
        >
          {showAnswer
            ? t("showQuestion")
            : t("showAnswer")}
        </button>
      </div>

      <div
        className="d-flex justify-content-between mx-auto mt-4"
        style={{ maxWidth: "720px" }}
      >
        <button
          className="btn btn-outline-secondary"
          onClick={handlePrevious}
          disabled={currentCard === 0}
        >
          ← {t("previous")}
        </button>

        <button
          className="btn btn-outline-primary"
          onClick={handleNext}
          disabled={currentCard === flashcards.length - 1}
        >
          {t("next")} →
        </button>
      </div>

      <div className="text-center mt-4">
        <button
          className="btn btn-link text-decoration-none"
          onClick={() => navigate("/flashcards")}
        >
          {t("backToMyFlashcards")}
        </button>
      </div>
    </div>
  );
}