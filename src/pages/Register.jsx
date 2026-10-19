import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function Register() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");
      setSuccess(false);

      await axios.post(
        "http://localhost:5000/api/users",
        formData
      );

      setMessage(t("accountCreatedSuccessfully"));
      setSuccess(true);

      setFormData({
        fullName: "",
        email: "",
        password: ""
      });
    } catch (error) {
  console.error("Registration failed:", error);

  if (error.response?.status === 409) {
    setMessage(t("emailAlreadyExists"));
  } else {
    setMessage(t("registerFailed"));
  }

  setSuccess(false);
}
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-7 col-lg-5">

          <div className="text-center mb-4">
            <Link
              to="/"
              className="text-decoration-none text-dark"
            >
              <h3 className="fw-bold mb-2">
                🧠 {t("appName")}
              </h3>
            </Link>

            <p className="text-secondary">
              {t("registerDescription")}
            </p>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">

              <h2 className="fw-bold mb-1">
                {t("createAccount")}
              </h2>

              <p className="text-secondary mb-4">
                {t("registerFormDescription")}
              </p>

              <form onSubmit={handleSubmit}>

                <div className="mb-3">
                  <label className="form-label">
                    {t("fullName")}
                  </label>

                  <input
                    type="text"
                    name="fullName"
                    className="form-control"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder={t("fullNamePlaceholder")}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    {t("email")}
                  </label>

                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t("emailPlaceholder")}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">
                    {t("password")}
                  </label>

                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder={t("createPasswordPlaceholder")}
                    required
                  />
                </div>

                <button
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading
                    ? t("creatingAccount")
                    : t("createAccount")}
                </button>

              </form>

              {message && (
                <div
                  className={`alert mt-3 mb-0 ${
                    success
                      ? "alert-success"
                      : "alert-danger"
                  }`}
                >
                  {message}

                  {success && (
                    <div className="mt-2">
                      <button
                        className="btn btn-sm btn-success"
                        onClick={() => navigate("/login")}
                      >
                        {t("goToSignIn")}
                      </button>
                    </div>
                  )}
                </div>
              )}

              <p className="text-center text-secondary mt-4 mb-0">
                {t("alreadyHaveAccount")}{" "}

                <Link
                  to="/login"
                  className="text-decoration-none fw-semibold"
                >
                  {t("signIn")}
                </Link>
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}