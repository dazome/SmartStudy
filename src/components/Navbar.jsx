import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const user = JSON.parse(localStorage.getItem("user"));

  const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);
  localStorage.setItem("language", lang);

  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
};

  return (
    <nav className="navbar navbar-dark bg-dark px-4 py-3">
      <div className="container-fluid p-0">
        <Link className="navbar-brand fw-bold m-0" to="/dashboard">
          🧠 {t("appName")}
        </Link>

        <div className="d-flex align-items-center gap-3">
          <select
            className="form-select form-select-sm"
            style={{ width: "110px" }}
            value={i18n.language.startsWith("fa") ? "fa" : "en"}
            onChange={(e) => changeLanguage(e.target.value)}
          >
            <option value="en">English</option>
            <option value="fa">فارسی</option>
          </select>

          <span className="text-light d-none d-md-inline">
            {user?.name}
          </span>

          <Link to="/profile" className="btn btn-outline-light btn-sm">
            {t("profile")}
          </Link>
        </div>
      </div>
    </nav>
  );
}