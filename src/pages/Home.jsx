import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t,i18n } = useTranslation();

  const changeLanguage = (lang) => {
  i18n.changeLanguage(lang);

  document.documentElement.dir = lang === "fa" ? "rtl" : "ltr";
  document.documentElement.lang = lang;

  localStorage.setItem("language", lang);
};

  return (
    <div className="container py-5">

      <div className="d-flex justify-content-end mb-3">
      <select
        className="form-select form-select-sm"
        style={{ width: "110px" }}
        value={i18n.language.startsWith("fa") ? "fa" : "en"}
        onChange={(e) => changeLanguage(e.target.value)}
      >
        <option value="en">English</option>
        <option value="fa">فارسی</option>
      </select>
    </div>

      <div className="row align-items-center py-5">
        <div className="col-lg-7">

          <span className="badge bg-primary-subtle text-primary mb-3 px-3 py-2">
            {t("aiStudyCompanion")}
          </span>

          <h1 className="display-4 fw-bold mb-3">
            {t("studySmarter")}
            <br />
            {t("notHarder")}
          </h1>

          <p
            className="lead text-secondary mb-4"
            style={{ maxWidth: "620px" }}
          >
            {t("homeHeroDescription")}
          </p>

          <div className="d-flex gap-2 flex-wrap">
            <Link
              to="/register"
              className="btn btn-primary btn-lg px-4"
            >
              {t("getStarted")}
            </Link>

            <Link
              to="/login"
              className="btn btn-outline-secondary btn-lg px-4"
            >
              {t("signIn")}
            </Link>
          </div>

        </div>

        <div className="col-lg-5 mt-5 mt-lg-0">
          <div className="card border-0 shadow-sm">
            <div className="card-body p-4">

              <small className="text-secondary d-block mb-4">
                {t("howItWorks")}
              </small>

              <div className="d-flex gap-3 mb-4">
                <div className="fs-4">01</div>

                <div>
                  <h5 className="fw-bold mb-1">
                    {t("uploadYourNotes")}
                  </h5>

                  <p className="text-secondary mb-0">
                    {t("uploadYourNotesDescription")}
                  </p>
                </div>
              </div>

              <hr />

              <div className="d-flex gap-3 my-4">
                <div className="fs-4">02</div>

                <div>
                  <h5 className="fw-bold mb-1">
                    {t("letAiHelp")}
                  </h5>

                  <p className="text-secondary mb-0">
                    {t("letAiHelpDescription")}
                  </p>
                </div>
              </div>

              <hr />

              <div className="d-flex gap-3 mt-4">
                <div className="fs-4">03</div>

                <div>
                  <h5 className="fw-bold mb-1">
                    {t("reviewAndLearn")}
                  </h5>

                  <p className="text-secondary mb-0">
                    {t("reviewAndLearnDescription")}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <div className="py-5">
        <div className="text-center mb-5">

          <h2 className="fw-bold">
            {t("everythingYouNeed")}
          </h2>

          <p className="text-secondary">
            {t("featuresDescription")}
          </p>

        </div>

        <div className="row g-4">

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">

                <h4 className="fw-bold">
                  {t("smartSummaries")}
                </h4>

                <p className="text-secondary mb-0">
                  {t("smartSummariesDescription")}
                </p>

              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">

                <h4 className="fw-bold">
                  {t("aiQuizzes")}
                </h4>

                <p className="text-secondary mb-0">
                  {t("aiQuizzesDescription")}
                </p>

              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body p-4">

                <h4 className="fw-bold">
                  {t("flashcards")}
                </h4>

                <p className="text-secondary mb-0">
                  {t("flashcardsHomeDescription")}
                </p>

              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}