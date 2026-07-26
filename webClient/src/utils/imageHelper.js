export const getProductImageUrl = (url) => {
  if (!url) return "https://images.unsplash.com/photo-1602928321679-560bb453f190?auto=format&fit=crop&w=400&q=80";
  
  // If it's a relative API image path
  if (url.startsWith("/api/products/image/")) {
    const apiBase = import.meta.env.VITE_API_BASE_URL || "https://admin-api.mangalik.store/api";
    const apiHost = apiBase.replace(/\/api$/, "") || ""; // removes trailing /api
    return `${apiHost}${url}`;
  }

  // If it's an absolute URL pointing to a different host port (e.g. database contains old localhost IP)
  if (url.startsWith("http") && url.includes("/api/products/image/")) {
    const parts = url.split("/api/products/image/");
    const mediaId = parts[1];
    const apiBase = import.meta.env.VITE_API_BASE_URL || "https://admin-api.mangalik.store/api";
    const apiHost = apiBase.replace(/\/api$/, "") || ""; // removes trailing /api
    return `${apiHost}/api/products/image/${mediaId}`;
  }

  return url;
};
