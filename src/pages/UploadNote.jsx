import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function UploadNote() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setSuccess(false);

    if (!title || !file) {
      setMessage(t("pleaseEnterTitleAndPdf"));
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));

    if (!user) {
      navigate("/login");
      return;
    }

    const formData = new FormData();

    formData.append("title", title);
    formData.append("userId", user.id);
    formData.append("file", file);

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:5000/api/notes",
        formData
      );

      setMessage(t("noteUploadedSuccessfully"));
      setSuccess(true);

      setTitle("");
      setFile(null);

      const fileInput = document.getElementById("pdfFile");

      if (fileInput) {
        fileInput.value = "";
      }

    } catch (error) {
      console.error("Upload failed:", error);

      setMessage(t("uploadFailed"));
      setSuccess(false);

    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid">

      <div className="mb-4">
        <h1 className="fw-bold mb-2">
          📤 {t("uploadNote")}
        </h1>

        {/* <p className="text-secondary mb-0">
          {t("uploadDescription")}
        </p> */}
      </div>

      <div className="row">
        <div className="col-12 col-xl-10">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">

              <h4 className="fw-bold mb-1">
                {t("addStudyMaterial")}
              </h4>

              <p className="text-secondary mb-4">
                {t("afterUploadingDescription")}
              </p>

              <form onSubmit={handleSubmit}>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    {t("noteTitle")}
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder={t("noteTitlePlaceholder")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    disabled={loading}
                    required
                  />

                  <div className="form-text">
                    {t("noteTitleHelp")}
                  </div>
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">
                    {t("pdfFile")}
                  </label>

                  <input
                    id="pdfFile"
                    type="file"
                    className="form-control"
                    accept=".pdf,application/pdf"
                    onChange={(e) => setFile(e.target.files[0])}
                    disabled={loading}
                    required
                  />

                  <div className="form-text">
                    {t("onlyPdfSupported")}
                  </div>
                </div>

                {file && (
                  <div className="bg-light border rounded p-3 mb-4">
                    <p className="small text-secondary mb-1">
                      {t("selectedFile")}
                    </p>

                    <p className="fw-semibold mb-0">
                      {file.name}
                    </p>
                  </div>
                )}

                <div className="d-flex gap-2 flex-wrap">
                  <button
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        {t("uploading")}
                      </>
                    ) : (
                      t("uploadNote")
                    )}
                  </button>

                  <Link
                    to="/notes"
                    className="btn btn-outline-secondary"
                  >
                    {t("cancel")}
                  </Link>
                </div>

              </form>

              {message && (
                <div
                  className={`alert mt-4 mb-0 ${
                    success ? "alert-success" : "alert-danger"
                  }`}
                >
                  {message}

                  {success && (
                    <div className="mt-3">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => navigate("/notes")}
                      >
                        {t("goToMyNotes")}
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}