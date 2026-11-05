const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";
const apiOrigin = new URL(apiUrl, window.location.origin).origin;

export function mediaUrl(url?: string | null) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url)) return url;
  return `${apiOrigin}${url.startsWith("/") ? url : `/${url}`}`;
}
