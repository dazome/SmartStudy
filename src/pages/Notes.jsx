import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function Notes() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summarizingId, setSummarizingId] = useState(null);
  const [generatingQuizId, setGeneratingQuizId] = useState(null);
  const [generatingFlashcardsId, setGeneratingFlashcardsId] = useState(null);

  useEffect(() => {
    const fetchNotes = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/notes/user/${user.id}`
        );

        setNotes(response.data);

      } catch (error) {
        console.error("Failed to load notes:", error);

      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [navigate]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      t("confirmDeleteNote")
    );

    if (!confirmDelete) {
      return;
    }

    try {
      await axios.delete(
        `http://localhost:5000/api/notes/${id}`
      );

      setNotes(
        notes.filter((note) => note.NoteId !== id)
      );

    } catch (error) {
      console.error("Delete failed:", error);
      alert(t("deleteNoteFailed"));
    }
  };

  const handleSummarize = async (id) => {
    try {
      setSummarizingId(id);

      const response = await axios.post(
        `http://localhost:5000/api/notes/${id}/summarize`
      );

      navigate(`/notes/${id}/summary`, {
        state: {
          title: response.data.title,
          summary: response.data.summary
        }
      });

    } catch (error) {
      console.error("Summary failed:", error);
      alert(t("summaryFailed"));

    } finally {
      setSummarizingId(null);
    }
  };

  const handleGenerateQuiz = async (id) => {
    try {
      setGeneratingQuizId(id);

      const user = JSON.parse(localStorage.getItem("user"));

      const response = await axios.post(
        `http://localhost:5000/api/notes/${id}/generate-quiz`,
        {
          userId: user.id
        }
      );

      navigate(`/quiz/${response.data.quizId}`);

    } catch (error) {
      console.error("Quiz generation failed:", error);
      alert(t("quizFailed"));

    } finally {
      setGeneratingQuizId(null);
    }
  };

  const handleGenerateFlashcards = async (id) => {
    try {
      setGeneratingFlashcardsId(id);

      const user = JSON.parse(localStorage.getItem("user"));

      const response = await axios.post(
        `http://localhost:5000/api/notes/${id}/generate-flashcards`,
        {
          userId: user.id,
          count: "auto"
        }
      );

      navigate(`/flashcards/${response.data.flashcardSetId}`);

    } catch (error) {
      console.error("Flashcard generation failed:", error);
      alert(t("flashcardsFailed"));

    } finally {
      setGeneratingFlashcardsId(null);
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
          {t("loadingNotes")}
        </p>
      </div>
    );
  }

  return (
    <div className="container-fluid">

      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-2">
            📚 {t("myNotes")}
          </h1>

         
        </div>

        <Link
          to="/upload"
          className="btn btn-primary"
        >
          {t("uploadNote")}
        </Link>
      </div>

      {notes.length === 0 ? (
        <div className="card border-0 shadow-sm">
          <div className="card-body text-center py-5">

            <h4 className="fw-bold mb-2">
              {t("noNotesYet")}
            </h4>

            <p className="text-secondary mb-4">
              {t("uploadFirstNoteDescription")}
            </p>

            <Link
              to="/upload"
              className="btn btn-primary"
            >
              {t("uploadFirstNote")}
            </Link>

          </div>
        </div>
      ) : (
        <div className="row g-4">

          {notes.map((note) => {
            const isBusy =
              summarizingId === note.NoteId ||
              generatingQuizId === note.NoteId ||
              generatingFlashcardsId === note.NoteId;

            const fileUrl =
              `http://localhost:5000/${note.FilePath.replace(/\\/g, "/")}`;

            const locale =
              i18n.language.startsWith("fa")
                ? "fa-IR"
                : "en-US";

            return (
              <div
                className="col-md-6 col-xl-4"
                key={note.NoteId}
              >
                <div className="card h-100 border-0 shadow-sm">

                  <div className="card-body p-4">
                    <div className="mb-3">
                      <span className="badge bg-light text-dark border">
                        PDF
                      </span>
                    </div>

                    <h5 className="fw-bold mb-2">
                      {note.Title}
                    </h5>

                    <p className="text-secondary small mb-2 text-truncate">
                      {note.FileName}
                    </p>

                    <p className="text-secondary small mb-4">
                      {t("uploaded")}{" "}
                      {new Date(note.UploadedAt).toLocaleDateString(locale)}
                    </p>

                    <div className="mb-3">
                      <p className="small text-secondary fw-semibold mb-2">
                        {t("studyTools")}
                      </p>

                      <div className="d-grid gap-2">

                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleSummarize(note.NoteId)}
                          disabled={isBusy}
                        >
                          {summarizingId === note.NoteId ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              {t("generatingSummary")}
                            </>
                          ) : (
                            t("generateSummary")
                          )}
                        </button>

                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleGenerateQuiz(note.NoteId)}
                          disabled={isBusy}
                        >
                          {generatingQuizId === note.NoteId ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              {t("generatingQuiz")}
                            </>
                          ) : (
                            t("generateQuiz")
                          )}
                        </button>

                        <button
                          className="btn btn-outline-primary"
                          onClick={() => handleGenerateFlashcards(note.NoteId)}
                          disabled={isBusy}
                        >
                          {generatingFlashcardsId === note.NoteId ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              {t("generatingFlashcards")}
                            </>
                          ) : (
                            t("generateFlashcards")
                          )}
                        </button>

                      </div>
                    </div>
                  </div>

                  <div className="card-footer bg-white border-top px-4 py-3">
                    <div className="d-flex justify-content-between align-items-center">

                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="btn btn-sm btn-outline-secondary"
                      >
                        {t("viewPdf")}
                      </a>

                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(note.NoteId)}
                        disabled={isBusy}
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