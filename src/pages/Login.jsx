import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      setMessage("");

      const response = await axios.post(
        "http://localhost:5000/api/login",
        {
          email,
          password
        }
      );

      localStorage.setItem(
        "user",
        JSON.stringify(response.data.user)
      );

      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
      setMessage(t("invalidCredentials"));
    } finally {
      setLoading(false);
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
              {t("loginDescription")}
            </p>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">

              <h2 className="fw-bold mb-1">
                {t("welcomeBack")}
              </h2>

              <p className="text-secondary mb-4">
                {t("enterAccountInformation")}
              </p>

              <form onSubmit={handleSubmit}>

                <div className="mb-3">
                  <label className="form-label">
                    {t("email")}
                  </label>

                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("passwordPlaceholder")}
                    required
                  />
                </div>

                <button
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading
                    ? t("signingIn")
                    : t("signIn")}
                </button>

              </form>

              {message && (
                <div className="alert alert-danger mt-3 mb-0">
                  {message}
                </div>
              )}

              <p className="text-center text-secondary mt-4 mb-0">
                {t("dontHaveAccount")}{" "}

                <Link
                  to="/register"
                  className="text-decoration-none fw-semibold"
                >
                  {t("createOne")}
                </Link>
              </p>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}