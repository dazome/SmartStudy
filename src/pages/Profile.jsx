import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import axios from "axios";

export default function Profile() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));

        if (!user) {
          navigate("/login");
          return;
        }

        const response = await axios.get(
          `http://localhost:5000/api/users/${user.id}`
        );

        setProfile(response.data);
      } catch (error) {
        console.error("Failed to load profile:", error);
        setError(t("profileLoadFailed"));
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [navigate, t]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div
          className="spinner-border text-primary"
          role="status"
        ></div>

        <p className="text-secondary mt-3">
          {t("loadingProfile")}
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

  if (!profile) {
    return (
      <div className="alert alert-warning">
        {t("profileNotFound")}
      </div>
    );
  }

  const locale = i18n.language.startsWith("fa")
    ? "fa-IR"
    : "en-US";

  return (
    <div className="container-fluid">

      <div className="mb-4">
        <h1 className="fw-bold mb-2">
          {t("myProfile")}
        </h1>

        <p className="text-secondary mb-0">
          {t("profileDescription")}
        </p>
      </div>

      <div className="row">
        <div className="col-lg-7 col-xl-6">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4 p-md-5">

              <div className="d-flex align-items-center gap-3 mb-4">
                <div
                  className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3"
                  style={{
                    width: "64px",
                    height: "64px",
                    flexShrink: 0
                  }}
                >
                  {profile.FullName?.charAt(0).toUpperCase()}
                </div>

                <div>
                  <h4 className="fw-bold mb-1">
                    {profile.FullName}
                  </h4>

                  <p className="text-secondary mb-0">
                    {t("studentAccount")}
                  </p>
                </div>
              </div>

              <hr className="my-4" />

              <div className="mb-4">
                <label className="form-label text-secondary small">
                  {t("fullName")}
                </label>

                <div className="fw-semibold">
                  {profile.FullName}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small">
                  {t("emailAddress")}
                </label>

                <div className="fw-semibold">
                  {profile.Email}
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label text-secondary small">
                  {t("memberSince")}
                </label>

                <div className="fw-semibold">
                  {profile.CreatedAt
                    ? new Date(profile.CreatedAt).toLocaleDateString(locale)
                    : "-"}
                </div>
              </div>

              <hr className="my-4" />

              <div className="d-flex gap-2 flex-wrap">
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/dashboard")}
                >
                  {t("backToDashboard")}
                </button>

                <button
                  className="btn btn-outline-danger"
                  onClick={handleLogout}
                >
                  {t("logout")}
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

    </div>
  );
}