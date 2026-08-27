import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://southcityhospital.in";
  const lastModified = new Date();

  const routes = [
    { url: "", priority: 1.0, changeFrequency: "weekly" as const },
    { url: "/doctors", priority: 0.9, changeFrequency: "daily" as const },
    { url: "/departments", priority: 0.9, changeFrequency: "monthly" as const },
    { url: "/facilities", priority: 0.8, changeFrequency: "monthly" as const },
    { url: "/about", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/contact", priority: 0.7, changeFrequency: "monthly" as const },
    { url: "/faq", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/testimonials", priority: 0.6, changeFrequency: "monthly" as const },
    { url: "/gallery", priority: 0.5, changeFrequency: "monthly" as const },
    { url: "/privacy-policy", priority: 0.3, changeFrequency: "yearly" as const },
    { url: "/terms-of-service", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route.url}`,
    lastModified,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));
}
