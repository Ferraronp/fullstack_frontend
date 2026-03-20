import { Helmet } from "react-helmet-async";

const BASE_URL = "http://localhost:5173";

export default function SEOMeta({ title, description, path, noindex = false }) {
  const fullTitle = title ? `${title} | Финансовый учёт` : "Финансовый учёт";
  const fullUrl = `${BASE_URL}${path || ""}`;
  const desc = description || "Личный финансовый учёт — управляйте доходами и расходами";

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={desc} />
      {noindex ? (
        <meta name="robots" content="noindex, nofollow" />
      ) : (
        <meta name="robots" content="index, follow" />
      )}
      <link rel="canonical" href={fullUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={desc} />
      <meta property="og:url" content={fullUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Финансовый учёт" />
    </Helmet>
  );
}
