import { NavLink, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Sidebar() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/login");
  };

  const getLinkClass = ({ isActive }) =>
    `nav-link rounded px-3 py-2 text-nowrap ${
      isActive ? "bg-primary text-white" : "text-dark"
    }`;

  return (
    <aside
      className="bg-white border-end p-3"
      style={{
        width: "240px",
        minWidth: "240px",
        flexShrink: 0,
        minHeight: "calc(100vh - 64px)"
      }}
    >
      <p className="text-secondary small fw-semibold px-3 mb-3">
        {t("menu")}
      </p>

      <nav className="d-flex flex-column gap-1">
        <NavLink to="/dashboard" className={getLinkClass}>
          {t("dashboard")}
        </NavLink>

        <NavLink to="/notes" className={getLinkClass}>
           {t("myNotes")}
        </NavLink>

        <NavLink to="/upload" className={getLinkClass}>
           {t("uploadNote")}
        </NavLink>

        <NavLink to="/summaries" className={getLinkClass}>
          {t("savedSummaries")}
        </NavLink>

        <NavLink to="/quiz-history" className={getLinkClass}>
          {t("quizHistory")}
        </NavLink>

        <NavLink to="/flashcards" className={getLinkClass}>
          {t("myFlashcards")}
        </NavLink>
      </nav>

      <hr className="my-4" />

      <button
        className="btn btn-outline-danger w-100"
        onClick={handleLogout}
      >
        {t("logout")}
      </button>
    </aside>
  );
}