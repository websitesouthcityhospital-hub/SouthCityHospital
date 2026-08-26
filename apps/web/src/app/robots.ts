import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://southcityhospital.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/staff/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
