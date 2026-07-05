import { Helmet } from "react-helmet-async";

const SITE_URL = "https://ngurdamhoney.lovable.app";
const DEFAULT_IMAGE = `${SITE_URL}/__l5e/assets-v1/fb7ff46b-570e-4ca3-8688-938f709a845f/ngurdam-logo.png`;

interface SEOProps {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article" | "product";
  jsonLd?: object | object[];
  noIndex?: boolean;
}

export function SEO({ title, description, path = "", image, type = "website", jsonLd, noIndex }: SEOProps) {
  const url = `${SITE_URL}${path}`;
  const img = image || DEFAULT_IMAGE;
  const ldArr = jsonLd ? (Array.isArray(jsonLd) ? jsonLd : [jsonLd]) : [];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={type} />
      <meta property="og:image" content={img} />
      <meta property="og:site_name" content="Ngurdam Honey" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={img} />

      {ldArr.map((ld, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(ld)}</script>
      ))}
    </Helmet>
  );
}

export const ORG_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AB Sardauna Ngurdam Ventures",
  alternateName: "Ngurdam Pure Honey",
  url: SITE_URL,
  logo: DEFAULT_IMAGE,
  description: "Premium 100% pure, raw honey from the highlands of Gembu, Taraba State, Nigeria.",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Sokoto",
    addressRegion: "Sokoto State",
    addressCountry: "NG",
  },
};
